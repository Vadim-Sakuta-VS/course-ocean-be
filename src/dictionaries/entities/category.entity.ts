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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @OneToMany(() => SubcategoryEntity, (subcategory) => subcategory.category, {
    cascade: true,
  })
  subcategories: SubcategoryEntity[];
}
