import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { CartOrdersEntity } from './entities/cart-orders.entity';
import { FIND_COURSE_RELATIONS } from '../cources/constants';
import { CourseResponseDto } from '../cources/dto/course-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartOrdersEntity)
    private readonly cartOrdersRepository: Repository<CartOrdersEntity>,
    private readonly userService: UsersService,
  ) {}

  async getCart(userId: string) {
    const user = await this.userService.findOneById(userId, {
      relations: {
        cartOrders: FIND_COURSE_RELATIONS,
      },
    });

    return (
      user?.cartOrders.map((course) =>
        plainToInstance(CourseResponseDto, course, {
          excludeExtraneousValues: true,
        }),
      ) || []
    );
  }

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
