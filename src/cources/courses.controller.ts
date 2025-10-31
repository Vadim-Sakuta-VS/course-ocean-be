import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import {
  PatchCourseOperationsDto,
  PatchedCourseDto,
} from './dto/patch-course.dto';
import { CoursesFilterDto } from './dto/search-query.dto';
import { UploadLectureVideoDto } from './dto/upload-lecture-video.dto';
import { JsonPatchSyntaxPipe } from './pipes/json-patch-syntax.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  IMAGE_MIME_TYPE_REGEXP,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '../common/constants';
import { ApiOkPageableContentResponse } from '../common/decorators/api-ok-pageable-content-response.decorator';
import { User } from '../common/decorators/user.decorator';
import { FileResponseDto } from '../common/dto/file-response.dto';
import { IdsDto } from '../common/dto/ids.dto';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { StringValueDto } from '../common/dto/string-value.dto';
import { MimeType } from '../common/types/enums';
import { UserRole } from '../users/entities/user.entity';

@Controller()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  /**
   * Find courses by filters
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiOkPageableContentResponse(CourseResponseDto)
  @Public()
  @Get('/courses')
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
  @Get('/courses/:id')
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
  @Post('/courses')
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
  @Delete('/courses/bulk')
  deleteBulkCourses(@User('id') userId: string, @Body() dto: IdsDto) {
    return this.coursesService.deleteBulkCourses(userId, dto.ids);
  }

  /**
   * Update course
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('/courses/:id')
  patchCourse(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PatchedCourseDto,
  ): Promise<CourseResponseDto> {
    const cleanDto = JSON.parse(JSON.stringify(dto)) as PatchedCourseDto;

    return this.coursesService.patchCourse(userId, id, cleanDto);
  }

  /**
   * Update course with JSON Patch format (deprecated)
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JsonPatchSyntaxPipe('operations'))
  @Patch('/courses/:id/json-patch')
  patchCourseViaJsonPatch(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PatchCourseOperationsDto,
  ) {
    return this.coursesService.patchCourseViaJsonPatch(userId, id, dto);
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
  @Post('/courses/:id/activate')
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
  @Post('/courses/:id/deactivate')
  deactivateCourse(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.coursesService.deactivateCourse(userId, id);
  }

  /**
   * Upload cover picture
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/courses/:id/cover')
  uploadCourseCover(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: IMAGE_MIME_TYPE_REGEXP,
          }),
          new MaxFileSizeValidator({
            maxSize: MAX_IMAGE_SIZE,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    return this.coursesService.uploadCourseCover(userId, courseId, file);
  }

  /**
   * Delete cover picture
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/courses/cover/:fileId')
  deleteCourseCover(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
  ): Promise<boolean> {
    return this.coursesService.deleteCourseCover(userId, courseId, fileId);
  }

  /**
   * Delete sections (bulk)
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/sections/bulk')
  deleteBulkCourseSections(
    @User('id') userId: string,
    @Body() dto: IdsDto,
  ): Promise<boolean> {
    return this.coursesService.deleteBulkCourseSections(
      userId,
      'TODO',
      dto.ids,
    );
  }

  /**
   * Delete lectures (bulk)
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/lectures/bulk')
  deleteBulkCourseLectures(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: IdsDto,
  ): Promise<boolean> {
    return this.coursesService.deleteBulkCourseLectures(
      userId,
      courseId,
      sectionId,
      dto.ids,
    );
  }

  /**
   * Upload video of lecture
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        isPublic: {
          type: 'boolean',
        },
        duration: {
          type: 'number',
        },
      },
      required: ['file', 'isPublic', 'duration'],
    },
  })
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/lectures/:lectureId/video')
  uploadLectureVideo(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Param('lectureId', new ParseUUIDPipe()) lectureId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: MimeType.MP4 }),
          new MaxFileSizeValidator({
            maxSize: MAX_VIDEO_SIZE,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadLectureVideoDto,
  ): Promise<FileResponseDto> {
    return this.coursesService.uploadLectureVideo(
      userId,
      courseId,
      sectionId,
      lectureId,
      file,
      dto,
    );
  }

  /**
   * Delete video of lecture
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('/lectures/video/:fileId')
  deleteLectureVideo(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Param('lectureId', new ParseUUIDPipe()) lectureId: string,
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
  ): Promise<boolean> {
    return this.coursesService.deleteLectureVideo(
      userId,
      courseId,
      sectionId,
      lectureId,
      fileId,
    );
  }

  /**
   * Make public video of lecture
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/lectures/video/:fileId/make-public')
  makePublicLectureVideo(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Param('lectureId', new ParseUUIDPipe()) lectureId: string,
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
  ): Promise<boolean> {
    return this.coursesService.updatePublicStateLectureVideo(
      userId,
      courseId,
      sectionId,
      lectureId,
      fileId,
      true,
    );
  }

  /**
   * Make private video of lecture
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   * @throws {404} Not found
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/lectures/video/:fileId/make-private')
  makePrivateLectureVideo(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Param('lectureId', new ParseUUIDPipe()) lectureId: string,
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
  ): Promise<boolean> {
    return this.coursesService.updatePublicStateLectureVideo(
      userId,
      courseId,
      sectionId,
      lectureId,
      fileId,
      false,
    );
  }
}
