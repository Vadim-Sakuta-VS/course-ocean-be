import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewReactionEntity } from './entities/review-reaction.entity';
import { ReviewEntity } from './entities/review.entity';
import { ReviewReactionsRepository } from './repositories/review-reactions.repository';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TransactionService } from '../common/services/transaction.service';
import { CoursesModule } from '../cources/cources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, ReviewReactionEntity]),
    CoursesModule,
  ],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    TransactionService,
    ReviewsRepository,
    ReviewReactionsRepository,
  ],
})
export class ReviewsModule {}
