import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SubcategoryEntity } from '../entities/subcategory.entity';
import {
  ICreateSubcategoryGroup,
  ISubcategory,
} from '../interfaces/subcategory.interface';

@Injectable()
export class SubcategoriesRepository extends BaseRepository<SubcategoryEntity> {
  constructor(
    @InjectRepository(SubcategoryEntity)
    repository: Repository<SubcategoryEntity>,
  ) {
    super(repository);
  }

  createGroup(entities: ICreateSubcategoryGroup[]) {
    return this.repository.save(entities);
  }

  async getOneById(id: string) {
    const subcategory = await this.repository.findOne({ where: { id } });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with id ${id} not found`);
    }

    return subcategory;
  }

  deleteById(id: string) {
    return this.repository.delete({ id });
  }

  updateOne(entity: Partial<ISubcategory>) {
    return this.repository.save(entity);
  }

  findAllBySearchAndCategory(categoryId: string, search: string) {
    return this.repository.find({
      where: { category: { id: categoryId }, name: ILike(`${search || ''}%`) },
    });
  }
}
