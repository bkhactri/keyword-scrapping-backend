import { Request, Response, RequestHandler } from 'express';

export const execMiddlewares = async (
  req: Partial<Request>,
  res: Partial<Response>,
  middlewares: RequestHandler[],
) => {
  for (const middleware of middlewares) {
    await new Promise<void>((resolve) => {
      middleware(req as Request, res as Response, () => {
        resolve();
      });
    });
  }
};
