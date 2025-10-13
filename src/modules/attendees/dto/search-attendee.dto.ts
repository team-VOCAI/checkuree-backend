import { IsNotEmpty, IsString } from 'class-validator';

export class SearchAttendeeDto {
  @IsString()
  @IsNotEmpty()
  searchName!: string;
}

