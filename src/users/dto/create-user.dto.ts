import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEXP } from '../../auth/constants';
import { ICreateUser } from '../interfaces/create-user.interface';

export class CreateUserDto implements ICreateUser {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @Matches(PASSWORD_REGEXP)
  password: string;
}
