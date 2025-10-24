import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { PatchReviewDto } from './dto/patch-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsFilterDto } from './dto/reviews-filter.dto';
import {
  Reaction,
  ReviewReactionEntity,
} from './entities/review-reaction.entity';
import { ReviewEntity } from './entities/review.entity';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { TransactionService } from '../common/services/transaction.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
    @InjectRepository(ReviewReactionEntity)
    private readonly reviewReactionsRepository: Repository<ReviewReactionEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  async create(
    userId: string,
    { textContent, rating, courseId }: CreateReviewDto,
  ) {
    const { id } = await this.reviewsRepository.save({
      textContent,
      rating,
      author: { id: userId },
      course: { id: courseId },
    });
    const review = await this.findOneById(id);

    return this.prepareReviewResponse(review);
  }

  async findAll(
    { courseId, page, size }: ReviewsFilterDto,
    userId?: string,
  ): Promise<PageableContentDto<ReviewResponseDto>> {
    const [reviews, total] = await this.reviewsRepository.findAndCount({
      where: { courseId },
      take: size,
      skip: size * page,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      content: await Promise.all(
        reviews.map((review) => this.prepareReviewResponse(review, userId)),
      ),
    };
  }

  private async findOneById(id: string) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }

  private async getUserReaction(userId: string, reviewId: string) {
    return this.reviewReactionsRepository.findOne({
      where: { authorId: userId, reviewId },
    });
  }

  async patch(userId: string, reviewId: string, dto: PatchReviewDto) {
    const review = await this.findOneById(reviewId);
    this.checkUserPermission(review, userId);
    const updatedReview = await this.reviewsRepository.save({
      ...review,
      ...dto,
    });

    return this.prepareReviewResponse(updatedReview, userId);
  }

  async delete(userId: string, userRoles: UserRole[], reviewId: string) {
    const review = await this.findOneById(reviewId);
    this.checkUserPermission(review, userId, userRoles);
    const result = await this.reviewsRepository.delete({ id: reviewId });

    return !!result.affected;
  }

  async setLike(userId: string, reviewId: string, isCancel: boolean) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const reviewsRepository =
          transactionEntityManger.getRepository(ReviewEntity);
        const reviewReactionsRepository =
          transactionEntityManger.getRepository(ReviewReactionEntity);
        await this.findOneById(reviewId);
        const userReaction = await this.getUserReaction(userId, reviewId);
        if (isCancel && userReaction?.type === Reaction.LIKE) {
          await reviewsRepository.decrement({ id: reviewId }, 'likes', 1);
          await reviewReactionsRepository.delete({
            authorId: userId,
            reviewId,
          });

          return true;
        } else if (userReaction?.type !== Reaction.LIKE) {
          if (userReaction?.type === Reaction.DISLIKE) {
            await reviewsRepository.decrement({ id: reviewId }, 'dislikes', 1);
          }
          await reviewsRepository.increment({ id: reviewId }, 'likes', 1);
          await reviewReactionsRepository.save({
            authorId: userId,
            reviewId,
            type: Reaction.LIKE,
          });

          return true;
        }

        return false;
      },
    );
  }

  async setDislike(userId: string, reviewId: string, isCancel: boolean) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const reviewsRepository =
          transactionEntityManger.getRepository(ReviewEntity);
        const reviewReactionsRepository =
          transactionEntityManger.getRepository(ReviewReactionEntity);
        await this.findOneById(reviewId);
        const userReaction = await this.getUserReaction(userId, reviewId);
        if (isCancel && userReaction?.type === Reaction.DISLIKE) {
          await reviewsRepository.decrement({ id: reviewId }, 'dislikes', 1);
          await reviewReactionsRepository.delete({
            authorId: userId,
            reviewId,
          });

          return true;
        } else if (userReaction?.type !== Reaction.DISLIKE) {
          if (userReaction?.type === Reaction.LIKE) {
            await reviewsRepository.decrement({ id: reviewId }, 'likes', 1);
          }
          await reviewsRepository.increment({ id: reviewId }, 'dislikes', 1);
          await reviewReactionsRepository.save({
            authorId: userId,
            reviewId,
            type: Reaction.DISLIKE,
          });

          return true;
        }

        return false;
      },
    );
  }

  private checkUserPermission(
    review: ReviewEntity,
    userId: string,
    userRoles: UserRole[] = [],
  ) {
    if (review.authorId !== userId && !userRoles.includes(UserRole.ADMIN)) {
      throw new ForbiddenException();
    }
  }

  async prepareReviewResponse(review: ReviewEntity, userId?: string) {
    let userReaction: Reaction | undefined;
    if (userId) {
      const reaction = await this.getUserReaction(userId, review.id);
      userReaction = reaction?.type;
    }
    const res = plainToInstance(ReviewResponseDto, review, {
      excludeExtraneousValues: true,
    });
    res.myReaction = userReaction || null;

    return res;
  }
}
