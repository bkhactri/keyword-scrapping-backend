export interface UserAttributes {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdAt: Date;
  accessToken?: string;
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
