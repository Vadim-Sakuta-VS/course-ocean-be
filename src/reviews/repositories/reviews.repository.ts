import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { IncludeQueryOptions } from './reviews.types';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ReviewEntity } from '../entities/review.entity';
import { ICreateReview, IReview } from '../interfaces/review.interface';
import { IReviewsFilter } from '../interfaces/reviews-filter.interface';

@Injectable()
export class ReviewsRepository extends BaseRepository<ReviewEntity> {
  constructor(
    @InjectRepository(ReviewEntity) repository: Repository<ReviewEntity>,
  ) {
    super(repository);
  }

  create(userId: string, { textContent, rating, courseId }: ICreateReview) {
    return this.repository.save({
      textContent,
      rating,
      author: { id: userId },
      course: { id: courseId },
    });
  }

  async getOneById(id: string, includeOptions?: IncludeQueryOptions) {
    const review = await this.repository.findOne({
      where: { id },
      relations: {
        author: includeOptions?.includeAuthor,
      },
    });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }

  findAndCount({ courseId, page, size }: IReviewsFilter) {
    return this.repository.findAndCount({
      where: { courseId },
      take: size,
      skip: size * page,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  updateOne(entity: DeepPartial<IReview>) {
    return this.repository.save(entity);
  }

  deleteOneById(id: string) {
    return this.repository.delete({ id });
  }

  incrementLikes(id: string, transactionEntityManger?: EntityManager) {
    return this.getRepository(transactionEntityManger).increment(
      { id },
      'likes',
      1,
    );
  }

  decrementLikes(id: string, transactionEntityManger?: EntityManager) {
    return this.getRepository(transactionEntityManger).decrement(
      { id },
      'likes',
      1,
    );
  }

  incrementDislikes(id: string, transactionEntityManger?: EntityManager) {
    return this.getRepository(transactionEntityManger).increment(
      { id },
      'dislikes',
      1,
    );
  }

  decrementDislikes(id: string, transactionEntityManger?: EntityManager) {
    return this.getRepository(transactionEntityManger).decrement(
      { id },
      'dislikes',
      1,
    );
  }
}
