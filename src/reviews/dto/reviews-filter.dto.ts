import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PageableFilterDto } from '../../common/dto/pageable-filter.dto';

export class ReviewsFilterDto extends PageableFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID(4)
  courseId: string;
}
