import bunyan from 'bunyan';

const logger = bunyan.createLogger({
  name: 'scrapping-backend',
  streams: [
    {
      level: process.env.NODE_ENV === 'local' ? 'debug' : 'info',
      stream: process.stdout,
    },
  ],
});

export { logger };
