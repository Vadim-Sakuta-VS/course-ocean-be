import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Cookies } from '../common/decorators/cookies.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signUp(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.authService.signUp(req, res, createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(req, res, loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(
    @Res({ passthrough: true }) res: Response,
    @Cookies(AuthService.USER_SESSION_COOKIE_KEY) userSessionId: string,
  ) {
    return this.authService.logout(res, userSessionId);
  }
}
