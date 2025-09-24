import { IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateSubcategoryDto {
  @IsUUID(4)
  id: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsUUID(4)
  categoryId: string;
}
