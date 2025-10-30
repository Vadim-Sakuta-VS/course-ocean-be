import { OmitType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { UserShortResponseDto } from '../../users/dto/user-short-response.dto';
import { Reaction } from '../entities/review-reaction.entity';
import { ReviewEntity } from '../entities/review.entity';

export class ReviewResponseDto extends OmitType(ReviewEntity, [
  'author',
  'course',
  'authorId',
]) {
  @Expose()
  @Type(() => UserShortResponseDto)
  author: UserShortResponseDto;

  @Expose()
  @Transform(({ value }: { value: Reaction }) => value || null)
  myReaction: Reaction | null;
}
