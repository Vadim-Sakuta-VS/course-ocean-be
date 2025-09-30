import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
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
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Expose()
  @Column({
    name: 'short_description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  shortDescription: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Expose()
  @Column({ type: 'enum', enum: CourseLevel, nullable: true })
  level: CourseLevel;

  @Expose()
  @Column({ type: 'enum', enum: Language, nullable: true })
  language: Language;

  @Expose()
  @Column({ name: 'learning_skills', type: 'text', array: true })
  learningSkills: string[];

  @Expose()
  @Column({ type: 'text', array: true })
  requirements: string[];

  @Expose()
  @Column({ name: 'cover_url', type: 'text', nullable: true })
  coverUrl: string;

  @Expose()
  @Column({ type: 'numeric', precision: 2, nullable: true })
  @Check('chk_price_positive_or_nil', '"price" >= 0')
  price: number;

  @Expose()
  @Column({ type: 'smallint', nullable: true })
  @Check('chk_discount_positive', '"discount" > 0')
  discount: number;

  @ApiProperty({ default: new Date().toISOString() })
  @Expose()
  @Column({ name: 'discount_start_date', type: 'timestamptz', nullable: true })
  discountStartDate: string;

  @ApiProperty({ default: new Date().toISOString() })
  @Expose()
  @Column({ name: 'discount_end_date', type: 'timestamptz', nullable: true })
  discountEndDate: string;

  @Expose()
  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Expose()
  @Column({ name: 'is_reviews_enabled', type: 'boolean', default: false })
  isReviewsEnabled: boolean;

  @ManyToOne(() => UserEntity, (user) => user.courses, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Exclude()
  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => TopicEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'topic_id' })
  topic: TopicEntity;

  @Expose()
  @Column({ name: 'topic_id' })
  topicId: string;

  @Expose()
  @Type(() => SectionContentEntity)
  @OneToMany(() => SectionContentEntity, (section) => section.course, {
    cascade: true,
  })
  sections: SectionContentEntity[];

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
