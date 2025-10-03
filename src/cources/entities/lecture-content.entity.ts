import { Exclude, Expose } from 'class-transformer';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SectionContentEntity } from './section-content.entity';

@Entity('lecture_content')
export class LectureContentEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Expose()
  @Column({ name: 'video_url', type: 'text', nullable: true })
  videoUrl: string;

  @Expose()
  @Column({ name: 'is_preview_enabled', type: 'boolean', default: false })
  isPreviewEnabled: boolean;

  @Expose()
  @Column({ type: 'integer', nullable: true })
  @Check('chk_duration_positive', '"duration" > 0')
  duration: number;

  @Expose()
  @Column({ type: 'smallint' })
  @Check('chk_order_positive', '"order" > 0')
  order: string;

  @ManyToOne(() => SectionContentEntity, (section) => section.lectures, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'section_content_id' })
  section: SectionContentEntity;

  @Exclude()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
