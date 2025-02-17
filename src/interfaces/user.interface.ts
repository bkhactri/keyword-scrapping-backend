export interface UserAttributes {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface UserCreationAttributes
  extends Omit<UserAttributes, 'id' | 'created_at'> {}

export interface UserAuthenticateAttributes {
  email: string;
  password: string;
}
