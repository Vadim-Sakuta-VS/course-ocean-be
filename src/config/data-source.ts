import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'], override: true });

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
