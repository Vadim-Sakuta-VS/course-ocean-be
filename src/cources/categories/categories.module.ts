import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { TopicEntity } from './entities/topic.entity';
import { TransactionService } from '../../common/services/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, SubcategoryEntity, TopicEntity]),
  ],
  providers: [CategoriesService, TransactionService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
