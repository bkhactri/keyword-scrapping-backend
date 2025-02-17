import express from 'express';
import * as reportController from '@/src/controllers/report.controller';

const router = express.Router();

router.get(
  '/report/:keywordId/detail',
  reportController.getKeywordScrappedResult,
);

export { router as reportRouter };
