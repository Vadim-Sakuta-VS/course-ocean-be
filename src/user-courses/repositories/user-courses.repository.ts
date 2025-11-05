import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { IncludeQueryOptions } from './user-courses.types';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FIND_COURSE_RELATIONS } from '../../cources/constants';
import { UserCoursesFilterDto } from '../dto/user-courses-filter.dto';
import { UserCourseEntity } from '../entities/user-course.entity';
import { IUserCourse } from '../interfaces/user-course.interface';

@Injectable()
export class UserCoursesRepository extends BaseRepository<UserCourseEntity> {
  constructor(
    @InjectRepository(UserCourseEntity)
    readonly repository: Repository<UserCourseEntity>,
  ) {
    super(repository);
  }

  private getFindRelations(
    includeOptions?: IncludeQueryOptions,
  ): FindOptionsRelations<UserCourseEntity> {
    return {
      user: includeOptions?.includeUser,
      course: includeOptions?.includeCourse ? FIND_COURSE_RELATIONS : undefined,
    };
  }

  createBulk(entities: IUserCourse[], transactionManger?: EntityManager) {
    return this.getRepository(transactionManger).save(entities);
  }

  async getOne(
    userId: string,
    courseId: string,
    includeOptions?: IncludeQueryOptions,
  ) {
    const userCourse = await this.repository.findOne({
      where: { userId, courseId },
      relations: this.getFindRelations(includeOptions),
    });
    if (!userCourse) {
      throw new NotFoundException(`User course doesn't exist`);
    }

    return userCourse;
  }

  async findAndCount(
    userId: string,
    { status, isMy, page, size }: UserCoursesFilterDto,
    includeOptions?: IncludeQueryOptions,
  ) {
    return this.repository.findAndCount({
      where: { userId: isMy ? userId : undefined, status },
      take: size,
      skip: page * size,
      relations: this.getFindRelations(includeOptions),
    });
  }

  async updateOne(partialEntity: DeepPartial<IUserCourse>) {
    return this.repository.save(partialEntity);
  }

  exists(
    whereOptions: FindOptionsWhere<UserCourseEntity>,
    includeOptions?: IncludeQueryOptions,
  ) {
    return this.repository.exists({
      where: whereOptions,
      relations: this.getFindRelations(includeOptions),
    });
  }

  findByUserAndCourseIds(userId: string, courseIds: string[]) {
    return this.repository.find({
      where: { userId, courseId: In(courseIds) },
    });
  }
}
