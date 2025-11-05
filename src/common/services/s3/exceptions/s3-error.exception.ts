import { HttpException, HttpStatus } from '@nestjs/common';

export class S3ErrorException extends HttpException {
  constructor(message: string) {
    super(`S3 error: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = S3ErrorException.name;
  }
}
