import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { WishListEntity } from '../entities/wish-list.entity';

@Injectable()
export class WishListRepository extends BaseRepository<WishListEntity> {
  constructor(
    @InjectRepository(WishListEntity)
    readonly repository: Repository<WishListEntity>,
  ) {
    super(repository);
  }

  find(userId: string, courseIds: string[]) {
    return this.repository.find({
      where: { userId, courseId: In(courseIds) },
    });
  }

  upsertBulk(userId: string, courseIds: string[]) {
    return this.repository.upsert(
      courseIds.map((courseId) => ({ userId, courseId })),
      {
        conflictPaths: ['userId', 'courseId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  async deleteBulk(userId: string, courseIds: string[]) {
    const entities = await this.find(userId, courseIds);
    const ids = entities.map(({ courseId }) => courseId);

    await this.repository.delete({ userId, courseId: In(ids) });

    return { deletedIds: ids };
  }
}
