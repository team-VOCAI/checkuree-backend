import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChecklistModule } from './modules/checklist/checklist.module';
import { BookModule } from './modules/book/book.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    ChecklistModule,
    BookModule,
    PrismaModule,
    // TODO: UserModule, CheckitemModule 추가 예정
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
