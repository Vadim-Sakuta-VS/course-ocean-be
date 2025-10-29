import { IsInt, IsOptional, Min } from 'class-validator';

export class PatchLectureProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  lastPositionSeconds: number;
}
