import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CartOrdersEntity } from './entities/cart-orders.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartOrdersEntity)
    private readonly cartOrdersRepository: Repository<CartOrdersEntity>,
  ) {}

  async addOrders(userId: string, coursesIds: string[]) {
    const result = await this.cartOrdersRepository.upsert(
      coursesIds.map((courseId) => ({ userId, courseId })),
      {
        conflictPaths: ['userId', 'courseId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return {
      ids: (result.identifiers as CartOrdersEntity[]).map(
        ({ courseId }) => courseId,
      ),
    };
  }

  async deleteOrders(userId: string, courseIds: string[]) {
    const result = await this.cartOrdersRepository.delete({
      userId,
      courseId: In(courseIds),
    });

    return !!result.affected;
  }
}
