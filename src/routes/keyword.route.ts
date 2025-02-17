import express from 'express';
import * as reportController from '@/src/controllers/keyword.controller';

const router = express.Router();

router.get('/keywords', reportController.getKeywords);

export { router as keywordRouter };
