import { applyDecorators } from '@nestjs/common';
import {
  IsMimeType as IsMimeTypeBase,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { MimeType } from '../types/enums';

const IsMimeTypeCustom = (
  types?: MimeType[],
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    return registerDecorator({
      propertyName,
      name: 'isMimeType',
      target: object.constructor,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          return !!types?.includes(value as MimeType);
        },
        defaultMessage(): string {
          return `${propertyName}: suitable MIME types are ${types?.join(' | ')}`;
        },
      },
    });
  };
};

export const IsMimeType = (
  types?: MimeType[],
  validationOptions?: ValidationOptions,
) => {
  return applyDecorators(
    IsMimeTypeBase(validationOptions),
    IsMimeTypeCustom(types, validationOptions),
  );
};
