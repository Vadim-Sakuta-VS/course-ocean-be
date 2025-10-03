import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import jsonpatch from 'fast-json-patch';
import { DeepPartial, In, Repository } from 'typeorm';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from './entities/course.entity';
import { TransactionService } from '../common/services/transaction.service';
import { UsersService } from '../users/users.service';
import {
  PatchCourseOperationsDto,
  PatchedCourseDto,
} from './dto/patch-course.dto';

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

  async findOneCourse(id: string, withRelations = false) {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: withRelations
        ? {
            sections: {
              lectures: true,
            },
          }
        : undefined,
      order: {
        sections: {
          order: 'ASC',
          lectures: {
            order: 'ASC',
          },
        },
      },
    });
    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    return course;
  }

  async deleteCourse(userId: string, id: string) {
    const course = await this.findOneCourse(id);
    this.checkUserPermission(course, userId);
    const result = await this.coursesRepository.delete({
      id,
      authorId: userId,
    });

    return !!result.affected;
  }

  async deleteBulkCourses(userId: string, ids: string[]) {
    const courses = await this.coursesRepository.find({
      where: { id: In(ids) },
    });
    courses.forEach((c) => this.checkUserPermission(c, userId));
    const result = await this.coursesRepository.delete({
      id: In(ids),
      authorId: userId,
    });

    return !!result.affected;
  }

  async patchCourse(userId: string, id: string, dto: PatchCourseOperationsDto) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const course = await this.findOneCourse(id, true);
        this.checkUserPermission(course, userId);
        course.author = await this.usersService.findOneById(userId);
        const patchResult = jsonpatch.applyPatch<CourseEntity>(
          jsonpatch.deepClone(course),
          dto.operations,
        );
        const validationErrors = await validate(
          plainToInstance(PatchedCourseDto, patchResult.newDocument, {
            excludeExtraneousValues: true,
          }),
          {
            validationError: {
              target: false,
              value: false,
            },
          },
        );
        if (validationErrors.length) {
          throw new BadRequestException(validationErrors);
        }
        const courseRepository =
          transactionEntityManger.getRepository(CourseEntity);
        const updatedCourse = courseRepository.save(patchResult.newDocument);

        return plainToInstance(CourseResponseDto, updatedCourse, {
          excludeExtraneousValues: true,
        });
      },
    );
  }

  private checkUserPermission(course: CourseEntity, userId: string) {
    if (course.authorId !== userId) {
      throw new ForbiddenException();
    }
  }
}
