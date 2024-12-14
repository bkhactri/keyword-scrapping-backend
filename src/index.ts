import 'dotenv/config';
import './config/environment';
import createServer from './server';
import sequelize from './config/database';
import { logger } from './config/logger';

const handleUncaughtExceptions = (error: Error) => {
  logger.error('An uncaught exception occurred:', error);
  process.exit(1);
};

const handleUnhandledRejections = (error: Error) => {
  logger.error('An unhandled promise rejection occurred:', error);
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

    const server = app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });

    process.on('uncaughtException', handleUncaughtExceptions);
    process.on('unhandledRejection', handleUnhandledRejections);

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      server.close(() => {
        logger.info('Server shutdown gracefully');
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

main();
