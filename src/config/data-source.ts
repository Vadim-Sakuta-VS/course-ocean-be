import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { loadDotenv } from '../common/utils/dotenv';
import { CategoryEntity } from '../cources/categories/entities/category.entity';
import { SubcategoryEntity } from '../cources/categories/entities/subcategory.entity';
import { TopicEntity } from '../cources/categories/entities/topic.entity';

loadDotenv();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  migrations: ['./src/db/migrations/*.ts'],
  logging: true,
  synchronize: false,
  entities: [CategoryEntity, SubcategoryEntity, TopicEntity],
  seeds: ['./src/db/seeds/*.ts'],
  factories: ['./src/db/factories/*.ts'],
};

export default new DataSource(options);
