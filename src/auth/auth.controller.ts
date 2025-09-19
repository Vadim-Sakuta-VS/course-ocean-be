import {
  Body,
  ConsoleLogger,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import { CreateUserProviderDto } from './dto/create-user-provider.dto';
import { LoginDto } from './dto/login.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Cookies } from '../common/decorators/cookies.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  private logger = new ConsoleLogger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  google() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.providerCallback(req, res);
  }

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get('/github')
  github() {}

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get('/github/callback')
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    await this.providerCallback(req, res);
  }

  async providerCallback(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new UnauthorizedException();
      }
      const token = await this.authService.signUpWithProvider(
        req,
        res,
        req.user as CreateUserProviderDto,
      );

      res.redirect(
        `${this.configService.getOrThrow<string>('EXTERNAL_AUTH_UI_SUCCESS_URL')}?type=${req.user.providerType}&token=${token.accessToken}`,
      );
    } catch (error) {
      this.logger.error(error);
      res.redirect(
        `${this.configService.getOrThrow<string>('EXTERNAL_AUTH_UI_ERROR_URL')}?type=${req.user?.providerType}`,
      );
    }
  }
}
