import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserOTPEntity } from './entities/user-otp.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import requestIp from 'request-ip';
import { UAParser } from 'ua-parser-js';
import { UserSessionsEntity } from './entities/user-sessions.entity';
import ms from 'ms';
import { __IS_PROD__ } from '../config/constants';
import { MailerService } from '../mailer/mailer.service';
import { verifyEmailTemplate } from '../../email-templates/verify-email.template';
import { TransactionService } from '../common/services/transaction.service';

@Injectable()
export class AuthService {
  private static JWT_ACCESS_TOKEN_EXPIRATION_TIME: ms.StringValue;
  private static JWT_REFRESH_TOKEN_EXPIRATION_TIME: ms.StringValue;
  private static BCRYPT_HASH_SALT: number;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    @InjectRepository(UserOTPEntity)
    private userOTPRepository: Repository<UserOTPEntity>,
    @InjectRepository(UserSessionsEntity)
    private userSessionsRepository: Repository<UserSessionsEntity>,
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
    AuthService.BCRYPT_HASH_SALT =
      +this.configService.getOrThrow<string>('BCRYPT_HASH_SALT');
  }

  async signUp(
    req: Request,
    res: Response,
    { firstName, lastName, email, password }: CreateUserDto,
  ) {
    return this.transactionService.runInTransaction(
      async (transactionEntityManger) => {
        const clientMetadata = this.getClientMetadata(req);
        const hashedPassword = await this.getHashString(password);
        const user = await this.usersService.create(
          {
            firstName,
            lastName,
            email,
            password: hashedPassword,
          },
          transactionEntityManger,
        );
        const tokens = await this.generateTokens(user);
        const userSessionsRepository =
          transactionEntityManger.getRepository(UserSessionsEntity);
        const userSession = userSessionsRepository.create({
          user,
          ipAddress: clientMetadata.ipAddress,
          userAgentInfo: clientMetadata.userAgentInfo,
          token: await this.getHashString(tokens.refreshToken),
          expiresAt: new Date(
            Date.now() + ms(AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
          ),
        } as Partial<UserSessionsEntity>);
        await userSessionsRepository.save(userSession);
        res.cookie('sessionId', userSession.id, {
          httpOnly: true,
          secure: __IS_PROD__,
          maxAge: ms(AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
        });
        this.mailerService.sendEmail(user.email, 'Email address confirmation', {
          html: verifyEmailTemplate,
          context: {
            verifyEmailUrl: 'http://localhost:5000/todo',
          },
        });
        return {
          accessToken: tokens.accessToken,
        };
      },
    );
  }

  private async generateTokens({ id, email, roles }: UserEntity) {
    const payload = { id, email, roles };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: AuthService.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });

    return { accessToken, refreshToken };
  }

  private async getHashString(value: string) {
    return await bcrypt.hash(value, AuthService.BCRYPT_HASH_SALT);
  }

  private getClientMetadata(req: Request) {
    const ipAddress = requestIp.getClientIp(req);
    const userAgentInfo = UAParser(req.headers);

    return { ipAddress, userAgentInfo };
  }
}
