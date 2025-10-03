import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { PatchCourseOperationsDto } from './dto/patch-course.dto';
import { JsonPatchSyntaxPipe } from './pipes/json-patch-syntax.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { IdsDto } from '../common/dto/ids.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  /**
   * Create course draft
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @User('id') userId: string,
    @Body() dto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.create(userId, dto);
  }

  /**
   * Delete bulk courses by ids
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/bulk')
  deleteBulkCourses(@User('id') userId: string, @Body() dto: IdsDto) {
    return this.coursesService.deleteBulkCourses(userId, dto.ids);
  }

  /**
   * Delete course by id
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/:id')
  deleteCourse(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.coursesService.deleteCourse(userId, id);
  }

  /**
   * Update course with JSON Patch format
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JsonPatchSyntaxPipe('operations'))
  @Patch('/:id')
  patchCourse(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PatchCourseOperationsDto,
  ) {
    return this.coursesService.patchCourse(userId, id, dto);
  }
}
