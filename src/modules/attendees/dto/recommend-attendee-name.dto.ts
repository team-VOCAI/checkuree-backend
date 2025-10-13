import { IsNotEmpty, IsString } from 'class-validator';

export class RecommendAttendeeNameDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

