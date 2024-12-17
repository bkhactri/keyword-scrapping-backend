export interface UserAttributes {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  accessToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserTokenPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserSignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserSignInPayload {
  email: string;
  password: string;
}

export interface UserCreationPayload
  extends Omit<UserSignUpPayload, 'password'> {
  passwordHash: string;
}

export interface UserConnectionAttributes {
  id: number;
  userId: string;
  socketId: string;
}

export interface UserConnectionCreationPayload
  extends Omit<UserConnectionAttributes, 'id'> {}
