import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    array: true,
    enum: UserRole,
    default: [UserRole.STUDENT],
  })
  roles: UserRole[];

  @Column({ name: 'first_name', type: 'varchar', length: '100' })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: '100' })
  lastName: string;

  @Column({ type: 'varchar', length: '100', unique: true })
  email: string;

  @Column({ type: 'varchar', length: '100' })
  password: string;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: '255',
    default: 'NULL',
  })
  avatarUrl: string;

  @Column({
    name: 'account_deletion_date',
    type: 'timestamp',
    default: 'NULL',
  })
  accountDeletionDate: string;

  @Column({ name: 'is_two_factor_enabled', type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
