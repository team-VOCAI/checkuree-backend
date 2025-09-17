export const databaseConfig = {
  type: 'postgres', // 또는 'mysql', 'sqlite' 등
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'checkuree_db',
  synchronize: process.env.NODE_ENV === 'development', // 개발환경에서만 true
  logging: process.env.NODE_ENV === 'development',
};
