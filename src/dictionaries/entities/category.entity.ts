import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubcategoryEntity } from './subcategory.entity';

@Entity('categories')
export class CategoryEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Expose()
  @OneToMany(() => SubcategoryEntity, (subcategory) => subcategory.category, {
    cascade: true,
  })
  subcategories: SubcategoryEntity[];
}
