import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  // CORS 설정 - 프론트엔드에서 API 호출 허용
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : true, // 개발환경에서는 모든 origin 허용 (APIdog, Postman 등 테스트 도구 포함)
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

  const port = process.env.PORT ?? 8080; // apidog 참고하여 설정함
  await app.listen(port);
  console.log(
    `🚀 서버가 http://localhost:${port}/api/v1 에서 실행 중입니다 🚀`,
  );
}
bootstrap();
