import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';
import { LectureContentEntity } from './entities/lecture-content.entity';
import { SectionContentEntity } from './entities/section-content.entity';
import { CoursesRepository } from './repositories/courses.repository';
import { S3Service } from '../common/services/s3';
import { TransactionService } from '../common/services/transaction.service';
import { FileEntity } from '../files/entities/file.entity';
import { UsersModule } from '../users/users.module';
import { LectureContentRepository } from './repositories/lecture-content.repository';
import { SectionContentRepository } from './repositories/section-content.repository';
import { FilesRepository } from '../files/repositories/files.repository';

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
  providers: [
    CoursesService,
    TransactionService,
    S3Service,
    CoursesRepository,
    SectionContentRepository,
    LectureContentRepository,
    FilesRepository,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
