import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AttendeesModule } from './modules/attendees/attendees.module';
import { PrismaModule } from './prisma/prisma.module';

// 앱의 루트 모듈입니다. 이곳에서 필요한 하위 모듈을 imports 배열에 등록합니다.
@Module({
  // PrismaModule은 글로벌 모듈이지만, 명시적으로 임포트해두면 의존 관계를 한눈에 파악하기 쉽습니다.
  imports: [PrismaModule, AuthModule, AttendeesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}