import express from 'express';
import multer from 'multer';
import { registerAuthority, loginAuthority, getDashboardStats, getComplaints, deleteComplaint, sendOtp, verifyOtp, forgotPassword, resetPassword, changePassword } from '../controllers/authorityController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', upload.single('registration_certificate'), registerAuthority);
router.post('/login', loginAuthority);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
router.get('/dashboard', getDashboardStats);
router.get('/complaints', getComplaints);
router.delete('/complaints/:id', deleteComplaint);
router.post('/complaints/:id/delete', deleteComplaint);

export default router;
