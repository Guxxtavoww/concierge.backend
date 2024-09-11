import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {}
