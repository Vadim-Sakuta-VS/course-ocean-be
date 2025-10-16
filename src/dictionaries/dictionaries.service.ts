import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ILike, Repository } from 'typeorm';
import {
  CreateCategoryGroupDto,
  CreateSubcategoriesGroupDto,
  CreateTopicsGroupDto,
} from './dto/create-category-group.dto';
import {
  SubcategoryGroupResponseDto,
  SubcategoryResponseDto,
  TopicResponseDto,
} from './dto/response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { TopicEntity } from './entities/topic.entity';
import { TransactionService } from '../common/services/transaction.service';

@Injectable()
export class DictionariesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(SubcategoryEntity)
    private subcategoriesRepository: Repository<SubcategoryEntity>,
    @InjectRepository(TopicEntity)
    private topicsRepository: Repository<TopicEntity>,
    private transactionService: TransactionService,
  ) {}

  async createCategoryGroup(dto: CreateCategoryGroupDto) {
    return await this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const categoriesRepository =
          transactionEntityManger.getRepository(CategoryEntity);

        return await categoriesRepository.save(dto);
      },
    );
  }

  async createSubcategoriesGroup(
    categoryId: string,
    dto: CreateSubcategoriesGroupDto,
  ) {
    return await this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const category = await this.findOneCategory(categoryId);
        const subcategoriesRepository =
          transactionEntityManger.getRepository(SubcategoryEntity);
        const subcategories = dto.subcategories.map((item) => {
          return subcategoriesRepository.create({ ...item, category });
        });

        await subcategoriesRepository.save(subcategories);

        return subcategories.map((item) =>
          plainToInstance(SubcategoryGroupResponseDto, item, {
            excludeExtraneousValues: true,
          }),
        );
      },
    );
  }

  async createTopicsGroupDto(subcategoryId: string, dto: CreateTopicsGroupDto) {
    return await this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const subcategory = await this.findOneSubcategory(subcategoryId);
        const topicsRepository =
          transactionEntityManger.getRepository(TopicEntity);
        const topics = dto.topics.map((item) => {
          return topicsRepository.create({ ...item, subcategory });
        });
        await topicsRepository.save(topics);

        return topics.map((item) =>
          plainToInstance(TopicResponseDto, item, {
            excludeExtraneousValues: true,
          }),
        );
      },
    );
  }

  async findCategories(search: string) {
    return await this.categoriesRepository.find({
      where: {
        name: ILike(`${search || ''}%`),
      },
    });
  }

  async findSubcategories(categoryId: string, search: string) {
    return await this.subcategoriesRepository.find({
      where: {
        category: { id: categoryId },
        name: ILike(`${search || ''}%`),
      },
    });
  }

  async findTopics(subcategoryId: string, search: string) {
    return await this.topicsRepository.find({
      where: {
        subcategory: { id: subcategoryId },
        name: ILike(`${search || ''}%`),
      },
    });
  }

  async findOneCategory(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  async findOneSubcategory(id: string) {
    const subcategory = await this.subcategoriesRepository.findOne({
      where: { id },
    });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with id ${id} not found`);
    }

    return subcategory;
  }

  async findOneTopic(id: string) {
    const topic = await this.topicsRepository.findOne({
      where: { id },
    });
    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }

    return topic;
  }

  async deleteCategory(id: string) {
    await this.findOneCategory(id);
    const result = await this.categoriesRepository.delete({ id });

    return !!result.affected;
  }

  async deleteSubcategory(id: string) {
    await this.findOneSubcategory(id);
    const result = await this.subcategoriesRepository.delete({ id });

    return !!result.affected;
  }

  async deleteTopic(id: string) {
    await this.findOneTopic(id);
    const result = await this.topicsRepository.delete({ id });

    return !!result.affected;
  }

  async updateCategory({ id, name }: UpdateCategoryDto) {
    const category = await this.findOneCategory(id);

    return await this.categoriesRepository.save({ ...category, name });
  }

  async updateSubcategory({ id, name, categoryId }: UpdateSubcategoryDto) {
    const category = await this.findOneCategory(categoryId);
    const subcategory = await this.findOneSubcategory(id);

    const updatedSubcategory = await this.subcategoriesRepository.save({
      ...subcategory,
      name,
      category,
    });

    return plainToInstance(SubcategoryResponseDto, updatedSubcategory, {
      excludeExtraneousValues: true,
    });
  }

  async updateTopic({ id, name, subcategoryId }: UpdateTopicDto) {
    const subcategory = await this.findOneSubcategory(subcategoryId);
    const topic = await this.findOneTopic(id);

    const updatedTopic = await this.topicsRepository.save({
      ...topic,
      name,
      subcategory,
    });

    return plainToInstance(TopicResponseDto, updatedTopic, {
      excludeExtraneousValues: true,
    });
  }
}
