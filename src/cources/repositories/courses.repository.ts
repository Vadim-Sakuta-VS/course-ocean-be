import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, In, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { COURSE_DURATION_FILTER_SQL_MAP } from '../constants';
import { IncludeQueryOptions } from './courses.types';
import { CourseEntity } from '../entities/course.entity';
import { ICourse, ICreateCourse } from '../interfaces/course.interface';
import {
  CoursePriceFilter,
  CourseSorting,
  ICoursesFilter,
} from '../interfaces/courses-filter.interface';

@Injectable()
export class CoursesRepository extends BaseRepository<CourseEntity> {
  constructor(
    @InjectRepository(CourseEntity)
    repository: Repository<CourseEntity>,
  ) {
    super(repository);
  }

  async findAndCount({
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
  }: ICoursesFilter) {
    const queryBuilder = this.repository.createQueryBuilder('c');
    queryBuilder
      .innerJoin('c.topic', 't')
      .innerJoin('t.subcategory', 's')
      .innerJoin('s.category', 'ct')
      .innerJoinAndSelect('c.author', 'a')
      .leftJoinAndSelect('c.coverFile', 'cf')
      .leftJoinAndSelect('c.sections', 'sc')
      .leftJoinAndSelect('sc.lectures', 'lc')
      .leftJoinAndSelect('lc.videoFile', 'vf');

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

    return queryBuilder.getManyAndCount();
  }

  findByIds(courseIds: string[]) {
    return this.repository.find({ where: { id: In(courseIds) } });
  }

  create(entity: ICreateCourse) {
    return this.repository.save(entity);
  }

  async getOneById(id: string, includeOptions?: IncludeQueryOptions) {
    const course = await this.findOneById(id, includeOptions);
    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    return course;
  }

  findOneById(id: string, includeOptions?: IncludeQueryOptions) {
    return this.repository.findOne({
      where: { id },
      relations: {
        author: true,
        coverFile: true,
        sections: includeOptions?.includeSections
          ? { lectures: { videoFile: true } }
          : undefined,
      },
      order: includeOptions?.includeSections
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
  }

  async deleteBulkByIds(authorId: string, courseIds: string[]) {
    const orders = await this.repository.find({
      where: { authorId, id: In(courseIds) },
    });
    const ids = orders.map(({ id }) => id);

    await this.repository.delete({
      authorId,
      id: In(ids),
    });

    return {
      deletedIds: ids,
    };
  }

  updateOne(entity: ICourse, transactionManager?: EntityManager) {
    return this.getRepository(transactionManager).save(entity);
  }
}
