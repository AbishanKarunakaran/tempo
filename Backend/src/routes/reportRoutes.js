import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitComplaint, getPublicStats, getComplaintStatus, updateComplaintStatus, sendOtp, verifyOtp, trackReport } from '../controllers/reportController.js';

const router = express.Router();

const reportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 report submissions per window
    message: { error: 'Too many reports submitted. Please wait 15 minutes before submitting another report.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/stats', getPublicStats);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/track/:violation_id', trackReport);
router.post('/', reportLimiter, submitComplaint);
router.get('/:id/status', getComplaintStatus);
router.patch('/:id/status', updateComplaintStatus);
router.post('/:id/status', updateComplaintStatus);

export default router;
