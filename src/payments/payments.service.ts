import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaymentStatus } from './types';
import { CartService } from '../cart/cart.service';
import { TransactionService } from '../common/services/transaction.service';
import { CoursesService } from '../cources/courses.service';
import { UserCoursesEntity } from '../user-courses/entities/user-courses.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(UserCoursesEntity)
    private readonly userCoursesRepository: Repository<UserCoursesEntity>,
    private readonly cartService: CartService,
    private readonly coursesService: CoursesService,
    private readonly transactionService: TransactionService,
  ) {}

  async payCart(userId: string) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const userCoursesRepository =
          transactionEntityManger.getRepository(UserCoursesEntity);
        const cartOrders = await this.cartService.getCart(userId);
        if (!cartOrders.length) {
          throw new BadRequestException('Cart is empty!');
        }
        const courseIds = cartOrders.map(({ id }) => id);
        const userCourses = await userCoursesRepository.find({
          where: { userId, courseId: In(courseIds) },
          select: { courseId: true },
        });
        if (userCourses.length) {
          throw new ConflictException(
            `Conflict. Courses ${userCourses.map(({ courseId }) => courseId).join(', ')} have already bought!`,
          );
        }
        const saleDate = new Date();
        await userCoursesRepository.save(
          cartOrders.map<UserCoursesEntity>((course) => {
            return userCoursesRepository.create({
              userId,
              courseId: course.id,
              saleDate,
              status: PaymentStatus.PENDING,
              price: this.coursesService.getCoursePrice(course),
            });
          }),
        );
        await this.cartService.deleteOrders(userId, courseIds);

        return true;
      },
    );
  }
}
