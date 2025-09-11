import { IsEmail, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEXP } from '../constants';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(PASSWORD_REGEXP)
  password: string;
}
