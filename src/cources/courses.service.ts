import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import jsonpatch from 'fast-json-patch';
import { DeepPartial, In, Repository } from 'typeorm';
import { COURSE_DURATION_FILTER_SQL_MAP } from './constants';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from './entities/course.entity';
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

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private coursesRepository: Repository<CourseEntity>,
    private transactionService: TransactionService,
    private usersService: UsersService,
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
    size,
    page,
    sorting,
  }: CoursesFilterDto): Promise<PageableContentDto<CourseResponseDto>> {
    const queryBuilder = this.coursesRepository.createQueryBuilder('c');
    queryBuilder
      .innerJoin('c.topic', 't')
      .innerJoin('t.subcategory', 's')
      .innerJoin('s.category', 'ct')
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
      const durationHavingCondition = duration
        .map(
          (durationSearchValue) =>
            COURSE_DURATION_FILTER_SQL_MAP[durationSearchValue],
        )
        .join(' or ');
      const subQuery = queryBuilder
        .subQuery()
        .select('sub_c.id')
        .from(CourseEntity, 'sub_c')
        .leftJoin('sub_c.sections', 'sub_sc')
        .leftJoin('sub_sc.lectures', 'sub_lc')
        .groupBy('sub_c.id')
        .having(durationHavingCondition)
        .getQuery();
      queryBuilder.andWhere(`c.id IN ${subQuery}`);
    }

    if (sorting === CourseSorting.NEW) {
      queryBuilder.orderBy('c.createdAt', 'DESC');
    } else if (sorting === CourseSorting.LOWEST_PRICE) {
      queryBuilder.orderBy('c.price', 'ASC');
    } else if (sorting === CourseSorting.HIGHEST_PRICE) {
      queryBuilder.orderBy('c.price', 'DESC');
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

  async findOneCourse(id: string, withRelations = false) {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: withRelations
        ? {
            sections: {
              lectures: true,
            },
          }
        : undefined,
      order: {
        sections: {
          order: 'ASC',
          lectures: {
            order: 'ASC',
          },
        },
      },
    });
    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    return course;
  }

  async deleteCourse(userId: string, id: string) {
    const course = await this.findOneCourse(id);
    this.checkUserPermission(course, userId);
    const result = await this.coursesRepository.delete({
      id,
      authorId: userId,
    });

    return !!result.affected;
  }

  async deleteBulkCourses(userId: string, ids: string[]) {
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

  async patchCourse(userId: string, id: string, dto: PatchCourseOperationsDto) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const course = await this.findOneCourse(id, true);
        this.checkUserPermission(course, userId);
        course.author = await this.usersService.findOneById(userId);
        const patchResult = jsonpatch.applyPatch<CourseEntity>(
          jsonpatch.deepClone(course),
          dto.operations,
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

  private checkUserPermission(course: CourseEntity, userId: string) {
    if (course.authorId !== userId) {
      throw new ForbiddenException();
    }
  }
}
