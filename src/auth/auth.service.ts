import {
  ConflictException,
  ConsoleLogger,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import bcrypt from 'bcrypt';
import ms from 'ms';
import { EntityManager } from 'typeorm';
import type { Request, Response } from 'express';
import { ACCESS_TOKEN_COOKIE_KEY, USER_SESSION_COOKIE_KEY } from './constants';
import { verifyEmailTemplate } from '../common/constants/email-templates';
import { TransactionService } from '../common/services/transaction.service';
import { __IS_PROD__ } from '../config/constants';
import { MailerService } from '../mailer/mailer.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { IAuthUserViaProvider } from './interfaces/auth-user-via-provider.interface';
import { UserProvidersRepository } from './repositories/user-providers.repository';
import { UserSessionsRepository } from './repositories/user-sessions.repository';
import { JwtPayload, JwtTokenType } from './types';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { getClientMetadata } from '../common/utils/clientMetadata';
import { ICreateUser } from '../users/interfaces/create-user.interface';

@Injectable()
export class AuthService {
  public static USER_SESSION_COOKIE_KEY = USER_SESSION_COOKIE_KEY;
  public static ACCESS_TOKEN_COOKIE_KEY = ACCESS_TOKEN_COOKIE_KEY;
  private static JWT_ACCESS_TOKEN_EXPIRATION_TIME: ms.StringValue;
  private static JWT_REFRESH_TOKEN_EXPIRATION_TIME: ms.StringValue;
  private static EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME: ms.StringValue;
  private static BCRYPT_HASH_SALT: number;
  private logger = new ConsoleLogger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private userSessionsRepository: UserSessionsRepository,
    private userProvidersRepository: UserProvidersRepository,
    private transactionService: TransactionService,
  ) {
    AuthService.JWT_ACCESS_TOKEN_EXPIRATION_TIME =
      this.configService.getOrThrow<ms.StringValue>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      );
    AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME =
      this.configService.getOrThrow<ms.StringValue>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      );
    AuthService.EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME =
      this.configService.getOrThrow<ms.StringValue>(
        'EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME',
      );
    AuthService.BCRYPT_HASH_SALT =
      +this.configService.getOrThrow<string>('BCRYPT_HASH_SALT');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async revokeUsersSessions() {
    const result = await this.userSessionsRepository.revokeSessions();
    this.logger.log(
      `${result.affected} session${Number(result.affected) > 1 || !result.affected ? 's are' : ' is'} revoked`,
    );
  }

  async signUp(
    req: Request,
    res: Response,
    { firstName, lastName, email, password }: ICreateUser,
  ): Promise<SuccessResponseDto> {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const hashedPassword = await this.getHashString(password);
        const user = await this.usersService.createNew(
          {
            firstName,
            lastName,
            email,
            password: hashedPassword,
          },
          transactionEntityManger,
        );
        const tokens = await this.createUserSession(
          req,
          res,
          user,
          transactionEntityManger,
        );
        this.requestEmailVerification(user).catch((err) => {
          this.logger.error('Failed to request email verification', err);
        });

        return { success: !!tokens.accessToken };
      },
    );
  }

  async signUpWithProvider(
    req: Request,
    res: Response,
    {
      email,
      firstName,
      lastName,
      avatarUrl,
      isEmailVerified,
      providerType,
      providerId,
    }: IAuthUserViaProvider,
  ): Promise<SuccessResponseDto> {
    return await this.transactionService.runInTransaction(
      async (transactionManger) => {
        let user = await this.usersService.findOneByEmail(email, {
          includeProviders: true,
        });
        if (!user) {
          user = await this.usersService.createNewExternal(
            {
              email,
              firstName,
              lastName,
              avatarUrl,
              isEmailVerified,
            },
            transactionManger,
          );
        }
        const provider = user.providers?.find(
          (provider) =>
            provider.providerId === providerId &&
            provider.type === providerType,
        );
        // создаем провайдер
        await this.userProvidersRepository.createOrUpdate(
          {
            id: provider?.id,
            user,
            providerId,
            type: providerType,
          },
          transactionManger,
        );
        // удалить провайдер, если изменилась локальная почта
        await this.userProvidersRepository.deleteProviderByIdAndEmail(
          providerId,
          email,
          transactionManger,
        );
        try {
          await this.logout(
            res,
            req.cookies[AuthService.USER_SESSION_COOKIE_KEY] as string,
            transactionManger,
          );
        } catch (error) {
          this.logger.error(
            'signUpExternal: Failed to logout (revoke session)',
            error,
          );
        }
        const tokens = await this.createUserSession(
          req,
          res,
          user,
          transactionManger,
        );

        return { success: !!tokens.accessToken };
      },
    );
  }

  async login(
    req: Request,
    res: Response,
    { email, password }: LoginDto,
  ): Promise<SuccessResponseDto> {
    const user = await this.usersService.getOneByEmail(email);
    const isPasswordsEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordsEqual) {
      throw new ConflictException('Incorrect email or password');
    }
    try {
      await this.logout(
        res,
        req.cookies[AuthService.USER_SESSION_COOKIE_KEY] as string,
      );
    } catch (error) {
      this.logger.error('login: Failed to logout (revoke session)', error);
    }
    const tokens = await this.createUserSession(req, res, user);

    return { success: !!tokens.accessToken };
  }

  private async createUserSession(
    req: Request,
    res: Response,
    user: UserEntity,
    transactionManger?: EntityManager,
  ) {
    const clientMetadata = getClientMetadata(req);
    const tokens = await this.generateTokens(user);
    const userSession = await this.userSessionsRepository.create(
      {
        user,
        ipAddress: clientMetadata.ipAddress,
        userAgentInfo: clientMetadata.userAgentInfo,
        token: await this.getHashString(tokens.refreshToken),
        expiresAt: new Date(
          Date.now() + ms(AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
        ),
      },
      transactionManger,
    );
    res.cookie(AuthService.USER_SESSION_COOKIE_KEY, userSession.id, {
      httpOnly: true,
      secure: __IS_PROD__,
      maxAge: ms(AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
    });
    res.cookie(AuthService.ACCESS_TOKEN_COOKIE_KEY, tokens.accessToken, {
      httpOnly: true,
      secure: __IS_PROD__,
      maxAge: ms(AuthService.JWT_ACCESS_TOKEN_EXPIRATION_TIME),
    });

    return tokens;
  }

  async logout(
    res: Response,
    userSessionId: string,
    transactionManger?: EntityManager,
  ) {
    try {
      if (userSessionId) {
        await this.userSessionsRepository.revokeSessionById(
          userSessionId,
          transactionManger,
        );
      }
      res.clearCookie(AuthService.USER_SESSION_COOKIE_KEY);
      res.clearCookie(AuthService.ACCESS_TOKEN_COOKIE_KEY);

      return { success: true };
    } catch (error) {
      this.logger.error(`Logout failed`, error);
      throw new InternalServerErrorException('Error');
    }
  }

  async refresh(
    res: Response,
    userSessionId: string,
  ): Promise<SuccessResponseDto> {
    if (!userSessionId) {
      throw new UnauthorizedException();
    }
    const userSession = await this.userSessionsRepository.findActiveSessionById(
      userSessionId,
      { includeUser: true },
    );
    if (!userSession) {
      throw new UnauthorizedException();
    }
    const tokens = await this.generateTokens(userSession.user);
    res.cookie(AuthService.ACCESS_TOKEN_COOKIE_KEY, tokens.accessToken, {
      httpOnly: true,
      secure: __IS_PROD__,
      maxAge: ms(AuthService.JWT_ACCESS_TOKEN_EXPIRATION_TIME),
    });

    return { success: !!tokens.accessToken };
  }

  private async requestEmailVerification(
    user: Pick<UserEntity, 'id' | 'email' | 'roles'>,
  ) {
    const emailVerificationToken = await this.generateToken(
      {
        id: user.id,
        email: user.email,
        roles: user.roles,
        type: JwtTokenType.EMAIL_VERIFICATION,
      },
      AuthService.EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME,
    );
    const isEmailVerificationTokenUpdated =
      await this.usersService.updateEmailVerificationToken(
        user.id,
        emailVerificationToken,
      );
    if (isEmailVerificationTokenUpdated) {
      const info = await this.mailerService.sendEmail(
        user.email,
        'Email address confirmation',
        {
          html: verifyEmailTemplate,
          context: {
            verifyEmailUrl: `http://localhost:5000/todo?token=${emailVerificationToken}`,
          },
        },
      );

      return { success: info.success };
    }

    return { success: false };
  }

  private async generateTokens({ id, email, roles }: UserEntity) {
    const payload = { id, email, roles };
    const accessToken = await this.generateToken(
      { ...payload, type: JwtTokenType.ACCESS },
      AuthService.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    );
    const refreshToken = await this.generateToken(
      { ...payload, type: JwtTokenType.REFRESH },
      AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    );

    return { accessToken, refreshToken };
  }

  private async generateToken(payload: JwtPayload, expiresIn: string | number) {
    return await this.jwtService.signAsync(payload, { expiresIn });
  }

  private async getHashString(value: string) {
    return await bcrypt.hash(value, AuthService.BCRYPT_HASH_SALT);
  }
}
