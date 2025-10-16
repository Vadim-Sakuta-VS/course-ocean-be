import { IsString, MinLength, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsUUID(4)
  id: string;

  @IsString()
  @MinLength(1)
  name: string;
}
