import { Router } from 'express';
import {
  fileUploadMiddleware,
  validateFileTypeMiddleware,
} from '@src/middlewares/file-upload.middleware';
import * as fileController from '@src/controllers/file.controller';

const router = Router();

router.post(
  '/upload',
  fileUploadMiddleware,
  validateFileTypeMiddleware,
  fileController.uploadFile,
);

export { router as fileUploadRouter };
