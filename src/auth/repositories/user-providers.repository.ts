import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { UserProvidersEntity } from '../entities/user-providers.entity';
import { IUserProvider } from '../interfaces/user-provider.interface';

@Injectable()
export class UserProvidersRepository extends BaseRepository<UserProvidersEntity> {
  constructor(
    @InjectRepository(UserProvidersEntity)
    repository: Repository<UserProvidersEntity>,
  ) {
    super(repository);
  }

  createOrUpdate(entity: IUserProvider, transactionManager: EntityManager) {
    return this.getRepository(transactionManager).save(entity);
  }

  deleteProviderByIdAndEmail(
    providerId: string,
    email: string,
    transactionManager: EntityManager,
  ) {
    return this.getRepository(transactionManager)
      .createQueryBuilder()
      .delete()
      .where('provider_id = :providerId', { providerId })
      .andWhere(
        'EXISTS (SELECT 1 FROM users u WHERE user_id = u.id AND email != :email)',
        { email },
      )
      .execute();
  }
}
