import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CategoryEntity } from '../entities/category.entity';
import {
  ICategory,
  ICreateCategoryGroup,
} from '../interfaces/category.interface';

@Injectable()
export class CategoriesRepository extends BaseRepository<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity) repository: Repository<CategoryEntity>,
  ) {
    super(repository);
  }

  createGroup(entity: ICreateCategoryGroup) {
    return this.repository.save(entity);
  }

  async getOneById(id: string) {
    const category = await this.repository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  deleteById(id: string) {
    return this.repository.delete({ id });
  }

  updateOne(entity: Partial<ICategory>) {
    return this.repository.save(entity);
  }

  findAllBySearch(search: string) {
    return this.repository.find({ where: { name: ILike(`${search || ''}%`) } });
  }
}
