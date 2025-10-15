import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
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
}
