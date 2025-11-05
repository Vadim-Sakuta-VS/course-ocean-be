import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCourseEntity } from './entities/user-course.entity';
import { UserCoursesController } from './user-courses.controller';
import { UserCoursesService } from './user-courses.service';
import { CoursesModule } from '../cources/cources.module';
import { UserCourseLectureProgressEntity } from './entities/user-course-lecture-progress.entity';
import { UserCourseLecturesProgressRepository } from './repositories/user-course-lectures-progress.repository';
import { UserCoursesRepository } from './repositories/user-courses.repository';
import { UsersModule } from '../users/users.module';
import { WishListEntity } from './entities/wish-list.entity';
import { WishListRepository } from './repositories/wish-list.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCourseEntity,
      UserCourseLectureProgressEntity,
      WishListEntity,
    ]),
    CoursesModule,
    UsersModule,
  ],
  controllers: [UserCoursesController],
  providers: [
    UserCoursesService,
    UserCoursesRepository,
    UserCourseLecturesProgressRepository,
    WishListRepository,
  ],
  exports: [UserCoursesService],
})
export class UserCoursesModule {}
