import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersOTPEntity } from './entities/users-otp.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  private static JWT_ACCESS_TOKEN_EXPIRATION_TIME: string;
  private static JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
  private static BCRYPT_HASH_SALT: number;

  constructor(
    @InjectRepository(UsersOTPEntity)
    private usersOTPRepository: Repository<UsersOTPEntity>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    AuthService.JWT_ACCESS_TOKEN_EXPIRATION_TIME =
      this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME');
    AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME =
      this.configService.getOrThrow<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      );
    AuthService.BCRYPT_HASH_SALT =
      +this.configService.getOrThrow<string>('BCRYPT_HASH_SALT');
  }

  async signUp(
    res: Response,
    { firstName, lastName, email, password }: CreateUserDto,
  ) {
    const hashedPassword = await bcrypt.hash(
      password,
      AuthService.BCRYPT_HASH_SALT,
    );
    const user = await this.usersService.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
  }

  private async generateTokens(res: Response, { id, email }: UserEntity) {
    const payload = { id, email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: AuthService.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: AuthService.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly,
    //   maxAge,
    //   domain,
    //   encode,
    //   path,
    //   expires,
    //   priority,
    //   secure,
    //   signed,
    //   sameSite,
    //   partitioned,
    // });

    return { accessToken, refreshToken };
  }
}
