import { UserConnection } from '@src/models';
import {
  UserConnectionAttributes,
  UserConnectionCreationPayload,
} from '@src/interfaces/user.interface';

export const getByUserId = async (
  userId: string,
): Promise<UserConnectionAttributes> => {
  const connection = await UserConnection.findOne({ where: { userId } });

  if (!connection) {
    throw new Error('Can not get user connection');
  }

  return connection.dataValues;
};

export const createConnection = async (
  payload: UserConnectionCreationPayload,
): Promise<UserConnectionAttributes> => {
  const createdConnection = await UserConnection.create(payload);

  if (!createdConnection) {
    throw new Error('Create user connection failed');
  }

  return createdConnection.dataValues;
};

export const deleteConnectionBySocketId = async (
  socketId: string,
): Promise<boolean> => {
  const deletedConnection = await UserConnection.destroy({
    where: {
      socketId,
    },
  });

  if (!deletedConnection) {
    throw new Error('Delete connection by socket id failed');
  }

  return !!deletedConnection;
};

export const deleteConnectionByUserId = async (
  userId: string,
): Promise<boolean> => {
  const deletedConnection = await UserConnection.destroy({
    where: {
      userId,
    },
  });

  return !!deletedConnection;
};
