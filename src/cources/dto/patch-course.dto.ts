import { OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  CreateCourseDto,
  CreateLectureContentDto,
  CreateSectionContentDto,
} from './create-course.dto';

export enum PatchOperation {
  ADD = 'add',
  REMOVE = 'remove',
  REPLACE = 'replace',
  MOVE = 'move',
  COPY = 'copy',
  TEST = 'test',
}

export class PatchCourseOperationDto {
  @IsEnum(PatchOperation)
  op: PatchOperation;

  @IsOptional()
  @IsString()
  from: string;

  @IsString()
  path: string;

  @Allow()
  value: any;
}

export class PatchCourseOperationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @Type(() => PatchCourseOperationDto)
  operations: PatchCourseOperationDto[];
}

export class PatchedLectureContentDto extends OmitType(
  CreateLectureContentDto,
  ['order'],
) {
  @ValidateIf((o: PatchedLectureContentDto) => o.id !== undefined)
  @IsUUID(4)
  id: string;

  @ValidateIf((o: PatchedSectionContentDto) => o.id === undefined)
  @IsInt()
  @IsPositive()
  order: number;
}

export class PatchedSectionContentDto extends OmitType(
  CreateSectionContentDto,
  ['lectures', 'order'],
) {
  @ValidateIf((o: PatchedSectionContentDto) => o.id !== undefined)
  @IsUUID(4)
  id: string;

  @ValidateIf((o: PatchedSectionContentDto) => o.id === undefined)
  @IsPositive()
  order: number;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => PatchedLectureContentDto)
  @Transform(({ value }: { value: PatchedLectureContentDto[] }) =>
    !value ? [] : value,
  )
  lectures?: PatchedLectureContentDto[];
}

export class PatchedCourseDto extends OmitType(CreateCourseDto, ['sections']) {
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => PatchedSectionContentDto)
  @Transform(({ value }: { value: PatchedSectionContentDto[] }) =>
    !value ? [] : value,
  )
  sections?: PatchedSectionContentDto[];
}
