import { Reaction } from '../entities/review-reaction.entity';

export interface IReactionQuery {
  isCancel?: boolean;
  type: Reaction;
}
