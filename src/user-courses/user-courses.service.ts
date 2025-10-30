import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CreateLectureProgressDto } from './dto/create-lecture-progress.dto';
import { PatchLectureProgressDto } from './dto/patch-lecture-progress.dto';
import { UserCourseLectureProgressResponseDto } from './dto/user-course-lecture-progress-response.dto';
import { UserCourseLectureProgressEntity } from './entities/user-course-lecture-progress.entity';

@Injectable()
export class UserCoursesService {
  constructor(
    @InjectRepository(UserCourseEntity)
    private readonly userCoursesRepository: Repository<UserCourseEntity>,
    @InjectRepository(UserCourseLectureProgressEntity)
    private readonly userCoursesProgressRepository: Repository<UserCourseLectureProgressEntity>,
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

  async findAllOrderedCourses(
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

  private async checkLectureProgressPermissions(
    userId: string,
    courseId: string,
    lectureId?: string,
  ) {
    const isUserLearningCourse = await this.userCoursesRepository.exists({
      where: { userId, courseId, status: PaymentStatus.APPROVED },
      select: { courseId: true },
    });
    if (!isUserLearningCourse) {
      throw new ConflictException(
        `User doesn't have course ${courseId} in learning list`,
      );
    }
    if (lectureId) {
      const isLectureBelongCourse = await this.userCoursesRepository.exists({
        where: {
          course: {
            id: courseId,
            sections: {
              lectures: {
                id: lectureId,
              },
            },
          },
        },
        relations: {
          course: {
            sections: {
              lectures: true,
            },
          },
        },
      });
      if (!isLectureBelongCourse) {
        throw new ConflictException(
          `Course ${courseId} doesn't have lecture ${lectureId}`,
        );
      }
    }
  }

  async createLectureProgress(
    userId: string,
    { courseId, lectureId }: CreateLectureProgressDto,
  ) {
    await this.checkLectureProgressPermissions(userId, courseId, lectureId);
    const isLectureProgressExists =
      await this.userCoursesProgressRepository.exists({
        where: { userId, courseId, lectureId },
      });
    if (isLectureProgressExists) {
      throw new ConflictException(
        `Progress for lecture ${lectureId} already exists`,
      );
    }
    const userLectureProgress = await this.userCoursesProgressRepository.save({
      userId,
      courseId,
      lectureId,
    });

    return this.prepareUserCourseLectureProgressResponse(userLectureProgress);
  }

  async patchLectureProgress(
    userId: string,
    courseId: string,
    lectureId: string,
    dto: PatchLectureProgressDto,
  ) {
    await this.checkLectureProgressPermissions(userId, courseId, lectureId);
    const lectureProgress = await this.userCoursesProgressRepository.findOne({
      where: { userId, courseId, lectureId },
    });
    const updatedLectureProgress =
      await this.userCoursesProgressRepository.save({
        ...lectureProgress,
        ...dto,
      });

    return this.prepareUserCourseLectureProgressResponse(
      updatedLectureProgress,
    );
  }

  async changeLectureProgressIsCompletedState(
    userId: string,
    courseId: string,
    lectureId: string,
    isCompleted: boolean,
  ) {
    await this.checkLectureProgressPermissions(userId, courseId, lectureId);
    const lectureProgress = await this.userCoursesProgressRepository.findOne({
      where: { userId, courseId, lectureId },
    });
    const updatedLectureProgress =
      await this.userCoursesProgressRepository.save({
        ...lectureProgress,
        isCompleted,
      });

    return this.prepareUserCourseLectureProgressResponse(
      updatedLectureProgress,
    );
  }

  async resetCourseProgress(userId: string, courseId: string) {
    await this.checkLectureProgressPermissions(userId, courseId);
    const result = await this.userCoursesProgressRepository.update(
      { userId, courseId },
      { isCompleted: false, lastPositionSeconds: null },
    );

    return !!result.affected;
  }

  async findCourseProgress(userId: string, courseId: string) {
    await this.checkLectureProgressPermissions(userId, courseId);
    const lecturesProgress = await this.userCoursesProgressRepository.find({
      where: { userId, courseId },
      order: {
        updatedAt: 'DESC',
      },
    });

    return lecturesProgress.map((lecturesProgress) =>
      this.prepareUserCourseLectureProgressResponse(lecturesProgress),
    );
  }

  prepareUserCourseLectureProgressResponse(
    lectureProgress: UserCourseLectureProgressEntity,
  ): UserCourseLectureProgressResponseDto {
    return plainToInstance(
      UserCourseLectureProgressResponseDto,
      lectureProgress,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
