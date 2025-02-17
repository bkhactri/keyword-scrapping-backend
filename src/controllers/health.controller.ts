import { Request, Response } from 'express';
import { HttpStatus } from '@src/enums/http-status.enum';

export const healthCheck = (req: Request, res: Response) => {
  return res.status(HttpStatus.Ok).send(`${process.env.SERVICE_NAME} is ok`);
};
