import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Reaction {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}

@Entity('review_reactions')
export class ReviewReactionEntity {
  @PrimaryColumn({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @PrimaryColumn({ name: 'review_id', type: 'uuid' })
  reviewId: string;

  @Column({ type: 'enum', enum: Reaction })
  type: Reaction;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
