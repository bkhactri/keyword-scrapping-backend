import express from 'express';
import * as userController from '@src/controllers/user.controller';

const router = express.Router();

router.get('/user', userController.getUserInfo);

export { router as userRouter };
