import express from 'express';
import { 
    loginAdmin, 
    getDashboardStats, 
    getPendingAuthorities, 
    getAllAuthorities, 
    approveAuthority, 
    rejectAuthority,
    suspendAuthority,
    reactivateAuthority,
    deleteAuthority,
    getAllReports,
    deleteReport
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middlewares/authMiddleware.js';
import { forgotPassword, verifyOtp, resetPassword } from '../controllers/authorityController.js'; 
// Using authority controller for OTP since it works on email. Wait, authorities controller uses authorityRepository. 
// I should make admin-specific forgot password if needed, but for now I'll just omit forgot password or implement it separately.

const router = express.Router();

router.post('/login', loginAdmin);

// Protect all routes below with verifyAdmin middleware
router.use(verifyAdmin);

router.get('/dashboard-stats', getDashboardStats);

router.get('/authorities', getAllAuthorities);
router.get('/authorities/pending', getPendingAuthorities);
router.post('/authorities/:id/approve', approveAuthority);
router.post('/authorities/:id/reject', rejectAuthority);
router.patch('/authorities/:id/suspend', suspendAuthority);
router.patch('/authorities/:id/reactivate', reactivateAuthority);
router.delete('/authorities/:id', deleteAuthority);

router.get('/reports', getAllReports);
router.delete('/reports/:id', deleteReport);

export default router;
