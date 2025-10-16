import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { IdsDto } from '../common/dto/ids.dto';
import { CourseResponseDto } from '../cources/dto/course-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get user cart of courses
   *
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Get('cart')
  getCart(@User('id') userId: string): Promise<CourseResponseDto[]> {
    return this.usersService.getCart(userId);
  }

  /**
   * Get wish list
   *
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Get('wish-list')
  getWishList(@User('id') userId: string): Promise<CourseResponseDto[]> {
    return this.usersService.getWishList(userId);
  }

  /**
   * Add courses to wish list
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post('wish-list')
  addCoursesToWishList(
    @User('id') userId: string,
    @Body() dto: IdsDto,
  ): Promise<IdsDto> {
    return this.usersService.addCoursesToWishList(userId, dto.ids);
  }

  /**
   * Delete courses from wish list
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Delete('wish-list')
  deleteCoursesFromWishList(
    @User('id') userId: string,
    @Body() dto: IdsDto,
  ): Promise<boolean> {
    return this.usersService.deleteCoursesFromWishList(userId, dto.ids);
  }
}
