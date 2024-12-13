import express, { RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import { healthRouter } from './routes/health.route';
import { authRouter } from './routes/auth.route';
import errorHandler from './middlewares/error-handler.middleware';
import requestLogger from './middlewares/request-logger.middleware';

const createServer = async (): Promise<{ app: express.Express }> => {
  const app = express();

  // Sever configuration
  app.use(cors());
  app.set('port', process.env.PORT);
  app.use(helmet() as RequestHandler);
  app.use(compression());
  app.use(bodyParser.json({ limit: '5mb' }) as RequestHandler);
  app.use(bodyParser.urlencoded({ extended: true }) as RequestHandler);

  // Logger
  app.use(requestLogger);

  // Router configuration
  app.use(healthRouter);
  app.use(authRouter);

  // Error handler middleware
  app.use(errorHandler);

  return { app };
};

export default createServer;
