import express from 'express';
import { sendNotification } from '../controllers/notification.js';
import { authenticate } from '../middlewares/VerifyToken.js';

const router = express.Router()

router.post('/send', authenticate, sendNotification)

export default router;