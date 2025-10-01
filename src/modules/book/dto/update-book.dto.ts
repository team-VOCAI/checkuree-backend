import { IsOptional, IsString, MaxLength, Matches, IsArray, ArrayMinSize, IsEnum, ArrayUnique } from 'class-validator';
import { DayOfWeek } from '../../../shared/enums/day-of-week.enum';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  // HHmm (0000~2359)
  @IsOptional()
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3])[0-5]\d$/, { message: 'availableFrom must be HHmm (0000-2359)' })
  availableFrom?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3])[0-5]\d$/, { message: 'availableTo must be HHmm (0000-2359)' })
  availableTo?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(DayOfWeek, { each: true })
  @ArrayUnique()
  availableDays?: DayOfWeek[];
}