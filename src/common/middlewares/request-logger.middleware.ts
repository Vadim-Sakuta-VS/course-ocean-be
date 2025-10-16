import { ConsoleLogger, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getClientMetadata } from '../utils/clientMetadata';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private sensitiveFields = ['password', 'email', 'firstName', 'lastName'];
  private logger = new ConsoleLogger('HTTP');

  private sanitizeData(data: any) {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitizedValue: Record<string, any> = {};
    Object.keys(data).forEach((key: string) => {
      if (
        this.sensitiveFields.some(
          (field) => field.toLowerCase() === key.toLowerCase(),
        )
      ) {
        sanitizedValue[key] = '****';
      } else if (Array.isArray(data[key])) {
        sanitizedValue[key] = data[key].map((item) => this.sanitizeData(item));
      } else if (typeof data[key] === 'object') {
        sanitizedValue[key] = this.sanitizeData(data[key]);
      } else {
        sanitizedValue[key] = data[key];
      }
    });

    return sanitizedValue;
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl } = req;
    const { ipAddress, userAgentInfo } = getClientMetadata(req);

    this.logger.log(
      `${method} ${originalUrl} - ${userAgentInfo.ua} ${ipAddress}`,
    );
    this.logger.debug(
      `Body: ${JSON.stringify(this.sanitizeData(req.body), null, 2)}`,
    );
    this.logger.debug(
      `Query: ${JSON.stringify(this.sanitizeData(req.query), null, 2)}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength || 0}B - ${duration}ms`,
      );
    });
    next();
  }
}
