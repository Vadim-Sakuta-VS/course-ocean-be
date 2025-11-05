import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CreateLectureProgressDto } from '../dto/create-lecture-progress.dto';
import { UserCourseLectureProgressEntity } from '../entities/user-course-lecture-progress.entity';

@Injectable()
export class UserCourseLecturesProgressRepository extends BaseRepository<UserCourseLectureProgressEntity> {
  constructor(
    @InjectRepository(UserCourseLectureProgressEntity)
    repository: Repository<UserCourseLectureProgressEntity>,
  ) {
    super(repository);
  }

  create(userId: string, dto: CreateLectureProgressDto) {
    return this.repository.save({ userId, ...dto });
  }

  exists(whereOptions: FindOptionsWhere<UserCourseLectureProgressEntity>) {
    return this.repository.exists({ where: whereOptions });
  }

  async getOne(userId: string, lectureId: string) {
    const lectureProgress = await this.repository.findOne({
      where: { userId, lectureId },
    });
    if (!lectureProgress) {
      throw new NotFoundException(
        `Lecture progress ${lectureId} not found for current user`,
      );
    }

    return lectureProgress;
  }

  updateOne(entity: DeepPartial<UserCourseLectureProgressEntity>) {
    return this.repository.save(entity);
  }

  update(
    whereOptions: FindOptionsWhere<UserCourseLectureProgressEntity>,
    entity: QueryDeepPartialEntity<UserCourseLectureProgressEntity>,
  ) {
    return this.repository.update(whereOptions, entity);
  }

  findAll(options: FindManyOptions<UserCourseLectureProgressEntity>) {
    return this.repository.find({
      ...options,
      order: {
        updatedAt: 'DESC',
        ...options.order,
      },
    });
  }
}
