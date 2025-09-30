import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator<keyof Express.User | undefined>(
  (data, context) => {
    const req = context.switchToHttp().getRequest<Request>();

    return data && req.user ? req.user[data] : req.user;
  },
);
