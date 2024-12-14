export interface UserAttributes {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserSignUpAttributes {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserSignInAttributes {
  email: string;
  password: string;
}

export interface UserCreationAttributes
  extends Omit<UserSignUpAttributes, 'password'> {
  passwordHash: string;
}
