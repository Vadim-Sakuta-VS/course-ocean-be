import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  username: configService.get<string>('POSTGRES_USER'),
  password: configService.get<string>('POSTGRES_PASSWORD'),
  host: configService.get<string>('POSTGRES_HOST'),
  port: Number(configService.get<string>('POSTGRES_PORT')),
  database: configService.get<string>('POSTGRES_DB'),
  migrations: ['./src/migrations/*.ts'],
  autoLoadEntities: true,
  logging: true,
  synchronize: true,
});
