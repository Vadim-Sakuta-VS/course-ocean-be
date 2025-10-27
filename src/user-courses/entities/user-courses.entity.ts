import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../../payments/types';

@Entity('user_courses')
export class UserCoursesEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

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

  @Column({ name: 'sale_date', type: 'timestamptz' })
  saleDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
