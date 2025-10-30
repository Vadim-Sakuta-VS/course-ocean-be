import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponseNoStatusOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiOkPageableContentResponse = (
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  model: Function,
  options?: ApiResponseNoStatusOptions,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      ...options,
      schema: {
        properties: {
          page: {
            type: 'number',
          },
          size: {
            type: 'number',
          },
          total: {
            type: 'number',
          },
          totalPages: {
            type: 'number',
          },
          content: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
    }),
  );
};
