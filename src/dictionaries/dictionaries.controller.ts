import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DictionariesService } from './dictionaries.service';
import {
  CreateCategoryGroupDto,
  CreateSubcategoriesGroupDto,
  CreateTopicsGroupDto,
} from './dto/create-category-group.dto';
import {
  CategoryGroupResponseDto,
  CategoryResponseDto,
  SubcategoryGroupResponseDto,
  SubcategoryResponseDto,
  TopicResponseDto,
} from './dto/response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('dictionaries')
export class DictionariesController {
  constructor(private dictionariesService: DictionariesService) {}

  /**
   * Create new category with subcategories and topics
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/categories')
  createCategoryGroup(
    @Body() dto: CreateCategoryGroupDto,
  ): Promise<CategoryGroupResponseDto> {
    return this.dictionariesService.createCategoryGroup(dto);
  }

  /**
   * Update existing category
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Put('/categories')
  updateCategory(@Body() dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    return this.dictionariesService.updateCategory(dto);
  }

  /**
   * Find categories
   */
  @ApiQuery({ name: 'search', required: false })
  @Public()
  @Get('/categories')
  findCategories(
    @Query('search') search: string,
  ): Promise<CategoryResponseDto[]> {
    return this.dictionariesService.findCategories(search);
  }

  /**
   * Create subcategories with topics for existing category
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/categories/:id')
  createSubcategoriesGroup(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateSubcategoriesGroupDto,
  ): Promise<SubcategoryGroupResponseDto[]> {
    return this.dictionariesService.createSubcategoriesGroup(id, dto);
  }

  /**
   * Delete category
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/categories/:id')
  deleteCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<boolean> {
    return this.dictionariesService.deleteCategory(id);
  }

  /**
   *  Find subcategories
   *
   *  @throws {400} Bad request
   */
  @ApiQuery({ name: 'search', required: false })
  @Public()
  @Get('/subcategories')
  findSubcategories(
    @Query('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Query('search') search: string,
  ): Promise<SubcategoryResponseDto[]> {
    return this.dictionariesService.findSubcategories(categoryId, search);
  }

  /**
   * Update existing subcategory
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Put('/subcategories')
  updateSubcategory(
    @Body() dto: UpdateSubcategoryDto,
  ): Promise<SubcategoryResponseDto> {
    return this.dictionariesService.updateSubcategory(dto);
  }

  /**
   * Create topics for existing subcategory
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/subcategories/:id')
  createTopicsGroup(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateTopicsGroupDto,
  ): Promise<TopicResponseDto[]> {
    return this.dictionariesService.createTopicsGroupDto(id, dto);
  }

  /**
   *  Delete subcategory
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/subcategories/:id')
  deleteSubcategory(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<boolean> {
    return this.dictionariesService.deleteSubcategory(id);
  }

  /**
   * Find topics
   *
   * @throws {400} Bad request
   */
  @ApiQuery({ name: 'search', required: false })
  @Public()
  @Get('/topics')
  findTopics(
    @Query('subcategoryId', new ParseUUIDPipe()) subcategoryId: string,
    @Query('search') search: string,
  ): Promise<TopicResponseDto[]> {
    return this.dictionariesService.findTopics(subcategoryId, search);
  }

  /**
   * Update existing topic
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Put('/topics')
  updateTopic(@Body() dto: UpdateTopicDto): Promise<TopicResponseDto> {
    return this.dictionariesService.updateTopic(dto);
  }

  /**
   *  Delete topic
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/topics/:id')
  deleteTopic(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return this.dictionariesService.deleteTopic(id);
  }
}
