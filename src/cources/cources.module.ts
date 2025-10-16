import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';
import { LectureContentEntity } from './entities/lecture-content.entity';
import { SectionContentEntity } from './entities/section-content.entity';
import { TransactionService } from '../common/services/transaction.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    CategoriesModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      SectionContentEntity,
      LectureContentEntity,
    ]),
    UsersModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, TransactionService],
})
export class CoursesModule {}
