import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class AuthorResponseDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'avatarUrl',
]) {}
