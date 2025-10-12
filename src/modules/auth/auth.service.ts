import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from '../../shared/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(AuthService.name);

  async login(loginDto: LoginDto) {
    // TODO: 실제 로그인 로직 구현
    return {
      message: 'Login successful',
      // access_token: 'jwt_token_here'
    };
  }

  async signup(signupDto: SignupDto) {
    try {
      // 중복 사용자명 체크
      const existingUser = await this.prisma.users.findUnique({
        where: { username: signupDto.username },
      });

      if (existingUser) {
        throw new ConflictException('이미 존재하는 아이디입니다.');
      }
      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(signupDto.password, 10);

      // 사용자 생성
      const user = await this.prisma.users.create({
        data: {
          username: signupDto.username,
          password: hashedPassword,
          name: signupDto.name,
        },
        select: {
          name: true,
          username: true,
        },
      });

      return {
        message: '회원가입이 성공적으로 완료되었습니다.',
        user: user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('회원가입 에러', error);
      throw new Error('회원가입 중 오류가 발생했습니다.');
    }
  }

  async validateUser(email: string, password: string) {
    // TODO: 사용자 검증 로직
    return null;
  }
}
