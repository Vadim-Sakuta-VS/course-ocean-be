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
import { CourseEntity } from './course.entity';
import { LectureContentEntity } from './lecture-content.entity';

@Entity('section_content')
export class SectionContentEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Expose()
  @Column({ type: 'smallint' })
  @Check('chk_order_positive', '"order" > 0')
  order: string;

  @ManyToOne(() => CourseEntity, (course) => course.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Expose()
  @Type(() => LectureContentEntity)
  @OneToMany(() => LectureContentEntity, (lecture) => lecture.section, {
    cascade: true,
  })
  lectures: LectureContentEntity[];

  @Exclude()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
