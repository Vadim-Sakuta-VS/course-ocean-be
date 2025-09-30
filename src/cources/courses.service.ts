import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DeepPartial, Repository } from 'typeorm';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from './entities/course.entity';
import { TransactionService } from '../common/services/transaction.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private coursesRepository: Repository<CourseEntity>,
    private transactionService: TransactionService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, { topicId, ...dto }: CreateCourseDto) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const coursesRepository =
          transactionEntityManger.getRepository(CourseEntity);

        const course = await coursesRepository.save({
          ...dto,
          author: { id: userId },
          topic: { id: topicId },
        } as unknown as DeepPartial<CourseEntity>);
        course.author = await this.usersService.findOneById(userId);

        return plainToInstance(CourseResponseDto, course, {
          excludeExtraneousValues: true,
        });
      },
    );
  }
}
