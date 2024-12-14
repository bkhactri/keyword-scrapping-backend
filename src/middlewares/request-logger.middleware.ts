import { Request, Response, NextFunction } from 'express';
import { logger } from '@src/config/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const reqInfo = {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers,
  };

  logger.debug({ req: reqInfo }, 'Request received');

  res.on('finish', () => {
    const ms = Date.now() - start;
    const resInfo = {
      statusCode: res.statusCode,
      responseTime: ms,
    };

    logger.info(
      { res: resInfo },
      `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`,
    );
  });

  next();
};

export default requestLogger;
