import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    // TODO: 실제 로그인 로직 구현
    return {
      message: 'Login successful',
      // access_token: 'jwt_token_here'
    };
  }

  async register(registerDto: RegisterDto) {
    // TODO: 실제 회원가입 로직 구현
    return {
      message: 'Registration successful',
      user: {
        email: registerDto.email,
        // 기타 사용자 정보
      },
    };
  }

  async validateUser(email: string, password: string) {
    // TODO: 사용자 검증 로직
    return null;
  }
}
