import { Param, ParseUUIDPipe } from '@nestjs/common';

/**
 * A param decorator that validates whether was passed a actual uuid.
 * @param param the param name that you want to validate.
 * @returns A decorator function to get the validated uuid.
 */
export function UuidParam(param: string) {
  return Param(param, ParseUUIDPipe);
}
