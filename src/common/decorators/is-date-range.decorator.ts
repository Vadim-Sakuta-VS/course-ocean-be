import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export const IsDateRange = (
  dateStartProperty: string,
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    return registerDecorator({
      propertyName,
      name: 'isDateRange',
      target: object.constructor,
      options: validationOptions,
      validator: {
        validate(dateEnd: string, args?: ValidationArguments): boolean {
          const dateStart = args?.object[dateStartProperty] as string;
          if (!dateStart || !dateEnd) {
            return true;
          }

          return new Date(dateStart) <= new Date(dateEnd);
        },
        defaultMessage(): string {
          return `${dateStartProperty} must be less then ${propertyName}`;
        },
      },
    });
  };
};
