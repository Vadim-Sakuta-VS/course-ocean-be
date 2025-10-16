import { Entity, PrimaryColumn } from 'typeorm';

@Entity('wish_list')
export class WishListEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'course_id', type: 'uuid' })
  courseId: string;
}
