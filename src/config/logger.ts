import bunyan, { LogLevel } from 'bunyan';

const logger = bunyan.createLogger({
  name: 'scrapping-backend',
  streams: [
    {
      level: process.env.LOG_LEVEL as LogLevel,
      stream: process.stdout,
    },
  ],
});

export { logger };
