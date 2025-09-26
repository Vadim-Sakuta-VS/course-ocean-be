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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'video_url', type: 'text' })
  videoUrl: string;

  @Column({ name: 'is_preview_enabled', type: 'boolean', default: false })
  isPreviewEnabled: boolean;

  @Column({ type: 'integer' })
  @Check('chk_duration_positive', '"duration" > 0')
  duration: number;

  @Column({ type: 'smallint' })
  @Check('chk_order_positive', '"order" > 0')
  order: string;

  @ManyToOne(() => SectionContentEntity, (section) => section.lectures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_content_id' })
  section: SectionContentEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
