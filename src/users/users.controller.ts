import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get user profile
   *
   * @throws {401} Unauthorized
   * @throws {404} Not found
   */
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get('/profile')
  getProfile(@User('id') userId: string): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(userId);
  }
}
