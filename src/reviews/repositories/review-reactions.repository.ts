import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  Reaction,
  ReviewReactionEntity,
} from '../entities/review-reaction.entity';

@Injectable()
export class ReviewReactionsRepository extends BaseRepository<ReviewReactionEntity> {
  constructor(
    @InjectRepository(ReviewReactionEntity)
    repository: Repository<ReviewReactionEntity>,
  ) {
    super(repository);
  }

  createOrUpdate(
    userId: string,
    reviewId: string,
    type: Reaction,
    transactionManager?: EntityManager,
  ) {
    return this.getRepository(transactionManager).save({
      authorId: userId,
      reviewId,
      type,
    });
  }

  findUserReaction(userId: string, reviewId: string) {
    return this.repository.findOne({ where: { authorId: userId, reviewId } });
  }

  deleteUserReaction(
    userId: string,
    reviewId: string,
    transactionManager?: EntityManager,
  ) {
    return this.getRepository(transactionManager).delete({
      authorId: userId,
      reviewId,
    });
  }
}
