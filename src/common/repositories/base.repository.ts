import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  FindOptionsWhere,
  In,
  ObjectLiteral,
  Repository,
} from 'typeorm';

@Injectable()
export class BaseRepository<T extends ObjectLiteral & { id?: string }> {
  constructor(protected readonly repository: Repository<T>) {}

  protected getRepository(transactionManager?: EntityManager): Repository<T> {
    return transactionManager
      ? transactionManager.getRepository(this.repository.target)
      : this.repository;
  }

  async checkExistAllIds(ids: string[]) {
    const entities = await this.repository.find({
      where: { id: In(ids) } as FindOptionsWhere<T>,
    });
    const nonExistentIds = ids.filter((id) =>
      entities.every((entity) => entity.id !== id),
    );
    if (nonExistentIds.length) {
      throw new NotFoundException(
        `${this.repository.metadata.name}: ids ${nonExistentIds.join(', ')} not found`,
      );
    }

    return true;
  }
}
