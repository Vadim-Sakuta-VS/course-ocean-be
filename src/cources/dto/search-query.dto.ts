import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { IsDateRange } from '../../common/decorators/is-date-range.decorator';
import { CourseLevel } from '../entities/course.entity';

export enum CourseDurationFilter {
  NIL_TO_ONE_HOUR,
  ONE_TO_TWO_HOURS,
  TWO_TO_FIVE_HOURS,
  FIVE_TO_TEN_HOURS,
  MORE_TEN_HOURS,
}

export enum CoursePriceFilter {
  PAID,
  FREE,
}

export enum CourseSorting {
  POPULAR,
  NEW,
  HIGHEST_PRICE,
  LOWEST_PRICE,
}

export class CoursesFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ strict: true })
  creationDateStart: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsDateRange('creationDateStart')
  creationDateEnd: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  ratingFrom: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  ratingTo: number;

  @ApiProperty({ name: 'categoryIds[]', required: false })
  @IsOptional()
  @IsUUID(4, { each: true })
  @IsArray()
  categoryIds: string[];

  @ApiProperty({ name: 'subcategoryIds[]', required: false })
  @IsOptional()
  @IsUUID(4, { each: true })
  @IsArray()
  subcategoryIds: string[];

  @ApiProperty({ name: 'topicIds[]', required: false })
  @IsOptional()
  @IsUUID(4, { each: true })
  @IsArray()
  topicIds: string[];

  @ApiProperty({ name: 'level[]', enum: CourseLevel, required: false })
  @IsOptional()
  @IsEnum(CourseLevel, { each: true })
  @IsArray()
  level: CourseLevel[];

  @ApiProperty({
    name: 'duration[]',
    enum: CourseDurationFilter,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseDurationFilter, { each: true })
  @IsArray()
  @Type(() => Number)
  duration: CourseDurationFilter[];

  @ApiProperty({ name: 'price[]', enum: CoursePriceFilter, required: false })
  @IsOptional()
  @IsEnum(CoursePriceFilter, { each: true })
  @IsArray()
  @Type(() => Number)
  price: CoursePriceFilter[];

  @ApiProperty({
    required: false,
    description: 'Ignoring for user with role STUDENT',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }

    return value === '1' || value === 'true';
  })
  isActive: boolean;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @Transform(({ value }: { value: string }) =>
    value === undefined ? 20 : value,
  )
  size: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }: { value: number }) =>
    value === undefined ? 0 : value,
  )
  page: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsEnum(CourseSorting)
  @Type(() => Number)
  @Transform(({ value }: { value: CourseSorting }) =>
    !value ? CourseSorting.NEW : value,
  )
  sorting: CourseSorting;
}
