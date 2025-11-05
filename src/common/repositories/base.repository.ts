import { Injectable } from '@nestjs/common';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  protected getRepository(transactionManager?: EntityManager): Repository<T> {
    return transactionManager
      ? transactionManager.getRepository(this.repository.target)
      : this.repository;
  }
}
