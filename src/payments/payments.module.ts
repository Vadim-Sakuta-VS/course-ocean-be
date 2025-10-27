import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CartModule } from '../cart/cart.module';
import { TransactionService } from '../common/services/transaction.service';
import { CoursesModule } from '../cources/cources.module';
import { UserCoursesEntity } from '../user-courses/entities/user-courses.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCoursesEntity]),
    CartModule,
    CoursesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, TransactionService],
})
export class PaymentsModule {}
