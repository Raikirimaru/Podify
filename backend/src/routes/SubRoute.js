import express from 'express'
import { createSubscription, getSubscriptions, deleteSubscription, checkSubscription, toggleSubscription } from '../controllers/subscription.js'
import { authenticate } from '../middlewares/VerifyToken.js'

const router = express.Router();

router.post('/subscribe', authenticate, createSubscription);
router.get('/subscriptions', authenticate, getSubscriptions);
router.post('/unsubscribe', authenticate, deleteSubscription);
router.get('/check', authenticate, checkSubscription);
router.post('/toggle', authenticate, toggleSubscription);


export default router;