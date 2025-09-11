import { createParamDecorator } from '@nestjs/common';
import { type Request } from 'express';

export const Cookies = createParamDecorator<string | undefined>(
  (data, context) => {
    const req = context.switchToHttp().getRequest<Request>();

    return data ? (req.cookies[data] as string) : req.cookies;
  },
);
