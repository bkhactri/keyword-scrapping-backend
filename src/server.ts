import express, { RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { healthRouter } from './routes/health.route';
import { authRouter } from './routes/auth.route';
import { fileUploadRouter } from './routes/file.route';
import { userRouter } from './routes/user.route';
import { keywordRouter } from './routes/keyword.route';
import { reportRouter } from './routes/report.route';
import { errorHandler } from './middlewares/error-handler.middleware';
import requestLogger from './middlewares/request-logger.middleware';
import authMiddleware from './middlewares/auth.middleware';

const createServer = async (): Promise<{ app: express.Express }> => {
  const app = express();

  // Sever configuration
  app.use(cors());
  app.set('port', process.env.PORT);
  app.use(helmet() as RequestHandler);
  app.use(compression());
  app.use(bodyParser.json({ limit: '5mb' }) as RequestHandler);
  app.use(bodyParser.urlencoded({ extended: true }) as RequestHandler);

  const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  // Logger
  app.use(requestLogger);

  // Router v1 configuration
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', authRouter);
  app.use('/api/v1', authMiddleware, userRouter);
  app.use('/api/v1', authMiddleware, fileUploadRouter);
  app.use('/api/v1', authMiddleware, keywordRouter);
  app.use('/api/v1', authMiddleware, reportRouter);

  // Error handler middleware
  app.use(errorHandler);

  return { app };
};

export default createServer;
