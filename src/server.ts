import express, { RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import { router as healthRouter } from './routes/health.route';

const createServer = async (): Promise<{ app: express.Express }> => {
  const app = express();

  // Sever configuration
  app.use(cors());
  app.set('port', process.env.PORT);
  app.use(helmet() as RequestHandler);
  app.use(compression());
  app.use(
    bodyParser.json({
      limit: '5mb',
      type: 'application/json',
    }) as RequestHandler,
  );
  app.use(bodyParser.urlencoded({ extended: true }) as RequestHandler);

  // Router configuration
  app.use(healthRouter);

  return { app };
};

export default createServer;
