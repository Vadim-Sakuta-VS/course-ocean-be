import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { IncludeQueryOptions } from './users.types';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FIND_COURSE_RELATIONS } from '../../cources/constants';
import { UserEntity } from '../entities/user.entity';
import { ICreateUserExternal } from '../interfaces/create-user-external.interface';
import { ICreateUser } from '../interfaces/create-user.interface';

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    readonly repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  create(
    entity: Partial<ICreateUser | ICreateUserExternal>,
    transactionManager?: EntityManager,
  ) {
    return this.getRepository(transactionManager).save(entity);
  }

  private findOne(
    options: FindOneOptions<UserEntity>,
    includeOptions?: IncludeQueryOptions,
  ) {
    return this.repository.findOne({
      ...options,
      relations: {
        cartOrders: includeOptions?.includeCartOrders
          ? FIND_COURSE_RELATIONS
          : undefined,
        wishList: includeOptions?.includeWishList
          ? FIND_COURSE_RELATIONS
          : undefined,
        providers: includeOptions?.includeProviders ? true : undefined,
        ...options.relations,
      },
    });
  }

  findOneByEmail(email: string, options?: IncludeQueryOptions) {
    return this.findOne({ where: { email } }, options);
  }

  async getOneByEmail(email: string, options?: IncludeQueryOptions) {
    const user = await this.findOne({ where: { email } }, options);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  findOneById(id: string, options?: IncludeQueryOptions) {
    return this.findOne({ where: { id } }, options);
  }

  async getOneById(id: string, options?: IncludeQueryOptions) {
    const user = await this.findOne({ where: { id } }, options);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async updateOneById(id: string, partialEntity: DeepPartial<UserEntity>) {
    const user = await this.getOneById(id);

    return this.repository.save(this.repository.merge(user, partialEntity));
  }
}
