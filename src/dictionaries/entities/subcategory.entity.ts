import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { TopicEntity } from './topic.entity';

@Entity('subcategories')
export class SubcategoryEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @ApiHideProperty()
  @Exclude()
  @ManyToOne(() => CategoryEntity, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Expose()
  @OneToMany(() => TopicEntity, (topic) => topic.subcategory, { cascade: true })
  topics: TopicEntity[];
}
