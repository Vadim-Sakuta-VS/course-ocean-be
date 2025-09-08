import { DataSource } from 'typeorm';
import { loadDotenv } from '../common/utils/dotenv';

loadDotenv();

export default new DataSource({
  type: 'postgres',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  migrations: ['./src/migrations/*.ts'],
  logging: true,
  synchronize: false,
});
