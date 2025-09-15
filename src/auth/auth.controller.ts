import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { Cookies } from '../common/decorators/cookies.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  signUp(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.authService.signUp(req, res, createUserDto);
  }

  @Public()
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

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refresh(@Cookies(AuthService.USER_SESSION_COOKIE_KEY) userSessionId: string) {
    return this.authService.refresh(userSessionId);
  }
}
