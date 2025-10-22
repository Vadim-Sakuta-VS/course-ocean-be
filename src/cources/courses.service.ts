import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import jsonpatch from 'fast-json-patch';
import { Brackets, DeepPartial, In, Repository } from 'typeorm';
import {
  COURSE_DURATION_FILTER_SQL_MAP,
  FIND_COURSE_RELATIONS,
} from './constants';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UploadLectureVideoDto } from './dto/upload-lecture-video.dto';
import { CourseEntity } from './entities/course.entity';
import { LectureContentEntity } from './entities/lecture-content.entity';
import { SectionContentEntity } from './entities/section-content.entity';
import { FileResponseDto } from '../common/dto/file-response.dto';
import { TransactionService } from '../common/services/transaction.service';
import { UsersService } from '../users/users.service';
import {
  PatchCourseOperationsDto,
  PatchedCourseDto,
} from './dto/patch-course.dto';
import {
  CoursePriceFilter,
  CoursesFilterDto,
  CourseSorting,
} from './dto/search-query.dto';
import { PageableContentDto } from '../auth/dto/pageable-content.dto';
import { S3Service } from '../common/services/s3';
import { FileEntity } from '../files/entities/file.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly coursesRepository: Repository<CourseEntity>,
    @InjectRepository(SectionContentEntity)
    private readonly sectionContentRepository: Repository<SectionContentEntity>,
    @InjectRepository(LectureContentEntity)
    private readonly lectureContentRepository: Repository<LectureContentEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    private readonly transactionService: TransactionService,
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  async create(userId: string, { topicId, ...dto }: CreateCourseDto) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const coursesRepository =
          transactionEntityManger.getRepository(CourseEntity);

        const course = await coursesRepository.save({
          ...dto,
          author: { id: userId },
          topic: { id: topicId },
        } as unknown as DeepPartial<CourseEntity>);
        course.author = await this.usersService.findOneById(userId);

        return plainToInstance(CourseResponseDto, course, {
          excludeExtraneousValues: true,
        });
      },
    );
  }

  async findCourses({
    creationDateStart,
    creationDateEnd,
    categoryIds,
    subcategoryIds,
    topicIds,
    // ratingFrom, TODO make rating filter after adding reviews module
    // ratingTo,
    level,
    duration,
    price,
    isActive,
    search,
    size,
    page,
    sorting,
  }: CoursesFilterDto): Promise<PageableContentDto<CourseResponseDto>> {
    const queryBuilder = this.coursesRepository.createQueryBuilder('c');
    queryBuilder
      .innerJoin('c.topic', 't')
      .innerJoin('t.subcategory', 's')
      .innerJoin('s.category', 'ct')
      .innerJoinAndSelect('c.author', 'a')
      .leftJoinAndSelect('c.sections', 'sc')
      .leftJoinAndSelect('sc.lectures', 'lc');

    queryBuilder.where('c.is_active = :isActive', { isActive });
    if (categoryIds?.length) {
      queryBuilder.andWhere('ct.id in (:...categoryIds)', { categoryIds });
    }
    if (subcategoryIds?.length) {
      queryBuilder.andWhere('s.id in (:...subcategoryIds)', { subcategoryIds });
    }
    if (topicIds?.length) {
      queryBuilder.andWhere('c.topic_id in (:...topicIds)', { topicIds });
    }
    if (level?.length) {
      queryBuilder.andWhere('c.level in (:...level)', { level });
    }
    if (creationDateStart) {
      queryBuilder.andWhere('c.created_at::date >= :creationDateStart', {
        creationDateStart,
      });
    }
    if (creationDateEnd) {
      queryBuilder.andWhere('c.created_at::date <= :creationDateEnd', {
        creationDateEnd,
      });
    }
    if (
      [CoursePriceFilter.PAID, CoursePriceFilter.FREE].every((p) =>
        price?.includes(p),
      )
    ) {
      queryBuilder.andWhere('c.price >= 0');
    } else if (price?.includes(CoursePriceFilter.FREE)) {
      queryBuilder.andWhere('c.price = 0 or c.discount = 100');
    } else if (price?.includes(CoursePriceFilter.PAID)) {
      queryBuilder.andWhere('c.price > 0 and c.discount != 100');
    }
    if (duration?.length) {
      const durationCondition = duration
        .map(
          (durationSearchValue) =>
            COURSE_DURATION_FILTER_SQL_MAP[durationSearchValue],
        )
        .join(' or ');
      queryBuilder.andWhere(durationCondition);
    }
    if (search) {
      const searchTerm = `%${search}%`;
      queryBuilder.andWhere(
        new Brackets((qb) =>
          qb
            .where('c.title ilike :searchTerm', { searchTerm })
            .orWhere('a.first_name ilike :searchTerm', { searchTerm })
            .orWhere('a.last_name ilike :searchTerm', { searchTerm })
            .orWhere(
              "concat(a.first_name, ' ', a.last_name) ilike :searchTerm",
              { searchTerm },
            )
            .orWhere(
              "concat(a.last_name, ' ', a.first_name) ilike :searchTerm",
              { searchTerm },
            ),
        ),
      );
    }

    queryBuilder.orderBy({ 'sc.order': 'ASC', 'lc.order': 'ASC' });

    if (sorting === CourseSorting.NEW) {
      queryBuilder.addOrderBy('c.createdAt', 'DESC');
    } else if (sorting === CourseSorting.LOWEST_PRICE) {
      queryBuilder.addOrderBy('c.price', 'ASC');
    } else if (sorting === CourseSorting.HIGHEST_PRICE) {
      queryBuilder.addOrderBy('c.price', 'DESC');
    } else if (sorting === CourseSorting.POPULAR) {
      // TODO make after adding reviews and bought user courses
    }

    queryBuilder.take(size);
    queryBuilder.skip(size * page);

    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      content: courses.map((course) =>
        plainToInstance(CourseResponseDto, course, {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }

  private async _findOneCourse(id: string, withRelations = false) {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: withRelations ? FIND_COURSE_RELATIONS : undefined,
      order: withRelations
        ? {
            sections: {
              order: 'ASC',
              lectures: {
                order: 'ASC',
              },
            },
          }
        : undefined,
    });
    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    return course;
  }

  async findOneCourse(id: string, isOnlyActive = true) {
    const course = await this._findOneCourse(id, true);
    if (!course.isActive && isOnlyActive) {
      throw new ForbiddenException();
    }

    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }

  async deleteCourse(userId: string, id: string) {
    // TODO make check if course bought (throw error or do nothing)
    const course = await this._findOneCourse(id);
    this.checkUserPermission(course, userId);
    const result = await this.coursesRepository.delete({
      id,
      authorId: userId,
    });

    return !!result.affected;
  }

  async deleteBulkCourses(userId: string, ids: string[]) {
    // TODO make check if courses bought (throw error or skip such courses)
    const courses = await this.coursesRepository.find({
      where: { id: In(ids) },
    });
    courses.forEach((c) => this.checkUserPermission(c, userId));
    const result = await this.coursesRepository.delete({
      id: In(ids),
      authorId: userId,
    });

    return !!result.affected;
  }

  async patchCourse(
    userId: string,
    id: string,
    {
      requirements = [],
      learningSkills = [],
      sections = [],
      ...patchedCourse
    }: PatchedCourseDto,
  ) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManager) => {
        const course = await this._findOneCourse(id, true);
        this.checkUserPermission(course, userId);
        const resultSections = sections.reduce((accSections, section) => {
          if (!section.id) {
            return [...accSections, section];
          }
          const sectionIndex = course.sections.findIndex(
            (s) => s.id === section.id,
          );
          accSections[sectionIndex] = {
            ...accSections[sectionIndex],
            ...section,
            lectures: (section.lectures || []).reduce(
              (accLectures, lecture) => {
                if (!lecture.id) {
                  return [...accLectures, lecture];
                }
                const lectureIndex = course.sections[
                  sectionIndex
                ].lectures.findIndex((l) => l.id === lecture.id);

                accLectures[lectureIndex] = {
                  ...accLectures[lectureIndex],
                  ...lecture,
                };

                return accLectures;
              },
              accSections[sectionIndex].lectures,
            ) as LectureContentEntity[],
          };

          return accSections;
        }, course.sections);

        const coursesRepository =
          transactionEntityManager.getRepository(CourseEntity);
        const updatedCourse = await coursesRepository.save({
          ...course,
          ...patchedCourse,
          requirements: [...course.requirements, ...(requirements || [])],
          learningSkills: [...course.learningSkills, ...(learningSkills || [])],
          sections: resultSections,
        });

        return plainToInstance(CourseResponseDto, updatedCourse, {
          excludeExtraneousValues: true,
        });
      },
    );
  }

  async patchCourseViaJsonPatch(
    userId: string,
    id: string,
    dto: PatchCourseOperationsDto,
  ) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const course = await this._findOneCourse(id, true);
        this.checkUserPermission(course, userId);
        const operations = dto.operations.filter(
          (op) => op.path !== '/isActive',
        );
        const patchResult = jsonpatch.applyPatch<CourseEntity>(
          jsonpatch.deepClone(course),
          operations,
        );
        const validationErrors = await validate(
          plainToInstance(PatchedCourseDto, patchResult.newDocument, {
            excludeExtraneousValues: true,
          }),
          {
            validationError: {
              target: false,
              value: false,
            },
          },
        );
        if (validationErrors.length) {
          throw new BadRequestException(validationErrors);
        }
        const courseRepository =
          transactionEntityManger.getRepository(CourseEntity);
        const updatedCourse = courseRepository.save(patchResult.newDocument);

        return plainToInstance(CourseResponseDto, updatedCourse, {
          excludeExtraneousValues: true,
        });
      },
    );
  }

  async activateCourse(userId: string, id: string) {
    const course = await this._findOneCourse(id);
    this.checkUserPermission(course, userId);
    course.isActive = true;
    await this.coursesRepository.save(course);

    return true;
  }

  async deactivateCourse(userId: string, id: string) {
    const course = await this._findOneCourse(id);
    this.checkUserPermission(course, userId);
    course.isActive = false;
    // TODO make check if course bought (throw error or do nothing)
    await this.coursesRepository.save(course);

    return true;
  }

  private checkUserPermission(course: CourseEntity, userId: string) {
    if (course.authorId !== userId) {
      throw new ForbiddenException();
    }
  }

  async deleteBulkCourseSections(
    userId: string,
    courseId: string,
    sectionsIds: string[],
  ) {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const result = await this.sectionContentRepository.delete({
      course: { id: courseId },
      id: In(sectionsIds),
    });

    return !!result.affected;
  }

  async deleteCourseSection(
    userId: string,
    courseId: string,
    sectionId: string,
  ) {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const result = await this.sectionContentRepository.delete({
      course: { id: courseId },
      id: sectionId,
    });

    return !!result.affected;
  }

  async deleteBulkCourseLectures(
    userId: string,
    courseId: string,
    sectionId: string,
    lecturesIds: string[],
  ) {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const result = await this.lectureContentRepository.delete({
      section: {
        id: sectionId,
        course: { id: courseId },
      },
      id: In(lecturesIds),
    });

    return !!result.affected;
  }

  async deleteCourseLecture(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
  ) {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const result = await this.lectureContentRepository.delete({
      section: {
        id: sectionId,
        course: { id: courseId },
      },
      id: lectureId,
    });

    return !!result.affected;
  }

  async deleteCourseRequirement(
    userId: string,
    courseId: string,
    value: string,
  ) {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const result = await this.coursesRepository.update(
      { id: courseId },
      {
        requirements: course.requirements.filter(
          (requirement) => requirement !== value,
        ),
      },
    );

    return !!result.affected;
  }

  async deleteCourseLearningSkill(
    userId: string,
    courseId: string,
    value: string,
  ) {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const result = await this.coursesRepository.update(
      { id: courseId },
      {
        learningSkills: course.learningSkills.filter(
          (learningSkill) => learningSkill !== value,
        ),
      },
    );

    return !!result.affected;
  }

  async uploadCourseCover(
    userId: string,
    courseId: string,
    file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const { prefixId, fileKey } = await this.s3Service.uploadObject({
      filename: file.originalname,
      contentType: file.mimetype,
      directories: ['courses', 'images', 'covers'],
      isPublic: true,
      buffer: file.buffer,
    });
    course.coverFile = this.filesRepository.create({
      id: prefixId,
      originalFilename: file.originalname,
      storageFilePath: fileKey,
      mimeType: file.mimetype,
      size: file.size,
      isPublic: true,
    });
    await this.coursesRepository.save(course);

    return {
      id: prefixId,
      url: this.s3Service.getPublicUrl(fileKey),
    };
  }

  async deleteCourseCover(userId: string, courseId: string, fileId: string) {
    const course = await this._findOneCourse(courseId, true);
    this.checkUserPermission(course, userId);
    if (course.coverFile.id !== fileId) {
      throw new ConflictException(
        `File id ${fileId} don't match course ${courseId}`,
      );
    }
    await this.filesRepository.delete({ id: fileId });
    await this.s3Service
      .deleteObject(course.coverFile.storageFilePath, course.coverFile.isPublic)
      .catch(() => {});

    return true;
  }

  async uploadLectureVideo(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    file: Express.Multer.File,
    { isPublic, duration }: UploadLectureVideoDto,
  ): Promise<FileResponseDto> {
    const course = await this._findOneCourse(courseId);
    this.checkUserPermission(course, userId);
    const { prefixId, fileKey } = await this.s3Service.uploadObject({
      isPublic,
      filename: file.originalname,
      contentType: file.mimetype,
      directories: ['courses', 'lectures', 'video'],
      buffer: file.buffer,
    });
    await this.lectureContentRepository.save({
      id: lectureId,
      videoFile: {
        isPublic,
        duration,
        id: prefixId,
        originalFilename: file.originalname,
        storageFilePath: fileKey,
        mimeType: file.mimetype,
        size: file.size,
      },
      section: { id: sectionId, course: { id: courseId } },
    });

    return {
      id: prefixId,
      url: isPublic
        ? this.s3Service.getPublicUrl(fileKey)
        : await this.s3Service.generateViewUrl(fileKey, duration + 300),
    };
  }

  private async getCourseVideoLecture(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    fileId: string,
  ) {
    const course = await this._findOneCourse(courseId, true);
    this.checkUserPermission(course, userId);
    const section = course.sections.find(
      (section) =>
        section.id === sectionId &&
        section.lectures.some(
          (lecture) =>
            lecture.id === lectureId && lecture.videoFile.id === fileId,
        ),
    );
    if (!section) {
      throw new ConflictException(
        `File id ${fileId} don't match course ${courseId}`,
      );
    }

    return section.lectures.find(
      ({ videoFile }) => videoFile.id === fileId,
    ) as LectureContentEntity;
  }

  async deleteLectureVideo(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    fileId: string,
  ) {
    const lecture = await this.getCourseVideoLecture(
      userId,
      courseId,
      sectionId,
      lectureId,
      fileId,
    );
    await this.filesRepository.delete({ id: fileId });
    await this.s3Service
      .deleteObject(
        lecture.videoFile.storageFilePath,
        lecture.videoFile.isPublic,
      )
      .catch(() => {});

    return true;
  }

  async updatePublicStateLectureVideo(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    fileId: string,
    isPublic: boolean,
  ) {
    const lecture = await this.getCourseVideoLecture(
      userId,
      courseId,
      sectionId,
      lectureId,
      fileId,
    );
    if (isPublic) {
      await this.s3Service.makeObjectPublic(lecture.videoFile.storageFilePath);
    } else {
      await this.s3Service.makeObjectPrivate(lecture.videoFile.storageFilePath);
    }
    const result = await this.filesRepository.update(
      { id: fileId },
      { isPublic },
    );

    return !!result.affected;
  }
}
