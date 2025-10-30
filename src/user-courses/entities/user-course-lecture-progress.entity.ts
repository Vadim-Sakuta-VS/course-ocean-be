import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseEntity } from '../../cources/entities/course.entity';
import { LectureContentEntity } from '../../cources/entities/lecture-content.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('user_course_lectures_progress')
export class UserCourseLectureProgressEntity {
  @Exclude()
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Expose()
  @PrimaryColumn({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Expose()
  @PrimaryColumn({ name: 'lecture_content_id', type: 'uuid' })
  lectureId: string;

  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.myCourseLecturesProgress)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Exclude()
  @ManyToOne(() => CourseEntity, (course) => course.userCourseLecturesProgress)
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Exclude()
  @ManyToOne(
    () => LectureContentEntity,
    (lecture) => lecture.userCourseLecturesProgress,
  )
  @JoinColumn({ name: 'lecture_content_id' })
  lecture: LectureContentEntity;

  @Expose()
  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @Expose()
  @Column({ name: 'last_position_seconds', type: 'integer', nullable: true })
  lastPositionSeconds: number | null;

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
