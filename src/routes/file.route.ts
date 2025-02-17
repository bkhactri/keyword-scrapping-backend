import { Router } from 'express';
import { fileUploadMiddleware } from '@src/middlewares/file-upload.middleware';
import { validateFileTypeMiddleware } from '@src/validators/file.validator';
import * as fileController from '@src/controllers/file.controller';

const router = Router();

router.post(
  '/upload',
  fileUploadMiddleware,
  validateFileTypeMiddleware,
  fileController.uploadFile,
);

export { router as fileUploadRouter };
