import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsDateRange } from '../../common/decorators/is-date-range.decorator';
import { IsElementOrderUnique } from '../../common/decorators/is-element-order-unique.decorator';
import { CourseLevel, Language } from '../entities/course.entity';

export class CreateLectureContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isPreviewEnabled?: boolean;

  @IsInt()
  @IsPositive()
  order: number;
}

export class CreateSectionContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsInt()
  @IsPositive()
  order: number;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => CreateLectureContentDto)
  @IsElementOrderUnique()
  @Transform(({ value }: { value: CreateLectureContentDto[] }) =>
    !value ? [] : value,
  )
  lectures?: CreateLectureContentDto[];
}

export class CreateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }: { value: string[] }) => (!value ? [] : value))
  learningSkills?: string[];

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }: { value: string[] }) => (!value ? [] : value))
  requirements?: string[];

  @IsOptional()
  @IsInt()
  @IsPositive()
  duration?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discount?: number;

  @ApiProperty({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString({ strict: true })
  discountStartDate?: string;

  @ApiProperty({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsDateRange('discountStartDate')
  discountEndDate?: string;

  @IsOptional()
  @IsBoolean()
  isReviewsEnabled?: boolean;

  @IsOptional()
  @IsUUID(4)
  topicId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => CreateSectionContentDto)
  @IsElementOrderUnique()
  @Transform(({ value }: { value: CreateSectionContentDto[] }) =>
    !value ? [] : value,
  )
  sections?: CreateSectionContentDto[];
}
