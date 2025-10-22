import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class UploadLectureVideoDto {
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }

    return value === '1' || value === 'true';
  })
  isPublic: boolean;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }

    return Number(value);
  })
  duration: number;
}
