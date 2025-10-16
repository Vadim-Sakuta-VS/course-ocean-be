import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { PatchCourseOperationsDto } from './dto/patch-course.dto';
import { CoursesFilterDto } from './dto/search-query.dto';
import { JsonPatchSyntaxPipe } from './pipes/json-patch-syntax.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PageableContentDto } from '../auth/dto/pageable-content.dto';
import { User } from '../common/decorators/user.decorator';
import { IdsDto } from '../common/dto/ids.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  /**
   * Find courses by filters
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiOkResponse({
    schema: {
      properties: {
        page: {
          type: 'number',
        },
        size: {
          type: 'number',
        },
        total: {
          type: 'number',
        },
        totalPages: {
          type: 'number',
        },
        content: {
          type: 'array',
          items: { $ref: getSchemaPath(CourseResponseDto) },
        },
      },
    },
  })
  @Public()
  @Get()
  findAll(
    @Query() query: CoursesFilterDto,
    @User() user: Express.User,
  ): Promise<PageableContentDto<CourseResponseDto>> {
    return this.coursesService.findCourses({
      ...query,
      isActive: !user?.roles?.includes(UserRole.ADMIN) ? true : query.isActive,
    });
  }

  /**
   * Find one course by id
   *
   * @throws {400} Bad request
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @Public()
  @Get(':id')
  findOne(
    @User() user: Express.User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CourseResponseDto> {
    return this.coursesService.findOneCourse(
      id,
      !user?.roles?.includes(UserRole.ADMIN),
    );
  }

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
   * @throws {404} Not found
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
   * @throws {404} Not found
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

  /**
   * Activate draft course
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('/:id/activate')
  activateCourse(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.coursesService.activateCourse(userId, id);
  }

  /**
   * Deactivate course - make it a draft
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('/:id/deactivate')
  deactivateCourse(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.coursesService.deactivateCourse(userId, id);
  }
}
