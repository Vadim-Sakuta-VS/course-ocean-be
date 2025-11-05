import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FileEntity } from '../entities/file.entity';
import { IFile } from '../interfaces/file.interface';

@Injectable()
export class FilesRepository extends BaseRepository<FileEntity> {
  constructor(
    @InjectRepository(FileEntity) repository: Repository<FileEntity>,
  ) {
    super(repository);
  }

  create(entity: IFile, transactionManager?: EntityManager) {
    return this.getRepository(transactionManager).save(entity);
  }

  deleteById(id: string) {
    return this.repository.delete({ id });
  }

  async getOneById(id: string) {
    const file = await this.repository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
  }

  async updateOne(entity: Partial<IFile>) {
    return this.repository.save(entity);
  }
}
