import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
  ArrayUnique,            // 추가
} from 'class-validator';
import { DayOfWeek } from '../../../shared/enums/day-of-week.enum';

export class CreateCourseGradeDto {
  @IsInt()
  @Min(1)
  subjectItemId: number;

  @IsInt()
  @Min(1)
  level: number;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsBoolean()
  isPrimary: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCourseGradeDto)
  grades: CreateCourseGradeDto[];
}

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3])[0-5]\d$/, { message: 'availableFrom must be HHmm (0000-2359)' })
  availableFrom: string;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3])[0-5]\d$/, { message: 'availableTo must be HHmm (0000-2359)' })
  availableTo: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(DayOfWeek, { each: true })
  @ArrayUnique()
  availableDays: DayOfWeek[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((c: CreateCourseDto) => (c.title || '').trim().toLowerCase())
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDto)
  courses: CreateCourseDto[];
}