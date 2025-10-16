import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  username: configService.getOrThrow<string>('POSTGRES_USER'),
  password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
  host: configService.getOrThrow<string>('POSTGRES_HOST'),
  port: Number(configService.getOrThrow<string>('POSTGRES_PORT')),
  database: configService.getOrThrow<string>('POSTGRES_DB'),
  migrations: ['./dist/migrations/*.js'],
  autoLoadEntities: true,
  logging: true,
  synchronize: false,
});
