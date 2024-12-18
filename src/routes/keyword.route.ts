import express from 'express';
import * as keywordController from '@src/controllers/keyword.controller';

const router = express.Router();

router.get('/keywords', keywordController.getKeywords);

export { router as keywordRouter };
