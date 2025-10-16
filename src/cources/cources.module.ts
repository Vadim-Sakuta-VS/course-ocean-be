import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';
import { LectureContentEntity } from './entities/lecture-content.entity';
import { SectionContentEntity } from './entities/section-content.entity';
import { TransactionService } from '../common/services/transaction.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    CategoriesModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      SectionContentEntity,
      LectureContentEntity,
      UserEntity,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, TransactionService, UsersService],
})
export class CoursesModule {}
