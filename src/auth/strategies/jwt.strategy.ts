import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE_KEY } from '../constants';
import { JwtPayload, JwtTokenType } from '../types';

const jwtFromCookie = (cookieName: string) => {
  return (request: Request): string | null => {
    if (request && request.cookies) {
      return (request.cookies[cookieName] as string) || null;
    }

    return null;
  };
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: jwtFromCookie(ACCESS_TOKEN_COOKIE_KEY),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): Express.User {
    if (payload.type !== JwtTokenType.ACCESS) {
      throw new UnauthorizedException();
    }

    return { id: payload.id, email: payload.email, roles: payload.roles };
  }
}
