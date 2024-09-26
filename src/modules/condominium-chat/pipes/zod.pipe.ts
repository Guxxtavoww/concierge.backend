import { PipeTransform, Injectable, UsePipes } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Schema } from 'nestjs-zod/z';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: Schema) {}

  transform<T = unknown>(value: T) {
    const parsedData = this.schema.safeParse(value);

    if (!parsedData.success) {
      throw new WsException({
        message: 'Invalid Format',
        error: parsedData.error,
      });
    }

    return parsedData.data;
  }
}

export function UseZodPipe(schema: Schema) {
  return UsePipes(new ZodValidationPipe(schema));
}
