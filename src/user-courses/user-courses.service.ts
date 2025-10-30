import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { ConfirmOrderedCourseDto } from './dto/confirm-ordered-course.dto';
import { UserCourseEntity } from './entities/user-course.entity';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { PaymentStatus } from '../payments/types';
import { UserCoursesFilterDto } from './dto/user-courses-filter.dto';
import { FIND_COURSE_RELATIONS } from '../cources/constants';
import { UserCourseResponseDto } from './dto/user-course-response.dto';
import { CoursesService } from '../cources/courses.service';

@Injectable()
export class UserCoursesService {
  constructor(
    @InjectRepository(UserCourseEntity)
    private readonly userCoursesRepository: Repository<UserCourseEntity>,
    private readonly coursesService: CoursesService,
  ) {}

  private async findOne(
    userId: string,
    courseId: string,
  ): Promise<UserCourseEntity> {
    const userCourse = await this.userCoursesRepository.findOne({
      where: { userId, courseId },
    });
    if (!userCourse) {
      throw new NotFoundException(`User course doesn't exist`);
    }

    return userCourse;
  }

  async findAll(
    userId: string,
    { status, isMy, page, size }: UserCoursesFilterDto,
  ): Promise<PageableContentDto<UserCourseResponseDto>> {
    const [userCourses, total] = await this.userCoursesRepository.findAndCount({
      where: { userId: isMy ? userId : undefined, status },
      take: size,
      skip: page * size,
      relations: {
        user: true,
        course: FIND_COURSE_RELATIONS,
      },
    });

    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      content: await Promise.all(
        userCourses.map((userCourse) =>
          this.prepareUserCourseResponse(userCourse),
        ),
      ),
    };
  }

  async approveOrderedCourse({
    userId,
    courseId,
    comment,
  }: ConfirmOrderedCourseDto) {
    await this.findOne(userId, courseId);
    await this.userCoursesRepository.save({
      userId,
      courseId,
      comment,
      status: PaymentStatus.APPROVED,
    });

    return true;
  }

  async rejectOrderedCourse({
    userId,
    courseId,
    comment,
  }: ConfirmOrderedCourseDto) {
    await this.findOne(userId, courseId);
    await this.userCoursesRepository.save({
      userId,
      courseId,
      comment,
      status: PaymentStatus.REJECTED,
    });

    return true;
  }

  async prepareUserCourseResponse(
    userCourse: UserCourseEntity,
  ): Promise<UserCourseResponseDto> {
    const res = plainToInstance(UserCourseResponseDto, userCourse, {
      excludeExtraneousValues: true,
    });
    res.course = await this.coursesService.prepareCourseResponse(
      userCourse.course,
    );

    return res;
  }
}
