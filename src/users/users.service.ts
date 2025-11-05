import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { WishListEntity } from './entities/wish-list.entity';
import { CoursesService } from '../cources/courses.service';
import { ICreateUserExternal } from './interfaces/create-user-external.interface';
import { ICreateUser } from './interfaces/create-user.interface';
import { UsersRepository } from './repositories/users.repository';
import { IncludeQueryOptions } from './repositories/users.types';
import { WishListRepository } from './repositories/wish-list.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly wishListRepository: WishListRepository,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
  ) {}

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

  async addCoursesToWishList(userId: string, courseIds: string[]) {
    const result = await this.wishListRepository.upsertBulk(userId, courseIds);

    return {
      ids: (result.identifiers as WishListEntity[]).map(
        ({ courseId }) => courseId,
      ),
    };
  }

  async deleteCoursesFromWishList(userId: string, courseIds: string[]) {
    return this.wishListRepository.deleteBulk(userId, courseIds);
  }

  async getWishList(userId: string) {
    const user = await this.usersRepository.findOneById(userId, {
      includeWishList: true,
    });

    return await Promise.all(
      user?.wishList.map((course) =>
        this.coursesService.prepareCourseResponse(course),
      ) || [],
    );
  }
}
