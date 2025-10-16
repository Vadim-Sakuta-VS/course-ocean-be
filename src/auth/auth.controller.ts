import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import { LoginDto } from './dto/login.dto';
import { Cookies } from '../common/decorators/cookies.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Sign Up new user in the system
   *
   * @throws {400} Bad request
   */
  @Public()
  @Post('/signup')
  signUp(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto,
  ): Promise<AccessTokenResponseDto> {
    return this.authService.signUp(req, res, createUserDto);
  }

  /**
   * Login user in the system
   *
   * @throws {400} Bad request
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ): Promise<AccessTokenResponseDto> {
    return this.authService.login(req, res, loginDto);
  }

  /**
   * Logout user from the system
   *
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(
    @Res({ passthrough: true }) res: Response,
    @Cookies(AuthService.USER_SESSION_COOKIE_KEY) userSessionId: string,
  ) {
    return this.authService.logout(res, userSessionId);
  }

  /**
   * Refresh user session
   *
   * @throws {401} Unauthorized
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refresh(
    @Cookies(AuthService.USER_SESSION_COOKIE_KEY) userSessionId: string,
  ): Promise<AccessTokenResponseDto> {
    return this.authService.refresh(userSessionId);
  }
}
