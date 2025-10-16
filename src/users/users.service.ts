import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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
    const usersRepository = transactionEntityManger
      ? transactionEntityManger.getRepository(UserEntity)
      : this.usersRepository;
    const user = await usersRepository.findOne({ where: { email } });
    if (user) {
      throw new ConflictException(`User already exists with email ${email}`);
    }

    const newUser = usersRepository.create({
      firstName,
      lastName,
      email,
      password,
    });
    await usersRepository.save(newUser);

    return newUser;
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

  async updateEmailVerificationToken(userId: string, token: string) {
    const result = await this.usersRepository.update(
      { id: userId },
      { emailVerificationToken: token },
    );

    return !!result.affected;
  }
}
