import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class ConfirmOrderedCourseDto {
  @IsNotEmpty()
  @IsUUID(4)
  userId: string;

  @IsNotEmpty()
  @IsUUID(4)
  courseId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  comment: string;
}
