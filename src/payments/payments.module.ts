import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CartModule } from '../cart/cart.module';
import { TransactionService } from '../common/services/transaction.service';
import { CoursesModule } from '../cources/cources.module';
import { UserCourseEntity } from '../user-courses/entities/user-course.entity';
import { UserCoursesModule } from '../user-courses/user-courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCourseEntity]),
    CartModule,
    CoursesModule,
    UserCoursesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, TransactionService],
})
export class PaymentsModule {}
