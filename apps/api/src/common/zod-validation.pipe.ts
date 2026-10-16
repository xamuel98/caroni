import type { PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { BadRequestError } from './errors';

/** Validates and narrows input against a zod schema, rejecting with a 400. */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestError('Request validation failed', {
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}
