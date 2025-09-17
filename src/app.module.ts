import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChecklistModule } from './modules/checklist/checklist.module';

@Module({
  imports: [
    AuthModule,
    ChecklistModule,
    // TODO: UserModule, CheckitemModule 추가 예정
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
