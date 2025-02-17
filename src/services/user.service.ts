import { User } from '@src/models';
import { UserDto } from '@src/dtos/user.dto';
import { BadRequestError } from '@src/utils/error.util';

export const getUserInfo = async (userId: string): Promise<UserDto> => {
  const userInfo = await User.findByPk(userId);

  if (!userInfo) {
    throw new BadRequestError('User not found');
  }

  return new UserDto(userInfo.dataValues);
};
