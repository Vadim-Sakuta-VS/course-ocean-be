import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, MoreThan, Repository } from 'typeorm';
import { IncludeQueryOptions } from './user-sessions.types';
import { BaseRepository } from '../../common/repositories/base.repository';
import { UserSessionsEntity } from '../entities/user-sessions.entity';
import { IUserSession } from '../interfaces/user-session.interface';

@Injectable()
export class UserSessionsRepository extends BaseRepository<UserSessionsEntity> {
  constructor(
    @InjectRepository(UserSessionsEntity)
    repository: Repository<UserSessionsEntity>,
  ) {
    super(repository);
  }

  create(entity: IUserSession, transactionManager?: EntityManager) {
    return this.getRepository(transactionManager).save(entity);
  }

  revokeSessions() {
    return this.repository.update(
      { expiresAt: LessThan(new Date()), isRevoked: false },
      { isRevoked: true },
    );
  }

  revokeSessionById(id: string, transactionManager?: EntityManager) {
    return this.getRepository(transactionManager).update(
      { id },
      { isRevoked: true },
    );
  }

  findActiveSessionById(id: string, includeOptions?: IncludeQueryOptions) {
    return this.repository.findOne({
      where: {
        id,
        expiresAt: MoreThan(new Date()),
        isRevoked: false,
      },
      relations: { user: includeOptions?.includeUser },
    });
  }
}
