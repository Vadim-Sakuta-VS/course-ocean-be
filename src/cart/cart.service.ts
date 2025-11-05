import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CartOrdersEntity } from './entities/cart-orders.entity';
import { CoursesService } from '../cources/courses.service';
import { UsersService } from '../users/users.service';
import { CartOrdersRepository } from './repositories/cart-orders.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartOrdersRepository: CartOrdersRepository,
    private readonly userService: UsersService,
    private readonly coursesService: CoursesService,
  ) {}

  async getCart(userId: string) {
    const user = await this.userService.findOneById(userId, {
      includeCartOrders: true,
    });

    return await Promise.all(
      user?.cartOrders.map((course) =>
        this.coursesService.prepareCourseResponse(course),
      ) || [],
    );
  }

  async addOrders(userId: string, courseIds: string[]) {
    await this.coursesService.checkExistAllIds(courseIds);
    const result = await this.cartOrdersRepository.upsertOrders(
      userId,
      courseIds,
    );

    return {
      ids: (result.identifiers as CartOrdersEntity[]).map(
        ({ courseId }) => courseId,
      ),
    };
  }

  async deleteOrders(
    userId: string,
    courseIds: string[],
    transactionManager?: EntityManager,
  ) {
    return this.cartOrdersRepository.deleteBulkByIds(
      userId,
      courseIds,
      transactionManager,
    );
  }
}
