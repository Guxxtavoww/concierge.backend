import { Entity } from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';

@Entity('condominiums')
export class Condominium extends Base {}
