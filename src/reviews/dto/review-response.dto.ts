import { OmitType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { AuthorResponseDto } from '../../users/dto/author-response.dto';
import { Reaction } from '../entities/review-reaction.entity';
import { ReviewEntity } from '../entities/review.entity';

export class ReviewResponseDto extends OmitType(ReviewEntity, [
  'author',
  'course',
  'authorId',
]) {
  @Expose()
  @Type(() => AuthorResponseDto)
  author: AuthorResponseDto;

  @Expose()
  @Transform(({ value }: { value: Reaction }) => value || null)
  myReaction: Reaction | null;
}
