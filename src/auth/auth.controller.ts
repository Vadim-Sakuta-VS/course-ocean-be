import {
  Body,
  ConsoleLogger,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth } from '@nestjs/swagger';
import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import type { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CreateUserProviderDto } from './dto/create-user-provider.dto';
import { LoginDto } from './dto/login.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Cookies } from '../common/decorators/cookies.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/entities/user.entity';

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
  ): Promise<SuccessResponseDto> {
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
  ): Promise<SuccessResponseDto> {
    return this.authService.login(req, res, loginDto);
  }

  /**
   * Logout user from the system
   *
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
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
    @Res({ passthrough: true }) res: Response,
    @Cookies(AuthService.USER_SESSION_COOKIE_KEY) userSessionId: string,
  ): Promise<SuccessResponseDto> {
    return this.authService.refresh(res, userSessionId);
  }

  @Public()
  @Get('/google')
  google(
    @Req() req: Request,
    @Res() res: Response,
    @Query('redirectUrl') redirectUrl: string,
  ) {
    req.session.oauthState = uuidv4();
    req.session.oauthRedirectUrl = redirectUrl;
    const authenticator = passport.authenticate('google', {
      state: req.session.oauthState,
      scope: ['email', 'profile'],
    }) as (req: Request, res: Response, next?: NextFunction) => void;

    authenticator(req, res);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.providerCallback(req, res);
  }

  @Public()
  @Get('/github')
  github(
    @Req() req: Request,
    @Res() res: Response,
    @Query('redirectUrl') redirectUrl: string,
  ) {
    req.session.oauthState = uuidv4();
    req.session.oauthRedirectUrl = redirectUrl;
    const authenticator = passport.authenticate('github', {
      state: req.session.oauthState,
      scope: ['read:user', 'user:email'],
    }) as (req: Request, res: Response, next?: NextFunction) => void;

    authenticator(req, res);
  }

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
      if (req.query.state !== req.session.oauthState) {
        throw new ForbiddenException();
      }
      await this.authService.signUpWithProvider(
        req,
        res,
        req.user as CreateUserProviderDto,
      );
      const fallbackSuccessUrl = new URL(
        `${this.configService.getOrThrow<string>('EXTERNAL_AUTH_UI_SUCCESS_URL')}?type=${req.user.providerType}`,
      );
      const stateRedirectUrl = new URL(
        req.session?.oauthRedirectUrl || fallbackSuccessUrl,
      );
      const redirectUrl =
        stateRedirectUrl.host === fallbackSuccessUrl.host
          ? stateRedirectUrl.href
          : fallbackSuccessUrl.href;
      req.session.destroy(() => {});

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(error);
      res.redirect(
        `${this.configService.getOrThrow<string>('EXTERNAL_AUTH_UI_ERROR_URL')}?type=${req.user?.providerType}`,
      );
    }
  }
}
