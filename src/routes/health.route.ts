import express from 'express';
import * as healthController from '@src/controllers/health.controller';

const router = express.Router();

router.get('/health', healthController.healthCheck);

export { router as healthRouter };
