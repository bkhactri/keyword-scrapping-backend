/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envVariables = z.object({
  HOST: z.string().optional(),
  PORT: z.string().optional(),
  NODE_ENV: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
