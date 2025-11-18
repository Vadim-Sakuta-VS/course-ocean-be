import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthProvider } from '../entities/user-providers.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_AUTH_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>(
        'GOOGLE_AUTH_CLIENT_SECRET',
      ),
      callbackURL: `${configService.getOrThrow<string>('APP_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    _: string,
    __: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;
    if (!emails?.[0].value || !name) {
      throw new UnauthorizedException();
    }
    const user: Express.User = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatarUrl: photos?.[0].value,
      isEmailVerified: true,
      providerType: AuthProvider.GOOGLE,
      providerId: id,
    };
    done(null, user);
  }
}
