import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    // TODO: ChecklistModule, UserModule, CheckitemModule 추가 예정
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
