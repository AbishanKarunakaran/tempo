import authorityService from '../services/authorityService.js';
import jwt from 'jsonwebtoken';
import otpService from '../services/otpService.js';
import authorityRepository from '../repositories/authorityRepository.js';
import bcrypt from 'bcrypt';
import db from '../../database/db.js';

export const registerAuthority = async (req, res) => {
    try {
        const payload = req.body;
        if (req.file) {
            payload.registration_certificate = '/uploads/' + req.file.filename;
        }
        const authorityId = await authorityService.registerAuthorityData(payload);
        res.status(201).json({ message: 'Authority registered successfully', authority_id: authorityId });
    } catch (error) {
        console.error('Registration error:', error.message);
        if (error.status === 409) return res.status(409).json({ error: error.message });
        if (error.message.includes('required') || error.message.includes('Invalid')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to register authority: ' + error.message });
    }
};

export const loginAuthority = async (req, res) => {
    try {
        const authority = await authorityService.login(req.body.email, req.body.password);
        const token = jwt.sign(
            { id: authority.authority_id, email: authority.email, region: authority.region },
            process.env.JWT_SECRET || 'greenjustice_secret_key_2024',
            { expiresIn: '7d' }
        );
        res.status(200).json({ message: 'Login successful', token, authority });
    } catch (error) {
        console.error('Login error:', error.message);
        if (error.status) return res.status(error.status).json({ error: error.message });
        res.status(500).json({ error: 'Authentication failed: ' + error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const { district } = req.query;
        const stats = await authorityService.getStats(district);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getComplaints = async (req, res) => {
    try {
        // Enforce district from the JWT token — ignores any client-side district param
        let district = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'greenjustice_secret_key_2024');
                district = decoded.region || null;
            } catch (e) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
        } else {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const complaintsMap = await authorityService.getComplaintsMap(district);
        res.status(200).json(complaintsMap);
    } catch (error) {
        console.error('Failed to fetch complaints:', error.message);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

export const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Backend: Attempting to delete complaint_id: ${id}`);
        
        await authorityService.removeComplaint(id);

        console.log(`Backend: Successfully deleted complaint_id: ${id}`);
        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error.message);
        if (error.status === 404) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Failed to delete complaint: ' + error.message });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email, purpose } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        await otpService.createAndSendOTP(email, purpose || 'REGISTRATION');
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Failed to send OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, purpose } = req.body;
        const isValid = await otpService.verifyOTP(email, otp, purpose || 'REGISTRATION');
        if (isValid) {
            res.status(200).json({ message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error('Failed to verify OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const authority = await authorityRepository.findByEmail(email);
        if (!authority) return res.status(404).json({ error: 'User not found' });
        
        await otpService.createAndSendOTP(email, 'PASSWORD_RESET');
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, password, otp } = req.body;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
        }

        const isValid = await otpService.verifyOTP(email, otp, 'PASSWORD_RESET');
        if (!isValid) return res.status(400).json({ error: 'Invalid or expired OTP' });
        
        const password_hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE Authorities SET password_hash = ? WHERE email = ?', [password_hash, email]);
        
        // Consume verification
        await otpService.consumeVerification(email, 'PASSWORD_RESET');
        
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

export const changePassword = async (req, res) => {
    try {
        // Need to extract email from token
        let email = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'greenjustice_secret_key_2024');
            email = decoded.email;
        }
        if (!email) return res.status(401).json({ error: 'Unauthorized' });

        const { currentPassword, newPassword } = req.body;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
        }

        const authority = await authorityRepository.findByEmail(email);
        
        const isMatch = await bcrypt.compare(currentPassword, authority.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });
        
        const password_hash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE Authorities SET password_hash = ? WHERE email = ?', [password_hash, email]);
        
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
