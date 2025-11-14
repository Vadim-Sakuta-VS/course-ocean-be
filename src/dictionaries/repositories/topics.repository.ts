import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { TopicEntity } from '../entities/topic.entity';
import { ICreateTopic, ITopic } from '../interfaces/topic.interface';

@Injectable()
export class TopicsRepository extends BaseRepository<TopicEntity> {
  constructor(
    @InjectRepository(TopicEntity) repository: Repository<TopicEntity>,
  ) {
    super(repository);
  }

  createGroup(entities: ICreateTopic[]) {
    return this.repository.save(entities);
  }

  async getOneById(id: string) {
    const topic = await this.repository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }

    return topic;
  }

  deleteById(id: string) {
    return this.repository.delete({ id });
  }

  updateOne(entity: Partial<ITopic>) {
    return this.repository.save(entity);
  }

  findAllBySearchAndSubcategory(subcategoryId: string, search: string) {
    return this.repository.find({
      where: {
        subcategory: { id: subcategoryId },
        name: ILike(`${search || ''}%`),
      },
    });
  }
}
