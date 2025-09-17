import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateChecklistDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsOptional()
  userId?: number; // 체크리스트 작성자 ID
}
