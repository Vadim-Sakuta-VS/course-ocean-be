import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IsBooleanQuery } from '../../common/decorators/is-boolean-query.decorator';
import { Reaction } from '../entities/review-reaction.entity';

export class ReactionQueryDto {
  @ApiProperty({ required: false })
  @IsBooleanQuery()
  isCancel: boolean;

  @IsEnum(Reaction)
  type: Reaction;
}
