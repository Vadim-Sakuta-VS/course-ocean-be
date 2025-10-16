import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubcategoryEntity } from './subcategory.entity';

@Entity({ name: 'topics' })
export class TopicEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiHideProperty()
  @Exclude()
  @ManyToOne(() => SubcategoryEntity, (subcategory) => subcategory.topics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: SubcategoryEntity;
}
