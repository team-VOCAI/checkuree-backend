import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '이름은 한글, 영문만 사용 가능합니다.',
  })
  name: string;
}