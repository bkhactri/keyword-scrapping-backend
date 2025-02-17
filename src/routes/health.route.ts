import express from 'express';
import * as healthController from '../controllers/health.controller';

const router = express.Router();

router.get('/health', healthController.healthCheck);

export { router };
