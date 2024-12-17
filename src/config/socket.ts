import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { BadRequestError } from '@src/utils/error.util';
import { logger } from './logger';
import * as userConnection from '@src/services/user-connection.service';

let io: Server;

export const setupSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info({ id: socket.id }, 'A user connected');

    socket.on('identify', async (userId: string) => {
      await userConnection.createConnection({ userId, socketId: socket.id });

      logger.info(
        { userId, socketId: socket.id },
        'User identified with socket',
      );
    });

    socket.on('disconnect', async () => {
      logger.info({ id: socket.id }, 'A user disconnected');
      userConnection.deleteConnection(socket.id);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new BadRequestError('Socket is not available');
  }

  return io;
};
