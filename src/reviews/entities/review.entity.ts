import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseEntity } from '../../cources/entities/course.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('reviews')
export class ReviewEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ name: 'text_content', type: 'text' })
  textContent: string;

  @Expose()
  @Column({ type: 'smallint' })
  rating: number;

  @Expose()
  @Column({ type: 'integer' })
  likes: number;

  @Expose()
  @Column({ type: 'integer' })
  dislikes: number;

  @Exclude()
  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Expose()
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Exclude()
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Exclude()
  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
