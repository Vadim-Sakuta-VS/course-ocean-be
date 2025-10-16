import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { AuthProvider } from '../entities/user-providers.entity';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: `${configService.getOrThrow<string>('GITHUB_AUTH_CLIENT_ID')}`,
      clientSecret: `${configService.getOrThrow<string>(
        'GITHUB_AUTH_CLIENT_SECRET',
      )}`,
      callbackURL: `${configService.getOrThrow<string>('APP_URL')}/auth/github/callback`,
      scope: ['read:user', 'user:email'],
    });
  }

  validate(_: string, __: string, profile: Profile): Express.User {
    const { id, emails, photos, displayName, username } = profile;
    if (!emails?.[0].value) {
      throw new UnauthorizedException();
    }

    return {
      email: emails[0].value,
      firstName: displayName || username,
      avatarUrl: photos?.[0].value,
      providerType: AuthProvider.GITHUB,
      providerId: id,
    };
  }
}
