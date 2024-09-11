import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

export const createScheduleSchema = z.object({});

export type CreateSchedulePayload = z.infer<typeof createScheduleSchema>;

export class CreateScheduleDTO extends createZodDto(createScheduleSchema) {}
