import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

// 학생 등록 API에서 사용하는 DTO(Data Transfer Object) 모음입니다.
// ValidationPipe가 이 DTO를 참고하여 요청 본문에 포함된 값들을 검사하고, 잘못된 값이 들어오면 400 에러를 자동으로 발생시킵니다.

// 보호자(또는 학생과 연관된 사람) 정보를 표현하는 DTO입니다.
// 각 필드는 선택 사항이므로 @IsOptional()을 붙였고, 값이 들어올 때만 문자열인지 여부를 검사합니다.
export class AttendeeAssociateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  gender?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  relationType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  relationDescription?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;
}

// 실제 학생 등록 요청의 본문 구조를 정의합니다.
// NestJS의 ValidationPipe가 이 클래스의 데코레이터를 읽어 값의 타입과 필수 여부를 자동으로 검증합니다.
export class CreateAttendeeDto {
  // 출석부에 표시할 학생 이름 (닉네임)
  @IsString()
  @IsNotEmpty()
  name!: string;

  // 주민등록상 실제 이름
  @IsString()
  @IsNotEmpty()
  actualName!: string;

  // 성별 (예: MALE, FEMALE). 컨트롤러에서 대문자로 변환하여 저장합니다.
  @IsString()
  @IsNotEmpty()
  gender!: string;

  // 프리마 등록에는 사용하지 않지만, 추후 확장 가능하도록 입력값을 받습니다.
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  // 기본 주소 정보. 필요에 따라 address_2 등을 확장 가능합니다.
  @IsString()
  @IsNotEmpty()
  address_1!: string;

  // 생년월일 (ISO 문자열 예: 1993-11-17)
  @IsDateString()
  birthDate!: string;

  // 등록 일자 (ISO 문자열 예: 2025-01-17)
  @IsDateString()
  enrollmentDate!: string;

  // 등록 당시 학년 ID (GRADES 테이블 참조)
  @IsInt()
  initialGradeId!: number;

  // 현재 학년 ID (GRADES 테이블 참조)
  @IsInt()
  gradeId!: number;

  // 재학 중인 학교 이름
  @IsString()
  @IsNotEmpty()
  school!: string;

  // 초급자 여부
  @IsBoolean()
  isBeginner!: boolean;

  // 보호자/연관자 목록. 값이 들어오면 AttendeeAssociateDto로 각각 검증됩니다.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeAssociateDto)
  associates?: AttendeeAssociateDto[];
}