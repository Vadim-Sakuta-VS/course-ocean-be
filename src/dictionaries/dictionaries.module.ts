import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionariesController } from './dictionaries.controller';
import { DictionariesService } from './dictionaries.service';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { TopicEntity } from './entities/topic.entity';
import { CategoriesRepository } from './repositories/categories.repository';
import { SubcategoriesRepository } from './repositories/subcategories.repository';
import { TopicsRepository } from './repositories/topics.repository';
import { TransactionService } from '../common/services/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, SubcategoryEntity, TopicEntity]),
  ],
  providers: [
    DictionariesService,
    TransactionService,
    CategoriesRepository,
    SubcategoriesRepository,
    TopicsRepository,
  ],
  controllers: [DictionariesController],
})
export class DictionariesModule {}
