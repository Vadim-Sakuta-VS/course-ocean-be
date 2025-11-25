import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exception-filter';
import { __IS_PROD__ } from './config/constants';
import { setupSession } from './config/session.config';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');
  if (!__IS_PROD__) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }
  const configService = app.get(ConfigService);
  app.use(cookieParser(configService.getOrThrow<string>('SESSION_SECRET')));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  await setupSession(app, configService);

  setupSwagger(app);

  await app.listen(configService.get('PORT') ?? 5000);
}
bootstrap();
