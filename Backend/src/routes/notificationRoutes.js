import express from 'express';
import { triggerReminders, getStatusTimeline } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/trigger-reminders', triggerReminders);
router.get('/timeline/:complaintId', getStatusTimeline);

export default router;
