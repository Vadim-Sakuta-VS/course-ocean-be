import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('user-otp')
export class UsersOTPEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'two_factor_code', type: 'varchar', length: 100 })
  twoFactorCode: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
