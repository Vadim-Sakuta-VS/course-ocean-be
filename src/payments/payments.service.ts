import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PaymentStatus } from './types';
import { CartService } from '../cart/cart.service';
import { TransactionService } from '../common/services/transaction.service';
import { CoursesService } from '../cources/courses.service';
import { UserCoursesService } from '../user-courses/user-courses.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly cartService: CartService,
    private readonly coursesService: CoursesService,
    private readonly userCoursesService: UserCoursesService,
    private readonly transactionService: TransactionService,
  ) {}

  async payCart(userId: string) {
    return this.transactionService.runInTransaction(
      async (transactionManger) => {
        const cartOrders = await this.cartService.getCart(userId);
        if (!cartOrders.length) {
          throw new BadRequestException('Cart is empty!');
        }
        const courseIds = cartOrders.map(({ id }) => id);
        const userCourses =
          await this.userCoursesService.findByUserAndCourseIds(
            userId,
            courseIds,
          );

        if (userCourses.length) {
          throw new ConflictException(
            `Conflict. Courses ${userCourses.map(({ courseId }) => courseId).join(', ')} have already bought!`,
          );
        }
        const saleDate = new Date();
        await this.userCoursesService.createUserCourses(
          cartOrders.map(
            (course) => ({
              userId,
              courseId: course.id,
              saleDate,
              status: PaymentStatus.PENDING,
              price: this.coursesService.getCoursePrice(course),
            }),
            transactionManger,
          ),
        );
        await this.cartService.deleteOrders(
          userId,
          courseIds,
          transactionManger,
        );

        return true;
      },
    );
  }
}
