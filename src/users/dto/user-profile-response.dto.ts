import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class UserProfileResponseDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'avatarUrl',
  'email',
  'roles',
  'isEmailVerified',
  'isTwoFactorEnabled',
]) {}
