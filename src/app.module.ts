import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AttendeesModule } from './modules/attendees/attendees.module';
import { BookModule } from './modules/book/book.module';
import { PrismaModule } from './prisma/prisma.module';

// 앱의 루트 모듈입니다. 이곳에서 필요한 하위 모듈을 imports 배열에 등록합니다.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 환경 변수 사용 가능
      envFilePath: '.env',
    }),
    AttendeesModule,
    // TODO: ChecklistModule, UserModule, CheckitemModule 추가 예정
    AuthModule,
    BookModule,
    PrismaModule,
    // TODO: UserModule, CheckitemModule 추가 예정
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}