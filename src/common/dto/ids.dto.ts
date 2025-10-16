import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class IdsDto {
  @IsUUID(4, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  ids: string[];
}
