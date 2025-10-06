import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsMimeType } from '../../common/decorators/is-mime-type.decorator';
import { MimeType } from '../../common/types/enums';

export class UploadObjectDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  fileName: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => !!value)
  isPublic: boolean;

  @IsNotEmpty()
  @IsMimeType([
    MimeType.JPG,
    MimeType.PNG,
    MimeType.WEBP,
    MimeType.AVIF,
    MimeType.MP4,
  ])
  contentType: string;

  @IsOptional()
  @IsInt()
  ttl: number;
}
