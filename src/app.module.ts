import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BookModule } from './modules/book/book.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 환경 변수 사용 가능
      envFilePath: '.env',
    }),
    AuthModule,
    BookModule,
    PrismaModule,
    // TODO: UserModule, CheckitemModule 추가 예정
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
