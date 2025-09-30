import { Module } from '@nestjs/common';
import { AttendeesController } from './attendees.controller';
import { AttendeesService } from './attendees.service';

// AttendeesModule은 학생 등록과 관련된 컨트롤러/서비스를 하나로 묶어주는 NestJS 모듈입니다.
// AppModule에서 이 모듈을 임포트하면 해당 기능을 애플리케이션 전체에서 사용할 수 있습니다.
@Module({
  controllers: [AttendeesController],
  providers: [AttendeesService],
})
export class AttendeesModule {}