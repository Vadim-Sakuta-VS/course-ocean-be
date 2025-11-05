import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EntityManager } from 'typeorm';
import { ConfirmOrderedCourseDto } from './dto/confirm-ordered-course.dto';
import { UserCourseResponseDto } from './dto/user-course-response.dto';
import { UserCourseEntity } from './entities/user-course.entity';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { PaymentStatus } from '../payments/types';
import { UserCoursesFilterDto } from './dto/user-courses-filter.dto';
import { CoursesService } from '../cources/courses.service';
import { CreateLectureProgressDto } from './dto/create-lecture-progress.dto';
import { PatchLectureProgressDto } from './dto/patch-lecture-progress.dto';
import { UserCourseLectureProgressResponseDto } from './dto/user-course-lecture-progress-response.dto';
import { UserCourseLectureProgressEntity } from './entities/user-course-lecture-progress.entity';
import { WishListEntity } from './entities/wish-list.entity';
import { IUserCourse } from './interfaces/user-course.interface';
import { UserCourseLecturesProgressRepository } from './repositories/user-course-lectures-progress.repository';
import { UserCoursesRepository } from './repositories/user-courses.repository';
import { WishListRepository } from './repositories/wish-list.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserCoursesService {
  constructor(
    private readonly userCoursesRepository: UserCoursesRepository,
    private readonly userCoursesLecturesProgressRepository: UserCourseLecturesProgressRepository,
    private readonly wishListRepository: WishListRepository,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
  ) {}

  async createUserCourses(
    dto: IUserCourse[],
    transactionManger?: EntityManager,
  ) {
    return this.userCoursesRepository.createBulk(dto, transactionManger);
  }

  async findByUserAndCourseIds(userId: string, courseIds: string[]) {
    return this.userCoursesRepository.findByUserAndCourseIds(userId, courseIds);
  }

  async findAllOrderedCourses(
    userId: string,
    { status, isMy, page, size }: UserCoursesFilterDto,
  ): Promise<PageableContentDto<UserCourseResponseDto>> {
    const [userCourses, total] = await this.userCoursesRepository.findAndCount(
      userId,
      { status, isMy, page, size },
    );

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
    await this.userCoursesRepository.getOne(userId, courseId);

    return this.userCoursesRepository.updateOne({
      userId,
      courseId,
      comment,
      status: PaymentStatus.APPROVED,
    });
  }

  async rejectOrderedCourse({
    userId,
    courseId,
    comment,
  }: ConfirmOrderedCourseDto) {
    await this.userCoursesRepository.getOne(userId, courseId);

    return this.userCoursesRepository.updateOne({
      userId,
      courseId,
      comment,
      status: PaymentStatus.REJECTED,
    });
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

  async createLectureProgress(
    userId: string,
    { courseId, lectureId }: CreateLectureProgressDto,
  ) {
    const isUserLearningCourse = await this.userCoursesRepository.exists({
      userId,
      courseId,
      status: PaymentStatus.APPROVED,
    });
    if (!isUserLearningCourse) {
      throw new ConflictException(
        `User doesn't have course ${courseId} in learning list`,
      );
    }
    const isLectureBelongCourse = await this.userCoursesRepository.exists(
      {
        course: {
          id: courseId,
          sections: {
            lectures: {
              id: lectureId,
            },
          },
        },
      },
      { includeCourse: true },
    );
    if (!isLectureBelongCourse) {
      throw new ConflictException(
        `Course ${courseId} doesn't have lecture ${lectureId}`,
      );
    }
    const isLectureProgressExists =
      await this.userCoursesLecturesProgressRepository.exists({
        userId,
        courseId,
        lectureId,
      });
    if (isLectureProgressExists) {
      throw new ConflictException(
        `Progress for lecture ${lectureId} already exists`,
      );
    }
    const userLectureProgress =
      await this.userCoursesLecturesProgressRepository.create(userId, {
        courseId,
        lectureId,
      });

    return this.prepareUserCourseLectureProgressResponse(userLectureProgress);
  }

  async patchLectureProgress(
    userId: string,
    lectureId: string,
    dto: PatchLectureProgressDto,
  ) {
    const lectureProgress =
      await this.userCoursesLecturesProgressRepository.getOne(
        userId,
        lectureId,
      );
    const updatedLectureProgress =
      await this.userCoursesLecturesProgressRepository.updateOne({
        ...lectureProgress,
        ...dto,
      });

    return this.prepareUserCourseLectureProgressResponse(
      updatedLectureProgress,
    );
  }

  async changeLectureProgressIsCompletedState(
    userId: string,
    lectureId: string,
    isCompleted: boolean,
  ) {
    const lectureProgress =
      await this.userCoursesLecturesProgressRepository.getOne(
        userId,
        lectureId,
      );
    const updatedLectureProgress =
      await this.userCoursesLecturesProgressRepository.updateOne({
        ...lectureProgress,
        isCompleted,
      });

    return this.prepareUserCourseLectureProgressResponse(
      updatedLectureProgress,
    );
  }

  async resetCourseProgress(userId: string, courseId: string) {
    const isCourseProgressExists =
      await this.userCoursesLecturesProgressRepository.exists({
        userId,
        courseId,
      });
    if (!isCourseProgressExists) {
      throw new NotFoundException(`Progress for course ${courseId} not found`);
    }
    await this.userCoursesLecturesProgressRepository.update(
      { userId, courseId },
      { isCompleted: false, lastPositionSeconds: null },
    );

    return this.findCourseProgress(userId, courseId);
  }

  async findCourseProgress(userId: string, courseId: string) {
    const lecturesProgress =
      await this.userCoursesLecturesProgressRepository.findAll({
        where: { userId, courseId },
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

  async addCoursesToWishList(userId: string, courseIds: string[]) {
    const result = await this.wishListRepository.upsertBulk(userId, courseIds);

    return {
      ids: (result.identifiers as WishListEntity[]).map(
        ({ courseId }) => courseId,
      ),
    };
  }

  async deleteCoursesFromWishList(userId: string, courseIds: string[]) {
    return this.wishListRepository.deleteBulk(userId, courseIds);
  }

  async getWishList(userId: string) {
    const user = await this.usersService.findOneById(userId, {
      includeWishList: true,
    });

    return await Promise.all(
      user?.wishList.map((course) =>
        this.coursesService.prepareCourseResponse(course),
      ) || [],
    );
  }
}
