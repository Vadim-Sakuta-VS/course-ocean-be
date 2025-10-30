import { Exclude, Expose } from 'class-transformer';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SectionContentEntity } from './section-content.entity';
import { FileEntity } from '../../files/entities/file.entity';

@Entity('lecture_content')
export class LectureContentEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Expose()
  @Column({ name: 'is_preview_enabled', type: 'boolean', default: false })
  isPreviewEnabled: boolean;

  @Expose()
  @Column({ type: 'smallint' })
  @Check('chk_order_positive', '"order" > 0')
  order: number;

  @ManyToOne(() => SectionContentEntity, (section) => section.lectures, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'section_content_id' })
  section: SectionContentEntity;

  @OneToOne(() => FileEntity, { cascade: true })
  @JoinColumn({ name: 'video_file_id' })
  videoFile: FileEntity;

  @Exclude()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
