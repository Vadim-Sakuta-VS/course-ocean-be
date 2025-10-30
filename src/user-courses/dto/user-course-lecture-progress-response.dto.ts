import { OmitType } from '@nestjs/swagger';
import { UserCourseLectureProgressEntity } from '../entities/user-course-lecture-progress.entity';

export class UserCourseLectureProgressResponseDto extends OmitType(
  UserCourseLectureProgressEntity,
  ['userId', 'user', 'course', 'lecture'],
) {}
