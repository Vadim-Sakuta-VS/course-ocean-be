import { OmitType, PickType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { FileResponseDto } from '../../common/dto/file-response.dto';
import { UserEntity } from '../../users/entities/user.entity';
import { CourseEntity } from '../entities/course.entity';
import { LectureContentEntity } from '../entities/lecture-content.entity';
import { SectionContentEntity } from '../entities/section-content.entity';

export class LectureContentResponseDto extends OmitType(LectureContentEntity, [
  'section',
  'videoFile',
  'createdAt',
  'updatedAt',
]) {
  @Expose()
  @Transform(({ value }: { value: FileResponseDto }) => value || null)
  video: FileResponseDto | null;
}

export class SectionContentResponseDto extends OmitType(SectionContentEntity, [
  'lectures',
  'course',
  'createdAt',
  'updatedAt',
]) {
  @Expose()
  @Type(() => LectureContentResponseDto)
  @Transform(({ value }: { value: LectureContentResponseDto }) => value || [])
  lectures: LectureContentResponseDto[];
}

export class AuthorResponseDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'avatarUrl',
]) {}

export class CourseResponseDto extends OmitType(CourseEntity, [
  'topic',
  'sections',
  'author',
  'coverFile',
]) {
  @Expose()
  @Type(() => AuthorResponseDto)
  author: AuthorResponseDto;

  @Expose()
  @Type(() => SectionContentResponseDto)
  @Transform(({ value }: { value: SectionContentResponseDto }) => value || [])
  sections: SectionContentResponseDto[];

  @Expose()
  @Transform(({ value }: { value: FileResponseDto }) => value || null)
  cover: FileResponseDto | null;
}
