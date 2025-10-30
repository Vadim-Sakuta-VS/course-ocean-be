import { OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CourseResponseDto } from '../../cources/dto/course-response.dto';
import { UserShortResponseDto } from '../../users/dto/user-short-response.dto';
import { UserCourseEntity } from '../entities/user-course.entity';

export class UserCourseResponseDto extends OmitType(UserCourseEntity, [
  'userId',
  'user',
  'courseId',
  'course',
]) {
  @Expose()
  @Type(() => UserShortResponseDto)
  user: UserShortResponseDto;

  @Expose()
  @Type(() => CourseResponseDto)
  course: CourseResponseDto;
}
