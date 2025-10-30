import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLectureProgressDto {
  @IsNotEmpty()
  @IsUUID(4)
  courseId: string;

  @IsNotEmpty()
  @IsUUID(4)
  lectureId: string;
}
