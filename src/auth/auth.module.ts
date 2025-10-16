import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserOTPEntity } from './entities/user-otp.entity';
import { UserProvidersEntity } from './entities/user-providers.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UserSessionsEntity } from './entities/user-sessions.entity';
import { TransactionService } from '../common/services/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserOTPEntity,
      UserSessionsEntity,
      UserProvidersEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    AuthService,
    UsersService,
    TransactionService,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
})
export class AuthModule {}
