import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { PatchReviewDto } from './dto/patch-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsFilterDto } from './dto/reviews-filter.dto';
import { ReviewsService } from './reviews.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { PageableContentDto } from '../common/dto/pageable-content.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Find reviews
   *
   * @throws {400} Bad request
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
          items: { $ref: getSchemaPath(ReviewResponseDto) },
        },
      },
    },
  })
  @Public()
  @Get()
  findAll(
    @User('id') userId: string,
    @Query() filterDto: ReviewsFilterDto,
  ): Promise<PageableContentDto<ReviewResponseDto>> {
    return this.reviewsService.findAll(filterDto, userId);
  }

  /**
   * Create review
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post()
  create(
    @User('id') userId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(userId, dto);
  }

  /**
   * Patch review
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {404} Notfound
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Patch(':id')
  patch(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PatchReviewDto,
  ): Promise<ReviewResponseDto> {
    const cleanDto = JSON.parse(JSON.stringify(dto)) as PatchReviewDto;

    return this.reviewsService.patch(userId, id, cleanDto);
  }

  /**
   * Delete review
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {404} Notfound
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Delete(':id')
  delete(
    @User('id') userId: string,
    @User('roles') userRoles: UserRole[],
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<boolean> {
    return this.reviewsService.delete(userId, userRoles, id);
  }

  /**
   * Like review
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {404} Notfound
   */
  @ApiBearerAuth()
  @ApiQuery({ name: 'cancel', type: 'boolean', required: false })
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post(':id/like')
  setLike(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('cancel') cancel: string,
  ): Promise<boolean> {
    return this.reviewsService.setLike(userId, id, cancel === 'true');
  }

  /**
   * Dislike review
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {404} Notfound
   */
  @ApiBearerAuth()
  @ApiQuery({ name: 'cancel', type: 'boolean', required: false })
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post(':id/dislike')
  setDislike(
    @User('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('cancel') cancel: string,
  ): Promise<boolean> {
    return this.reviewsService.setDislike(userId, id, cancel === 'true');
  }
}
