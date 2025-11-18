import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import * as redis from 'redis';
import { __IS_PROD__ } from './constants';

export const setupSession = async (
  app: INestApplication,
  configService: ConfigService,
) => {
  const redisClient = redis.createClient({
    socket: {
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: Number(configService.getOrThrow<string>('REDIS_PORT')),
    },
    password: configService.getOrThrow<string>('REDIS_PASSWORD'),
  });
  await redisClient.connect();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'co:',
  });

  app.use(
    session({
      store: redisStore,
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: __IS_PROD__,
        httpOnly: true,
        maxAge: Number(configService.getOrThrow<string>('SESSION_MAX_AGE')),
      },
    }),
  );
};
