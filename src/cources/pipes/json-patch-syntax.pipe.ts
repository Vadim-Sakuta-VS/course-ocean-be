import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import jsonpatch from 'fast-json-patch';
import { Operation } from 'fast-json-patch/module/core';

@Injectable()
export class JsonPatchSyntaxPipe implements PipeTransform {
  constructor(private key?: string) {}

  transform(
    value: Record<string, Operation[]> | Operation[],
    metadata: ArgumentMetadata,
  ) {
    if (metadata.type !== 'body') {
      return value;
    }

    const error = jsonpatch.validate(this.key ? value[this.key] : value);
    if (error) {
      throw new BadRequestException(
        `JSON Patch syntax error: ${JSON.stringify(error)}`,
      );
    }

    return value;
  }
}
