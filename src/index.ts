import 'dotenv/config';
import './config/environment';
import gracefulShutdown from 'http-graceful-shutdown';
import createServer from './server';

const registerEventListeners = () => {
  process.on('uncaughtException', (error) => {
    console.error('An uncaught exception appear on server', error);

    process.exit(1);
  });

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection appear on server', error);

    process.exit(1);
  });

  process.on('warning', (warning: Error) => {
    console.log(`Encountered warning with message: ${warning}`);
  });
};

const main = async () => {
  try {
    const { app } = await createServer();
    const port = app.get('port');

    const server = app.listen(port, () => {
      console.log(`Server ready: ${app.get('env')} on port: ${port}`);
    });

    gracefulShutdown(server);
    registerEventListeners();
  } catch (error) {
    console.error(`Error caught when setup server: ${error}`);
  }
};

main();
