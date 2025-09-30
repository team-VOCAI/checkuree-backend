// 애플리케이션 전반에서 사용할 데이터베이스 연결 기본값입니다.
// .env 파일을 활용하면 실제 환경별로 값을 쉽게 바꿀 수 있습니다.
export const databaseConfig = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'checkuree_db',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};