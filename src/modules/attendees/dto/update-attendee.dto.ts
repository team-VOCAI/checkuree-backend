import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttendeeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
