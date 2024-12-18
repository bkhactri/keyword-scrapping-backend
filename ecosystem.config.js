require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'scrapping-be',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRED_TIME: process.env.JWT_EXPIRED_TIME,
        SERVICE_NAME: process.env.SERVICE_NAME,
        POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
        POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
      },
    },
  ],
};
