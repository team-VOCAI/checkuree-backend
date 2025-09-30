import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// PrismaClient를 상속하여 NestJS 라이프사이클(OnModuleInit/OnModuleDestroy)에 맞춰
// 데이터베이스 연결을 열고 닫는 역할을 담당합니다.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 애플리케이션이 시작될 때 Prisma와 데이터베이스를 연결합니다.
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // 애플리케이션이 종료될 때 열린 연결을 정리합니다.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}