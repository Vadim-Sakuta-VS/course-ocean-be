import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SectionContentEntity } from './section-content.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { TopicEntity } from '../categories/entities/topic.entity';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum Language {
  EN = 'EN',
  RU = 'RU',
}

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({
    name: 'short_description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CourseLevel, nullable: true })
  level: CourseLevel;

  @Column({ type: 'enum', enum: Language, nullable: true })
  language: Language;

  @Column({ name: 'learning_skills', type: 'text', array: true })
  learningSkills: string[];

  @Column({ type: 'text', array: true })
  requirements: string[];

  @Column({ name: 'cover_url', type: 'text', nullable: true })
  coverUrl: string;

  @Column({ type: 'numeric', precision: 2, nullable: true })
  @Check('chk_price_positive_or_nil', '"price" >= 0')
  price: number;

  @Column({ type: 'smallint', nullable: true })
  @Check('chk_discount_positive', '"discount" > 0')
  discount: number;

  @Column({ name: 'discount_start_date', type: 'timestamptz', nullable: true })
  discountStartDate: string;

  @Column({ name: 'discount_end_date', type: 'timestamptz', nullable: true })
  discountEndDate: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'is_reviews_enabled', type: 'boolean', default: false })
  isReviewsEnabled: boolean;

  @ManyToOne(() => UserEntity, (user) => user.courses, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @ManyToOne(() => TopicEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'topic_id' })
  topic: TopicEntity;

  @OneToMany(() => SectionContentEntity, (section) => section.course)
  sections: SectionContentEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
