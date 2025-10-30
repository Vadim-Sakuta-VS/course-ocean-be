import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ConfirmOrderedCourseDto } from './dto/confirm-ordered-course.dto';
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
  findAll(
    @User('id') userId: string,
    @User('roles') userRoles: UserRole,
    @Query() dto: UserCoursesFilterDto,
  ): Promise<PageableContentDto<UserCourseResponseDto>> {
    return this.userCoursesService.findAll(userId, {
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
}
