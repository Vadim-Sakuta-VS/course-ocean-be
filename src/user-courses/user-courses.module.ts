import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCourseEntity } from './entities/user-course.entity';
import { UserCoursesController } from './user-courses.controller';
import { UserCoursesService } from './user-courses.service';
import { CoursesModule } from '../cources/cources.module';
import { UserCourseLectureProgressEntity } from './entities/user-course-lecture-progress.entity';
import { UserCourseLecturesProgressRepository } from './repositories/user-course-lectures-progress.repository';
import { UserCoursesRepository } from './repositories/user-courses.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCourseEntity,
      UserCourseLectureProgressEntity,
    ]),
    CoursesModule,
  ],
  controllers: [UserCoursesController],
  providers: [
    UserCoursesService,
    UserCoursesRepository,
    UserCourseLecturesProgressRepository,
  ],
  exports: [UserCoursesService],
})
export class UserCoursesModule {}
