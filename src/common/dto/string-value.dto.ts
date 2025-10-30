import { IsNotEmpty, IsString } from 'class-validator';

export class StringValueDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}
