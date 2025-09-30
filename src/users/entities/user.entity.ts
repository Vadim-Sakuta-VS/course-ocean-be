import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProvidersEntity } from '../../auth/entities/user-providers.entity';
import { CourseEntity } from '../../cources/entities/course.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

@Entity('users')
export class UserEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({
    type: 'enum',
    array: true,
    enum: UserRole,
    default: [UserRole.STUDENT],
  })
  roles: UserRole[];

  @Expose()
  @Column({ name: 'first_name', type: 'varchar', length: '100' })
  firstName: string;

  @Expose()
  @Column({
    name: 'last_name',
    type: 'varchar',
    length: '100',
    nullable: true,
    default: 'NULL',
  })
  lastName: string;

  @Expose()
  @Column({ type: 'varchar', length: '100', unique: true })
  email: string;

  @Expose()
  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Column({
    name: 'email_verification_token',
    type: 'text',
    nullable: true,
    default: 'NULL',
  })
  emailVerificationToken: string;

  @Exclude()
  @Column({ type: 'varchar', length: '100', nullable: true, default: 'NULL' })
  password: string;

  @Expose()
  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: '255',
    nullable: true,
    default: 'NULL',
  })
  avatarUrl: string;

  @Exclude()
  @Column({
    name: 'account_deletion_date',
    type: 'timestamp',
    nullable: true,
    default: 'NULL',
  })
  accountDeletionDate: string;

  @Expose()
  @Column({ name: 'is_two_factor_enabled', type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Expose()
  @OneToMany(() => UserProvidersEntity, (userProviders) => userProviders.user)
  providers: UserProvidersEntity[];

  @Expose()
  @OneToMany(() => CourseEntity, (course) => course.author)
  courses: CourseEntity[];

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
