import { ForbiddenException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ReviewResponseDto } from './dto/review-response.dto';
import { Reaction } from './entities/review-reaction.entity';
import { ReviewEntity } from './entities/review.entity';
import { IReactionQuery } from './interfaces/reaction-query.interface';
import { ICreateReview, IReview } from './interfaces/review.interface';
import { IReviewsFilter } from './interfaces/reviews-filter.interface';
import { ReviewReactionsRepository } from './repositories/review-reactions.repository';
import { ReviewsRepository } from './repositories/reviews.repository';
import { DeletedIdResponseDto } from '../common/dto/deleted-id-response.dto';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { TransactionService } from '../common/services/transaction.service';
import { CoursesService } from '../cources/courses.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly reviewReactionsRepository: ReviewReactionsRepository,
    private readonly coursesService: CoursesService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(
    userId: string,
    { textContent, rating, courseId }: ICreateReview,
  ) {
    await this.coursesService.findOneCourse(courseId);
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
    { courseId, page, size }: IReviewsFilter,
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

  async patch(
    userId: string,
    reviewId: string,
    dto: Partial<Pick<IReview, 'textContent' | 'rating'>>,
  ) {
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

  async setReaction(
    userId: string,
    reviewId: string,
    { type, isCancel }: IReactionQuery,
  ) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const review = await this.reviewsRepository.getOneById(reviewId);
        const userReaction =
          await this.reviewReactionsRepository.findUserReaction(
            userId,
            reviewId,
          );
        if (isCancel && userReaction?.type === type) {
          if (userReaction?.type === Reaction.LIKE) {
            await this.reviewsRepository.decrementLikes(
              reviewId,
              transactionEntityManger,
            );
          } else {
            await this.reviewsRepository.decrementDislikes(
              reviewId,
              transactionEntityManger,
            );
          }

          await this.reviewReactionsRepository.deleteUserReaction(
            userId,
            reviewId,
            transactionEntityManger,
          );

          return true;
        } else if (userReaction?.type !== type) {
          if (type === Reaction.DISLIKE) {
            if (review.likes) {
              await this.reviewsRepository.decrementLikes(
                reviewId,
                transactionEntityManger,
              );
            }
            await this.reviewsRepository.incrementDislikes(
              reviewId,
              transactionEntityManger,
            );
          } else {
            if (review.dislikes) {
              await this.reviewsRepository.decrementDislikes(
                reviewId,
                transactionEntityManger,
              );
            }
            await this.reviewsRepository.incrementLikes(
              reviewId,
              transactionEntityManger,
            );
          }

          await this.reviewReactionsRepository.createOrUpdate(
            userId,
            reviewId,
            type,
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
