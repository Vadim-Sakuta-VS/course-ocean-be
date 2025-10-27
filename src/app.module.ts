import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware';
import { getDatabaseConfig } from './config/database.config';
import { CoursesModule } from './cources/cources.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { MailerModule } from './mailer/mailer.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UserCoursesModule } from './user-courses/user-courses.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getDatabaseConfig,
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MailerModule,
    DictionariesModule,
    CoursesModule,
    CartModule,
    ReviewsModule,
    PaymentsModule,
    UserCoursesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
