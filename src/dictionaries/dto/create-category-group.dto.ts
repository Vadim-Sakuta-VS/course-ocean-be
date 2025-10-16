import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

class CreateTopicGroupDto {
  @IsString()
  @MinLength(1)
  name: string;
}

class CreateSubcategoryGroupDto {
  @IsString()
  @MinLength(1)
  name: string;

  @ValidateNested()
  @Type(() => CreateTopicGroupDto)
  @IsArray()
  @ArrayMinSize(1)
  topics: CreateTopicGroupDto[];
}

export class CreateCategoryGroupDto {
  @IsString()
  @MinLength(1)
  name: string;

  @ValidateNested()
  @Type(() => CreateSubcategoryGroupDto)
  @IsArray()
  @ArrayMinSize(1)
  subcategories: CreateSubcategoryGroupDto[];
}

export class CreateSubcategoriesGroupDto extends OmitType(
  CreateCategoryGroupDto,
  ['name'],
) {}

export class CreateTopicsGroupDto extends OmitType(CreateSubcategoryGroupDto, [
  'name',
]) {}
