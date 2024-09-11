export enum ScheduleType {
  SOCIAL_EVENT = 'evento social',
  BIRTHDAY = 'aniversário',
  MEETING = 'reunião',
  MAINTENANCE = 'manutenção',
  GYM_CLASS = 'aula de ginástica',
  POOL_RESERVATION = 'reserva de piscina',
  CONFERENCE = 'conferência',
}

export const schedule_types = Object.values(ScheduleType);
