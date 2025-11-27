import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
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
import { ICreateCategoryGroup } from './interfaces/category.interface';
import { ICreateSubcategoryGroup } from './interfaces/subcategory.interface';
import { CategoriesRepository } from './repositories/categories.repository';
import { SubcategoriesRepository } from './repositories/subcategories.repository';
import { TopicsRepository } from './repositories/topics.repository';

@Injectable()
export class DictionariesService {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private subcategoriesRepository: SubcategoriesRepository,
    private topicsRepository: TopicsRepository,
  ) {}

  async createCategoryGroup(dto: ICreateCategoryGroup) {
    return this.categoriesRepository.createGroup(dto);
  }

  async createSubcategoriesGroup(
    categoryId: string,
    dto: Omit<ICreateCategoryGroup, 'name'>,
  ) {
    const category = await this.categoriesRepository.getOneById(categoryId);
    const subcategories = dto.subcategories.map((item) => ({
      ...item,
      category,
    }));

    await this.subcategoriesRepository.createGroup(subcategories);

    return subcategories.map((item) =>
      plainToInstance(SubcategoryGroupResponseDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async createTopicsGroupDto(
    subcategoryId: string,
    dto: Omit<ICreateSubcategoryGroup, 'name'>,
  ) {
    const subcategory =
      await this.subcategoriesRepository.getOneById(subcategoryId);
    const topics = dto.topics.map((item) => ({ ...item, subcategory }));
    await this.topicsRepository.createGroup(topics);

    return topics.map((item) =>
      plainToInstance(TopicResponseDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findCategories(search: string) {
    return await this.categoriesRepository.findAllBySearch(search);
  }

  async findSubcategories(categoryId: string, search: string) {
    return await this.subcategoriesRepository.findAllBySearchAndCategory(
      categoryId,
      search,
    );
  }

  async findTopics(subcategoryId: string, search: string) {
    return await this.topicsRepository.findAllBySearchAndSubcategory(
      subcategoryId,
      search,
    );
  }

  async findOneCategory(id: string) {
    return this.categoriesRepository.getOneById(id);
  }

  async findOneSubcategory(id: string) {
    return this.subcategoriesRepository.getOneById(id);
  }

  async findOneTopic(id: string) {
    return this.topicsRepository.getOneById(id);
  }

  async deleteCategory(id: string) {
    await this.findOneCategory(id);
    const result = await this.categoriesRepository.deleteById(id);

    return !!result.affected;
  }

  async deleteSubcategory(id: string) {
    await this.findOneSubcategory(id);
    const result = await this.subcategoriesRepository.deleteById(id);

    return !!result.affected;
  }

  async deleteTopic(id: string) {
    await this.findOneTopic(id);
    const result = await this.topicsRepository.deleteById(id);

    return !!result.affected;
  }

  async updateCategory({ id, name }: UpdateCategoryDto) {
    const category = await this.findOneCategory(id);

    return await this.categoriesRepository.updateOne({ ...category, name });
  }

  async updateSubcategory({ id, name, categoryId }: UpdateSubcategoryDto) {
    const category = await this.findOneCategory(categoryId);
    const subcategory = await this.findOneSubcategory(id);

    const updatedSubcategory = await this.subcategoriesRepository.updateOne({
      ...subcategory,
      name,
      categoryId: category.id,
    });

    return plainToInstance(SubcategoryResponseDto, updatedSubcategory, {
      excludeExtraneousValues: true,
    });
  }

  async updateTopic({ id, name, subcategoryId }: UpdateTopicDto) {
    const subcategory = await this.findOneSubcategory(subcategoryId);
    const topic = await this.findOneTopic(id);

    const updatedTopic = await this.topicsRepository.updateOne({
      ...topic,
      name,
      subcategoryId: subcategory.id,
    });

    return plainToInstance(TopicResponseDto, updatedTopic, {
      excludeExtraneousValues: true,
    });
  }

  async getAllDictionaries() {
    const categories = await this.categoriesRepository.findAll();

    return categories.map((category) => {
      const subcategories = category.subcategories.map((subcategory) => {
        const topics = subcategory.topics.map((topic) =>
          plainToInstance(TopicResponseDto, topic, {
            excludeExtraneousValues: true,
          }),
        );

        return plainToInstance(
          SubcategoryGroupResponseDto,
          { ...subcategory, topics },
          { excludeExtraneousValues: true },
        );
      });

      return plainToInstance(
        CategoryGroupResponseDto,
        { ...category, subcategories },
        { excludeExtraneousValues: true },
      );
    });
  }
}
