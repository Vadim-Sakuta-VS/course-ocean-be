import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PatchReviewDto {
  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
