import { OmitType } from '@nestjs/swagger';
import { CategoryEntity } from '../entities/category.entity';
import { SubcategoryEntity } from '../entities/subcategory.entity';
import { TopicEntity } from '../entities/topic.entity';

export class CategoryGroupResponseDto extends CategoryEntity {}

export class CategoryResponseDto extends OmitType(CategoryEntity, [
  'subcategories',
]) {}

export class SubcategoryGroupResponseDto extends OmitType(SubcategoryEntity, [
  'category',
]) {}

export class SubcategoryResponseDto extends OmitType(SubcategoryEntity, [
  'category',
  'topics',
]) {}

export class TopicResponseDto extends OmitType(TopicEntity, ['subcategory']) {}
