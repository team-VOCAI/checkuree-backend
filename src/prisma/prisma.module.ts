import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// PrismaModule은 PrismaService를 전역으로 제공(Global)함으로써
// 어떤 모듈에서도 별도의 import 없이 PrismaService를 주입 받을 수 있게 해줍니다.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}