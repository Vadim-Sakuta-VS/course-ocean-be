import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import jsonpatch from 'fast-json-patch';
import { CourseResponseDto } from './dto/course-response.dto';
import { UploadLectureVideoDto } from './dto/upload-lecture-video.dto';
import { CourseEntity } from './entities/course.entity';
import { LectureContentEntity } from './entities/lecture-content.entity';
import { DEFAULT_FILE_VIEW_TTL } from '../common/constants';
import { ICourse, ICreateCourse } from './interfaces/course.interface';
import { ICoursesFilter } from './interfaces/courses-filter.interface';
import { CoursesRepository } from './repositories/courses.repository';
import { LectureContentRepository } from './repositories/lecture-content.repository';
import { FileResponseDto } from '../common/dto/file-response.dto';
import { TransactionService } from '../common/services/transaction.service';
import { UsersService } from '../users/users.service';
import {
  PatchCourseOperationsDto,
  PatchedCourseDto,
} from './dto/patch-course.dto';
import { SectionContentRepository } from './repositories/section-content.repository';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { S3Service } from '../common/services/s3';
import { DictionariesService } from '../dictionaries/dictionaries.service';
import { FileEntity } from '../files/entities/file.entity';
import { FilesRepository } from '../files/repositories/files.repository';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly sectionContentRepository: SectionContentRepository,
    private readonly lectureContentRepository: LectureContentRepository,
    private readonly filesRepository: FilesRepository,
    private readonly transactionService: TransactionService,
    private readonly usersService: UsersService,
    private readonly dictionariesService: DictionariesService,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: ICreateCourse) {
    if (dto.topicId) {
      await this.dictionariesService.findOneTopic(dto.topicId);
    }
    const course = await this.coursesRepository.create(dto);
    course.author = await this.usersService.getOneById(dto.authorId);

    return this.prepareCourseResponse(course);
  }

  async findCourses(
    filter: ICoursesFilter,
  ): Promise<PageableContentDto<CourseResponseDto>> {
    const [courses, total] = await this.coursesRepository.findAndCount(filter);

    return {
      page: filter.page,
      size: filter.size,
      total,
      totalPages: Math.ceil(total / filter.size),
      content: await Promise.all(
        courses.map((course) => this.prepareCourseResponse(course)),
      ),
    };
  }

  async findOneCourse(id: string, isOnlyActive = true) {
    const course = await this.coursesRepository.getOneById(id, {
      includeSections: true,
    });
    if (!course.isActive && isOnlyActive) {
      throw new ForbiddenException();
    }

    return this.prepareCourseResponse(course);
  }

  async deleteBulkCourses(userId: string, ids: string[]) {
    // TODO make check if courses bought (throw error or skip such courses)
    const courses = await this.coursesRepository.findByIds(ids);
    courses.forEach((c) => this.checkUserCoursePermission(c, userId));

    return this.coursesRepository.deleteBulkByIds(userId, ids);
  }

  async patchCourse(
    userId: string,
    id: string,
    { sections = [], ...patchedCourse }: ICourse,
  ) {
    return this.transactionService.runInTransaction(
      async (transactionManager) => {
        const course = await this.coursesRepository.getOneById(id, {
          includeSections: true,
        });
        this.checkUserCoursePermission(course, userId);
        if (patchedCourse.topicId && course.topicId !== patchedCourse.topicId) {
          await this.dictionariesService.findOneTopic(patchedCourse.topicId);
        }
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
                } as LectureContentEntity;

                return accLectures;
              },
              accSections[sectionIndex].lectures,
            ) as LectureContentEntity[],
          };

          return accSections;
        }, course.sections);

        const updatedCourse = await this.coursesRepository.updateOne(
          {
            ...course,
            ...patchedCourse,
            sections: resultSections,
          },
          transactionManager,
        );

        return this.prepareCourseResponse(updatedCourse);
      },
    );
  }

  async patchCourseViaJsonPatch(
    userId: string,
    id: string,
    dto: PatchCourseOperationsDto,
  ) {
    return this.transactionService.runInTransaction(
      async (transactionManger) => {
        const course = await this.coursesRepository.getOneById(id, {
          includeSections: true,
        });
        this.checkUserCoursePermission(course, userId);
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

        const updatedCourse = await this.coursesRepository.updateOne(
          patchResult.newDocument,
          transactionManger,
        );

        return this.prepareCourseResponse(updatedCourse);
      },
    );
  }

  async activateCourse(userId: string, id: string) {
    const course = await this.coursesRepository.getOneById(id);
    this.checkUserCoursePermission(course, userId);
    course.isActive = true;
    await this.coursesRepository.updateOne(course);

    return true;
  }

  async deactivateCourse(userId: string, id: string) {
    const course = await this.coursesRepository.getOneById(id);
    this.checkUserCoursePermission(course, userId);
    course.isActive = false;
    // TODO make check if course bought (throw error or do nothing)
    await this.coursesRepository.updateOne(course);

    return true;
  }

  private checkUserCoursePermission(course: CourseEntity, userId: string) {
    if (course.authorId !== userId) {
      throw new ForbiddenException();
    }
  }

  private async checkUserSectionsPermission(
    sectionIds: string[],
    userId: string,
  ) {
    const isAccessGranted =
      await this.sectionContentRepository.checkSectionsBelongToAuthor(
        userId,
        sectionIds,
      );
    if (!isAccessGranted) {
      throw new ForbiddenException();
    }
  }

  private async checkUserLecturesPermission(
    lecturesIds: string[],
    userId: string,
  ) {
    const isAccessGranted =
      await this.lectureContentRepository.checkLecturesBelongToAuthor(
        userId,
        lecturesIds,
      );
    if (!isAccessGranted) {
      throw new ForbiddenException();
    }
  }

  async deleteBulkCourseSections(userId: string, sectionsIds: string[]) {
    await this.checkUserSectionsPermission(sectionsIds, userId);

    return this.sectionContentRepository.deleteBulkByIds(sectionsIds);
  }

  async deleteBulkCourseLectures(userId: string, lecturesIds: string[]) {
    await this.checkUserLecturesPermission(lecturesIds, userId);

    return this.lectureContentRepository.deleteBulkByIds(lecturesIds);
  }

  async uploadCourseCover(
    userId: string,
    courseId: string,
    file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    return this.transactionService.runInTransaction(
      async (transactionManger) => {
        const course = await this.coursesRepository.getOneById(courseId);
        this.checkUserCoursePermission(course, userId);
        const { prefixId, fileKey } = await this.s3Service.uploadObject({
          filename: file.originalname,
          contentType: file.mimetype,
          directories: ['courses', 'images', 'covers'],
          isPublic: true,
          buffer: file.buffer,
        });
        course.coverFile = await this.filesRepository.create(
          {
            id: prefixId,
            originalFilename: file.originalname,
            storageFilePath: fileKey,
            mimeType: file.mimetype,
            size: file.size,
            isPublic: true,
          },
          transactionManger,
        );
        await this.coursesRepository.updateOne(course, transactionManger);

        return {
          id: prefixId,
          url: this.s3Service.getPublicUrl(fileKey),
          originalFilename: file.originalname,
        };
      },
    );
  }

  async deleteCourseCover(userId: string, courseId: string, fileId: string) {
    const course = await this.coursesRepository.getOneById(courseId, {
      includeSections: true,
    });
    this.checkUserCoursePermission(course, userId);
    if (course.coverFile.id !== fileId) {
      throw new ConflictException(
        `File id ${fileId} don't match course ${courseId}`,
      );
    }
    await this.filesRepository.deleteById(fileId);
    await this.s3Service
      .deleteObject(course.coverFile.storageFilePath, course.coverFile.isPublic)
      .catch(() => {});

    return true;
  }

  async uploadLectureVideo(
    userId: string,
    lectureId: string,
    file: Express.Multer.File,
    { isPublic, duration }: UploadLectureVideoDto,
  ): Promise<FileResponseDto> {
    await this.checkUserLecturesPermission([lectureId], userId);
    const { prefixId, fileKey } = await this.s3Service.uploadObject({
      isPublic,
      filename: file.originalname,
      contentType: file.mimetype,
      directories: ['courses', 'lectures', 'video'],
      buffer: file.buffer,
    });
    await this.lectureContentRepository.updateOne({
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
    });

    return {
      id: prefixId,
      url: isPublic
        ? this.s3Service.getPublicUrl(fileKey)
        : await this.s3Service.generateViewUrl(
            fileKey,
            duration + DEFAULT_FILE_VIEW_TTL,
          ),
      originalFilename: file.originalname,
    };
  }

  async deleteLectureVideo(userId: string, lectureId: string, fileId: string) {
    await this.checkUserLecturesPermission([lectureId], userId);
    const lecture = await this.lectureContentRepository.getOneById(lectureId, {
      includeVideoFile: true,
    });
    await this.filesRepository.deleteById(fileId);
    if (lecture.videoFile) {
      await this.s3Service
        .deleteObject(
          lecture.videoFile?.storageFilePath,
          lecture.videoFile.isPublic,
        )
        .catch(() => {});
    }

    return { deletedId: fileId };
  }

  async updatePublicStateLectureVideo(
    userId: string,
    fileId: string,
    isPublic: boolean,
  ) {
    const lecture =
      await this.lectureContentRepository.getOneByVideoFileId(fileId);
    await this.checkUserLecturesPermission([lecture.id], userId);
    if (lecture.videoFile) {
      if (isPublic) {
        await this.s3Service.makeObjectPublic(
          lecture.videoFile.storageFilePath,
        );
      } else {
        await this.s3Service.makeObjectPrivate(
          lecture.videoFile.storageFilePath,
        );
      }
    }

    return true;
  }

  async prepareCourseResponse(
    course: CourseEntity,
    withPrivateContent = false,
  ): Promise<CourseResponseDto> {
    const getFileResponse = async (
      file: FileEntity | null,
    ): Promise<FileResponseDto | null> => {
      if (!file?.id) {
        return null;
      }

      return {
        id: file.id,
        url: file.isPublic
          ? this.s3Service.getPublicUrl(file.storageFilePath)
          : withPrivateContent
            ? await this.s3Service.generateViewUrl(
                file.storageFilePath,
                (file.duration || 0) + DEFAULT_FILE_VIEW_TTL,
              )
            : null,
        duration: file.duration,
        originalFilename: file.originalFilename,
      };
    };
    const res = plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
    res.cover = await getFileResponse(course.coverFile);
    res.sections = await Promise.all(
      res.sections.map(async (section, sIndex) => {
        section.lectures = await Promise.all(
          section.lectures.map(async (lecture, lIndex) => {
            lecture.video = await getFileResponse(
              course.sections[sIndex].lectures[lIndex].videoFile,
            );

            return lecture;
          }),
        );

        return section;
      }),
    );

    return res;
  }

  getCoursePrice({
    price,
    discount,
    discountStartDate,
    discountEndDate,
  }: CourseResponseDto) {
    const currentDate = new Date();
    const isActiveDiscount =
      !!discount &&
      (!discountStartDate || currentDate >= discountStartDate) &&
      (!discountEndDate || currentDate <= discountEndDate);
    if (isActiveDiscount) {
      return (price * (100 - discount)) / 100;
    }

    return price;
  }

  checkExistAllIds(courseIds: string[]) {
    return this.coursesRepository.checkExistAllIds(courseIds);
  }
}
