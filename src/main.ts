import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // NestFactory.create() 이전에는 ConfigService를 사용할 수 없으므로
  // logger 옵션만 process.env를 직접 사용
  const nodeEnv = process.env.NODE_ENV || 'development';

  const app = await NestFactory.create(AppModule, {
    logger:
      nodeEnv === 'production'
        ? ['error', 'warn']
        : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  // ConfigService를 통해 나머지 환경 변수 접근
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const port = configService.get<number>('PORT', 8080);

  // CORS 설정 - 프론트엔드에서 API 호출 허용
  app.enableCors({
    origin: nodeEnv === 'production' ? frontendUrl : true, // 개발환경에서는 모든 origin 허용 (APIdog, Postman 등 테스트 도구 포함)
    credentials: true,
  });

  // 글로벌 api prefix 설정
  app.setGlobalPrefix('api/v1');

  // 글로벌 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성 있을 시 에러
      transform: true, // 타입 자동 변환
    }),
  );

  await app.listen(port);
  console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다 🚀`);
}
bootstrap();
