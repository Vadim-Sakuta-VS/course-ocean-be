import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
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
  @Expose()
  @IsOptional()
  @IsString()
  title: string;

  @Expose()
  @IsOptional()
  @IsString()
  videoUrl: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isPreviewEnabled: boolean;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  duration: number;

  @Expose()
  @IsInt()
  @IsPositive()
  order: number;
}

export class CreateSectionContentDto {
  @Expose()
  @IsOptional()
  @IsString()
  title: string;

  @Expose()
  @IsInt()
  @IsPositive()
  order: number;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLectureContentDto)
  @IsArray()
  @IsElementOrderUnique()
  @Transform(({ value }: { value: CreateLectureContentDto[] }) =>
    !value ? [] : value,
  )
  lectures: CreateLectureContentDto[];
}

export class CreateCourseDto {
  @Expose()
  @IsOptional()
  @IsString()
  title: string;

  @Expose()
  @IsOptional()
  @IsString()
  shortDescription: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string;

  @Expose()
  @IsOptional()
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @Expose()
  @IsOptional()
  @IsEnum(Language)
  language: Language;

  @Expose()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }: { value: string[] }) => (!value ? [] : value))
  learningSkills: string[];

  @Expose()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }: { value: string[] }) => (!value ? [] : value))
  requirements: string[];

  @Expose()
  @IsOptional()
  @IsString()
  coverUrl: string;

  @Expose()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discount: number;

  @Expose()
  @ApiProperty({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString({ strict: true })
  discountStartDate: string;

  @Expose()
  @ApiProperty({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsDateRange('discountStartDate')
  discountEndDate: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isReviewsEnabled: boolean;

  @Expose()
  @IsOptional()
  @IsUUID(4)
  topicId: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => CreateSectionContentDto)
  @IsElementOrderUnique()
  @Transform(({ value }: { value: CreateSectionContentDto[] }) =>
    !value ? [] : value,
  )
  sections: CreateSectionContentDto[];
}
