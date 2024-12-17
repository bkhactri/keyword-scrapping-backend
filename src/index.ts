import 'dotenv/config';
import './config/environment';
import createServer from './server';
import sequelize from './config/database';
import { logger } from './config/logger';
import { keywordWorker } from './workers/keyword.worker';
import { keywordQueue, redisConnection } from './config/queue';
import { setupSocket } from './config/socket';

const handleUncaughtExceptions = (error: Error) => {
  logger.error({ error }, 'An uncaught exception occurred');
  process.exit(1);
};

const handleUnhandledRejections = (error: Error) => {
  logger.error({ error }, 'An unhandled promise rejection occurred');
  process.exit(1);
};

const main = async () => {
  try {
    const { app } = await createServer();
    const port = app.get('port');

    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    await sequelize.sync({ force: false });
    logger.info('Database schema synced');

    // Register worker
    keywordWorker.on('completed', (job) => {
      logger.info({ job }, 'Job completed with result');
    });

    keywordWorker.on('failed', (job, err) => {
      logger.error({ job, errorMessage: err.message }, 'Job failed with error');
    });

    keywordWorker.on('error', (err) => {
      logger.error({ err }, 'Worker error');
    });

    keywordWorker.on('stalled', (job) => {
      logger.info({ job }, `Job has stalled`);
    });

    const server = app.listen(port, () => {
      logger.info({ port }, 'Server listening on port');
    });

    setupSocket(server);

    process.on('uncaughtException', handleUncaughtExceptions);
    process.on('unhandledRejection', handleUnhandledRejections);

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      await keywordWorker.close();
      await keywordQueue.close();
      await redisConnection.quit();

      server.close(() => {
        logger.info('Server shutdown gracefully');
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.error({ error }, 'Error starting server');
    process.exit(1);
  }
};

main();
