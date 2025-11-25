import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EntityManager } from 'typeorm';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserEntity } from './entities/user.entity';
import { ICreateUserExternal } from './interfaces/create-user-external.interface';
import { ICreateUser } from './interfaces/create-user.interface';
import { UsersRepository } from './repositories/users.repository';
import { IncludeQueryOptions } from './repositories/users.types';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  createNew(
    dto: ICreateUser,
    transactionEntityManger?: EntityManager,
  ): Promise<UserEntity> {
    return this.create(dto, transactionEntityManger);
  }

  createNewExternal(
    dto: ICreateUserExternal,
    transactionEntityManger?: EntityManager,
  ) {
    return this.create(dto, transactionEntityManger);
  }

  private async create(
    payload: Partial<UserEntity>,
    transactionEntityManger?: EntityManager,
  ): Promise<UserEntity> {
    if (payload.email) {
      const user = await this.usersRepository.findOneByEmail(payload.email);
      if (user) {
        throw new ConflictException(
          `User already exists with email ${payload.email}`,
        );
      }
    }

    return this.usersRepository.create(payload, transactionEntityManger);
  }

  findOneById(id: string, options?: IncludeQueryOptions) {
    return this.usersRepository.findOneById(id, options);
  }

  async getOneById(
    id: string,
    options?: IncludeQueryOptions,
  ): Promise<UserEntity> {
    return this.usersRepository.getOneById(id, options);
  }

  findOneByEmail(email: string, options?: IncludeQueryOptions) {
    return this.usersRepository.findOneByEmail(email, options);
  }

  getOneByEmail(email: string, options?: IncludeQueryOptions) {
    return this.usersRepository.getOneByEmail(email, options);
  }

  async updateEmailVerificationToken(userId: string, token: string) {
    const user = await this.usersRepository.updateOneById(userId, {
      emailVerificationToken: token,
    });

    return user.emailVerificationToken === token;
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.getOneById(userId);

    return this.prepareProfileResponse(user);
  }

  prepareProfileResponse(user: UserEntity) {
    return plainToInstance(UserProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
