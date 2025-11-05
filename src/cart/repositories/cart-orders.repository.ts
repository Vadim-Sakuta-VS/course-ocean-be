import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CartOrdersEntity } from '../entities/cart-orders.entity';

@Injectable()
export class CartOrdersRepository extends BaseRepository<CartOrdersEntity> {
  constructor(
    @InjectRepository(CartOrdersEntity)
    repository: Repository<CartOrdersEntity>,
  ) {
    super(repository);
  }

  upsertOrders(userId: string, coursesIds: string[]) {
    return this.repository.upsert(
      coursesIds.map((courseId) => ({ userId, courseId })),
      {
        conflictPaths: ['userId', 'courseId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  async deleteBulkByIds(
    userId: string,
    courseIds: string[],
    transactionManager?: EntityManager,
  ) {
    const orders = await this.repository.find({
      where: { userId, courseId: In(courseIds) },
    });
    const ids = orders.map(({ courseId }) => courseId);

    await this.getRepository(transactionManager).delete({
      userId,
      courseId: In(ids),
    });

    return {
      deletedIds: ids,
    };
  }
}
