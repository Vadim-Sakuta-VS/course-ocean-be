import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { UserProvidersEntity } from '../auth/entities/user-providers.entity';
import { loadDotenv } from '../common/utils/dotenv';
import { CourseEntity } from '../cources/entities/course.entity';
import { LectureContentEntity } from '../cources/entities/lecture-content.entity';
import { SectionContentEntity } from '../cources/entities/section-content.entity';
import { CategoryEntity } from '../dictionaries/entities/category.entity';
import { SubcategoryEntity } from '../dictionaries/entities/subcategory.entity';
import { TopicEntity } from '../dictionaries/entities/topic.entity';
import { FileEntity } from '../files/entities/file.entity';
import { UserEntity } from '../users/entities/user.entity';

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
  entities: [
    CategoryEntity,
    SubcategoryEntity,
    TopicEntity,
    UserEntity,
    UserProvidersEntity,
    CourseEntity,
    SectionContentEntity,
    LectureContentEntity,
    FileEntity,
  ],
  seeds: ['./src/db/seeds/*.ts'],
  factories: ['./src/db/factories/*.ts'],
};

export default new DataSource(options);
