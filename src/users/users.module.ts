import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { WishListEntity } from './entities/wish-list.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CoursesModule } from '../cources/cources.module';
import { WishListRepository } from './repositories/wish-list.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, WishListEntity]),
    forwardRef(() => CoursesModule),
  ],
  providers: [UsersService, UsersRepository, WishListRepository],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
