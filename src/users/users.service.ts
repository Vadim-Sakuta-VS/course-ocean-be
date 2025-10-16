import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  EntityManager,
  FindOneOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { CreateUserExternalDto } from './dto/create-user-external.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { FIND_COURSE_RELATIONS } from '../cources/constants';
import { WishListEntity } from './entities/wish-list.entity';
import { CourseResponseDto } from '../cources/dto/course-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(WishListEntity)
    private readonly wishListRepository: Repository<WishListEntity>,
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

  async findOneById(
    id: string,
    options?: FindOneOptions<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      ...options,
      where: { id, ...options?.where },
    });
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

  async addCoursesToWishList(userId: string, courseIds: string[]) {
    const result = await this.wishListRepository.upsert(
      courseIds.map((courseId) => ({ userId, courseId })),
      {
        conflictPaths: ['userId', 'courseId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return {
      ids: (result.identifiers as WishListEntity[]).map(
        ({ courseId }) => courseId,
      ),
    };
  }

  async deleteCoursesFromWishList(userId: string, courseIds: string[]) {
    const result = await this.wishListRepository.delete({
      userId,
      courseId: In(courseIds),
    });

    return !!result.affected;
  }

  async getWishList(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        wishList: FIND_COURSE_RELATIONS,
      },
    });

    return (
      user?.wishList.map((course) =>
        plainToInstance(CourseResponseDto, course, {
          excludeExtraneousValues: true,
        }),
      ) || []
    );
  }
}
