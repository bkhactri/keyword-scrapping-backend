/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';
import { UserTokenPayload } from '@src/interfaces/user.interface';

const envVariables = z.object({
  HOST: z.string().optional(),
  PORT: z.string().optional(),
  NODE_ENV: z.string(),
  LOG_LEVEL: z.string().optional().default('debug'),
  POSTGRES_DATABASE: z.string(),
  POSTGRES_USERNAME: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_HOST: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRED_TIME: z.string().default('1h'),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().default('6379'),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }

  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}
