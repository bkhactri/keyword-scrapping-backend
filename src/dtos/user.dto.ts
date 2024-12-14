import { UserAttributes } from '@src/interfaces/user.interface';

export class UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  accessToken?: string;

  constructor(user: UserAttributes) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.createdAt = user.createdAt;
    this.accessToken = user?.accessToken;
  }
}
