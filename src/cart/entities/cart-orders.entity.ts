import { Entity, PrimaryColumn } from 'typeorm';

@Entity('cart_orders')
export class CartOrdersEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'course_id', type: 'uuid' })
  courseId: string;
}
