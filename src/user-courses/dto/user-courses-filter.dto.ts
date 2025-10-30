import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { IsBooleanQuery } from '../../common/decorators/is-boolean-query.decorator';
import { PageableFilterDto } from '../../common/dto/pageable-filter.dto';
import { PaymentStatus } from '../../payments/types';

export class UserCoursesFilterDto extends PageableFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ required: false })
  @IsBooleanQuery()
  isMy: boolean;
}
