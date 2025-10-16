import { registerDecorator, ValidationOptions } from 'class-validator';

export const IsElementOrderUnique = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'isElementOrderUnique',
      target: object.constructor,
      options: validationOptions,
      validator: {
        validate(value: { order: number }[]): boolean {
          const set = new Set(value.map(({ order }) => order));

          return set.size === value.length;
        },
        defaultMessage(): string {
          return `${propertyName}: order must be unique in each element`;
        },
      },
    });
  };
};
