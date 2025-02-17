/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envVariables = z.object({
  HOST: z.string().optional(),
  PORT: z.string().optional(),
  NODE_ENV: z.string(),
  POSTGRES_DATABASE: z.string(),
  POSTGRES_USERNAME: z.string(),
  POSTGRES_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRED_TIME: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
