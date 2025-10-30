import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCourseEntity } from './entities/user-course.entity';
import { UserCoursesController } from './user-courses.controller';
import { UserCoursesService } from './user-courses.service';
import { CoursesModule } from '../cources/cources.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserCourseEntity]), CoursesModule],
  controllers: [UserCoursesController],
  providers: [UserCoursesService],
})
export class UserCoursesModule {}
