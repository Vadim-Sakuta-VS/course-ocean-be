import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class UserShortResponseDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'avatarUrl',
]) {}
