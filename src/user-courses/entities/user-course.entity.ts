import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseEntity } from '../../cources/entities/course.entity';
import { PaymentStatus } from '../../payments/types';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('user_courses')
export class UserCourseEntity {
  @Exclude()
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Exclude()
  @PrimaryColumn({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.myCourses)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Exclude()
  @ManyToOne(() => CourseEntity, (course) => course.userCourses)
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Expose()
  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Expose()
  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Expose()
  @Column({
    type: 'numeric',
    scale: 2,
    precision: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (!value ? value : parseFloat(value)),
    },
  })
  price: number;

  @Expose()
  @Column({ name: 'sale_date', type: 'timestamptz' })
  saleDate: Date;

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
