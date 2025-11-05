import { ForbiddenException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateReviewDto } from './dto/create-review.dto';
import { PatchReviewDto } from './dto/patch-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsFilterDto } from './dto/reviews-filter.dto';
import { Reaction } from './entities/review-reaction.entity';
import { ReviewEntity } from './entities/review.entity';
import { ReviewReactionsRepository } from './repositories/review-reactions.repository';
import { ReviewsRepository } from './repositories/reviews.repository';
import { DeletedIdResponseDto } from '../common/dto/deleted-id-response.dto';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { TransactionService } from '../common/services/transaction.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly reviewReactionsRepository: ReviewReactionsRepository,
    private readonly transactionService: TransactionService,
  ) {}

  async create(
    userId: string,
    { textContent, rating, courseId }: CreateReviewDto,
  ) {
    const { id } = await this.reviewsRepository.create(userId, {
      textContent,
      rating,
      courseId,
    });
    const review = await this.reviewsRepository.getOneById(id, {
      includeAuthor: true,
    });

    return this.prepareReviewResponse(review);
  }

  async findAll(
    { courseId, page, size }: ReviewsFilterDto,
    userId?: string,
  ): Promise<PageableContentDto<ReviewResponseDto>> {
    const [reviews, total] = await this.reviewsRepository.findAndCount({
      courseId,
      page,
      size,
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

  async patch(userId: string, reviewId: string, dto: PatchReviewDto) {
    const review = await this.reviewsRepository.getOneById(reviewId);
    this.checkUserPermission(review, userId);
    const updatedReview = await this.reviewsRepository.updateOne({
      ...review,
      ...dto,
    });

    return this.prepareReviewResponse(updatedReview, userId);
  }

  async delete(
    userId: string,
    userRoles: UserRole[],
    reviewId: string,
  ): Promise<DeletedIdResponseDto> {
    const review = await this.reviewsRepository.getOneById(reviewId);
    this.checkUserPermission(review, userId, userRoles);
    const result = await this.reviewsRepository.deleteOneById(reviewId);

    return {
      deletedId: result.affected ? reviewId : null,
    };
  }

  async setLike(userId: string, reviewId: string, isCancel: boolean) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        await this.reviewsRepository.getOneById(reviewId);
        const userReaction =
          await this.reviewReactionsRepository.findUserReaction(
            userId,
            reviewId,
          );
        if (isCancel && userReaction?.type === Reaction.LIKE) {
          await this.reviewsRepository.decrementLikes(
            reviewId,
            transactionEntityManger,
          );
          await this.reviewReactionsRepository.deleteUserReaction(
            userId,
            reviewId,
            transactionEntityManger,
          );

          return true;
        } else if (userReaction?.type !== Reaction.LIKE) {
          if (userReaction?.type === Reaction.DISLIKE) {
            await this.reviewsRepository.decrementDislikes(
              reviewId,
              transactionEntityManger,
            );
          }
          await this.reviewsRepository.incrementLikes(
            reviewId,
            transactionEntityManger,
          );
          await this.reviewReactionsRepository.createOrUpdate(
            userId,
            reviewId,
            Reaction.LIKE,
            transactionEntityManger,
          );

          return true;
        }

        return false;
      },
    );
  }

  async setDislike(userId: string, reviewId: string, isCancel: boolean) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        await this.reviewsRepository.getOneById(reviewId);
        const userReaction =
          await this.reviewReactionsRepository.findUserReaction(
            userId,
            reviewId,
          );
        if (isCancel && userReaction?.type === Reaction.DISLIKE) {
          await this.reviewsRepository.decrementDislikes(
            reviewId,
            transactionEntityManger,
          );
          await this.reviewReactionsRepository.deleteUserReaction(
            userId,
            reviewId,
            transactionEntityManger,
          );

          return true;
        } else if (userReaction?.type !== Reaction.DISLIKE) {
          if (userReaction?.type === Reaction.LIKE) {
            await this.reviewsRepository.decrementLikes(
              reviewId,
              transactionEntityManger,
            );
          }
          await this.reviewsRepository.incrementDislikes(
            reviewId,
            transactionEntityManger,
          );
          await this.reviewReactionsRepository.createOrUpdate(
            userId,
            reviewId,
            Reaction.DISLIKE,
            transactionEntityManger,
          );

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
      const reaction = await this.reviewReactionsRepository.findUserReaction(
        userId,
        review.id,
      );
      userReaction = reaction?.type;
    }
    const res = plainToInstance(ReviewResponseDto, review, {
      excludeExtraneousValues: true,
    });
    res.myReaction = userReaction || null;

    return res;
  }
}
