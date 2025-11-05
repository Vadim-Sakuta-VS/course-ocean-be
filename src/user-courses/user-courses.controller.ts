import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ConfirmOrderedCourseDto } from './dto/confirm-ordered-course.dto';
import { CreateLectureProgressDto } from './dto/create-lecture-progress.dto';
import { PatchLectureProgressDto } from './dto/patch-lecture-progress.dto';
import { UserCourseLectureProgressResponseDto } from './dto/user-course-lecture-progress-response.dto';
import { UserCourseResponseDto } from './dto/user-course-response.dto';
import { UserCoursesFilterDto } from './dto/user-courses-filter.dto';
import { UserCoursesService } from './user-courses.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiOkPageableContentResponse } from '../common/decorators/api-ok-pageable-content-response.decorator';
import { User } from '../common/decorators/user.decorator';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('user-courses')
export class UserCoursesController {
  constructor(private readonly userCoursesService: UserCoursesService) {}

  /**
   * Find user courses
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiOkPageableContentResponse(UserCourseResponseDto)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Get()
  findAllOrderedCourses(
    @User('id') userId: string,
    @User('roles') userRoles: UserRole,
    @Query() dto: UserCoursesFilterDto,
  ): Promise<PageableContentDto<UserCourseResponseDto>> {
    return this.userCoursesService.findAllOrderedCourses(userId, {
      ...dto,
      isMy: !userRoles.includes(UserRole.ADMIN) || dto.isMy,
    });
  }

  /**
   * Approve ordered course
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/approve')
  approveOrderedCourse(@Body() dto: ConfirmOrderedCourseDto) {
    return this.userCoursesService.approveOrderedCourse(dto);
  }

  /**
   * Reject ordered course
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/reject')
  rejectOrderedCourse(@Body() dto: ConfirmOrderedCourseDto) {
    return this.userCoursesService.rejectOrderedCourse(dto);
  }

  /**
   * Create lecture progress
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post('/progress')
  createLectureProgress(
    @User('id') userId: string,
    @Body() dto: CreateLectureProgressDto,
  ): Promise<UserCourseLectureProgressResponseDto> {
    return this.userCoursesService.createLectureProgress(userId, dto);
  }

  /**
   * Patch lecture progress
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Patch('/progress/lectures/:lectureId')
  patchLectureProgress(
    @User('id') userId: string,
    @Param('lectureId', new ParseUUIDPipe()) lectureId: string,
    @Body() dto: PatchLectureProgressDto,
  ): Promise<UserCourseLectureProgressResponseDto> {
    const cleanDto = JSON.parse(JSON.stringify(dto)) as PatchLectureProgressDto;

    return this.userCoursesService.patchLectureProgress(
      userId,
      lectureId,
      cleanDto,
    );
  }

  /**
   * Complete lecture progress
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Post('/progress/lectures/:lectureId/complete')
  completeLectureProgress(
    @User('id') userId: string,
    @Param('lectureId', new ParseUUIDPipe()) lectureId: string,
  ): Promise<UserCourseLectureProgressResponseDto> {
    return this.userCoursesService.changeLectureProgressIsCompletedState(
      userId,
      lectureId,
      true,
    );
  }

  /**
   * Reset lecture progress
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Post('/progress/lectures/:lectureId/reset')
  resetLectureProgress(
    @User('id') userId: string,
    @Param('lectureId', new ParseUUIDPipe()) lectureId: string,
  ): Promise<UserCourseLectureProgressResponseDto> {
    return this.userCoursesService.changeLectureProgressIsCompletedState(
      userId,
      lectureId,
      false,
    );
  }

  /**
   * Reset course progress
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Post('/progress/:courseId')
  resetCourseProgress(
    @User('id') userId: string,
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
  ): Promise<UserCourseLectureProgressResponseDto[]> {
    return this.userCoursesService.resetCourseProgress(userId, courseId);
  }

  /**
   * Get course progress
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Get('/progress/:courseId')
  findCourseProgress(
    @User('id') userId: string,
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
  ): Promise<UserCourseLectureProgressResponseDto[]> {
    return this.userCoursesService.findCourseProgress(userId, courseId);
  }
}
