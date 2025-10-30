import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidationOptions,
} from 'class-validator';

export const IsBooleanQuery = (
  required?: boolean,
  validationOptions?: ValidationOptions,
) => {
  return applyDecorators(
    required ? IsNotEmpty(validationOptions) : IsOptional(validationOptions),
    IsBoolean(validationOptions),
    Transform(({ value }) => {
      if (typeof value === 'boolean') {
        return value;
      }

      return value === '1' || value === 'true';
    }, validationOptions),
  );
};
