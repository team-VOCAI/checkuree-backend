import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

const STATUS_VALUES = [
  'ACTIVE',
  'PENDING',
  'SUSPENDED',
  'WITHDRAWAL',
  'GRADUATED',
] as const;

type StatusValue = (typeof STATUS_VALUES)[number];

export class UpdateAttendeeStatusDto {
  @IsInt()
  attendeeId!: number;

  @IsNotEmpty()
  @IsEnum(STATUS_VALUES, {
    message: `status must be one of: ${STATUS_VALUES.join(', ')}`,
  })
  status!: StatusValue;
}
