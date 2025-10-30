import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewReactionEntity } from './entities/review-reaction.entity';
import { ReviewEntity } from './entities/review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TransactionService } from '../common/services/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, ReviewReactionEntity])],
  controllers: [ReviewsController],
  providers: [ReviewsService, TransactionService],
})
export class ReviewsModule {}
