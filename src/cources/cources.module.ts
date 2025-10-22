import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';
import { LectureContentEntity } from './entities/lecture-content.entity';
import { SectionContentEntity } from './entities/section-content.entity';
import { S3Service } from '../common/services/s3';
import { TransactionService } from '../common/services/transaction.service';
import { FileEntity } from '../files/entities/file.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      SectionContentEntity,
      LectureContentEntity,
      FileEntity,
    ]),
    UsersModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, TransactionService, S3Service],
})
export class CoursesModule {}
