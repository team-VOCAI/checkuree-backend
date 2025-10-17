import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from '../../shared/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  //---- 로그인 로직
  async signin(signinDto: SigninDto) {
    // 1. 사용자 찾기
    const user = await this.prisma.users.findUnique({
      where: { username: signinDto.username },
    });

    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(
      signinDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    // 3. JWT 토큰 생성
    const payload = { sub: user.userId, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    // 4. Refresh Token 생성
    const refreshTokenExpiresIn =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiresIn as any,
    });

    // 5. Refresh Token 해싱 후 DB 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.users.update({
      where: { userId: user.userId },
      data: { refreshToken: hashedRefreshToken },
    });

    /**
     * OAuth 2.0 표준 응답 형식으로 모든 토큰 관련 필드는 스네이크 케이스로 정의되어 있음.
     * 업계 표준 또한 토큰 관련 필드는 스네이크 케이스로 정의되어 있음.
     * 하여 이를 적용함.
     */
    return {
      message: '로그인 성공',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        userId: user.userId,
        username: user.username,
        name: user.name,
      },
    };
  }

  //---- 회원가입 로직
  async signup(signupDto: SignupDto) {
    try {
      // 중복 사용자명 체크
      const existingUser = await this.prisma.users.findUnique({
        where: { username: signupDto.username },
      });

      if (existingUser) {
        throw new ConflictException('이미 존재하는 아이디입니다.');
      }
      // 비밀번호 ��싱
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

  //---- 토큰 갱신 로직
  async refreshAccessToken(refreshToken: string) {
    try {
      // 1. Refresh Token 검증 (만료 여부, 서명 확인)
      const payload = this.jwtService.verify(refreshToken);

      // 2. DB에서 사용자 찾기
      const user = await this.prisma.users.findUnique({
        where: { userId: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      // 3. DB에 저장된 해싱된 Refresh Token과 비교
      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      // 4. 새로운 토큰 생성 (Access Token + Refresh Token)
      const newPayload = { sub: user.userId, username: user.username };
      const newAccessToken = this.jwtService.sign(newPayload);

      // 5. 새로운 Refresh Token 생성
      const refreshTokenExpiresIn =
        this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: refreshTokenExpiresIn as any,
      });

      // 6. 새로운 Refresh Token 해싱 후 DB 업데이트 (기존 토큰 무효화)
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await this.prisma.users.update({
        where: { userId: user.userId },
        data: { refreshToken: hashedRefreshToken },
      });

      return {
        message: '토큰 갱신 성공',
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      this.logger.error('토큰 갱신 에러', error);
      throw new UnauthorizedException('토큰 갱신에 실패했습니다.');
    }
  }

  //---- 로그아웃 로직
  async logout(userId: number) {
    // DB에서 Refresh Token 제거 (토큰 무효화)
    await this.prisma.users.update({
      where: { userId },
      data: { refreshToken: null },
    });

    return {
      message: '로그아웃 성공',
    };
  }
}
