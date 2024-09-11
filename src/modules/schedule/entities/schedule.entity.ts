import { Entity } from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';

@Entity('schedules')
export class Schedule extends Base {}
