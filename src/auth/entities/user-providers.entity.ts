import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export enum AuthProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
}

@Entity('user_providers')
export class UserProvidersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id', type: 'varchar', length: 100 })
  providerId: string;

  @Column({ type: 'enum', enum: AuthProvider })
  type: AuthProvider;

  @ManyToOne(() => UserEntity, (user) => user.providers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
