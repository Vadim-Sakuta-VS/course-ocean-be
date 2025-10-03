import { OmitType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
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
import { IsElementOrderUnique } from '../../common/decorators/is-element-order-unique.decorator';

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

export class PatchedLectureContentDto extends CreateLectureContentDto {
  @Expose()
  @ValidateIf((o: PatchedLectureContentDto) => o.id !== undefined)
  @IsUUID(4)
  id: string;
}

export class PatchedSectionContentDto extends OmitType(
  CreateSectionContentDto,
  ['lectures'],
) {
  @Expose()
  @ValidateIf((o: PatchedSectionContentDto) => o.id !== undefined)
  @IsUUID(4)
  id: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => PatchedLectureContentDto)
  @IsArray()
  @IsElementOrderUnique()
  @Transform(({ value }: { value: PatchedLectureContentDto[] }) =>
    !value ? [] : value,
  )
  lectures: PatchedLectureContentDto[];
}

export class PatchedCourseDto extends OmitType(CreateCourseDto, ['sections']) {
  @Expose()
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => PatchedSectionContentDto)
  @IsElementOrderUnique()
  @Transform(({ value }: { value: PatchedSectionContentDto[] }) =>
    !value ? [] : value,
  )
  sections: PatchedSectionContentDto[];
}
