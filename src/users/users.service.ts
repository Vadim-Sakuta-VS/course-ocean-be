import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserExternalDto } from './dto/create-user-external.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createNew(
    { firstName, lastName, email, password }: CreateUserDto,
    transactionEntityManger?: EntityManager,
  ): Promise<UserEntity> {
    return await this.create(
      { firstName, lastName, email, password },
      transactionEntityManger,
    );
  }

  async createNewExternal(
    {
      email,
      firstName,
      lastName,
      avatarUrl,
      isEmailVerified,
    }: CreateUserExternalDto,
    transactionEntityManger?: EntityManager,
  ) {
    return await this.create(
      {
        firstName,
        lastName,
        email,
        avatarUrl: avatarUrl || undefined,
        isEmailVerified,
      },
      transactionEntityManger,
    );
  }

  private async create(
    payload: Partial<UserEntity>,
    transactionEntityManger?: EntityManager,
  ): Promise<UserEntity> {
    const usersRepository = transactionEntityManger
      ? transactionEntityManger.getRepository(UserEntity)
      : this.usersRepository;
    const user = await usersRepository.findOne({
      where: { email: payload.email },
    });
    if (user) {
      throw new ConflictException(
        `User already exists with email ${payload.email}`,
      );
    }

    return await usersRepository.save(payload);
  }

  async findOneById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findOne(
    where: FindOptionsWhere<UserEntity>,
    transactionEntityManger?: EntityManager,
  ): Promise<UserEntity | null> {
    const usersRepository = transactionEntityManger
      ? transactionEntityManger.getRepository(UserEntity)
      : this.usersRepository;

    return await usersRepository.findOne({
      where,
      relations: { providers: true },
    });
  }

  async updateEmailVerificationToken(userId: string, token: string) {
    const result = await this.usersRepository.update(
      { id: userId },
      { emailVerificationToken: token },
    );

    return !!result.affected;
  }
}
