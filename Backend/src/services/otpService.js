import db from '../../database/db.js';
import { sendOTP } from './emailService.js';

class OtpService {
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async createAndSendOTP(email, purpose) {
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        await db.query(
            'INSERT INTO OtpVerifications (email, otp, purpose, expires_at) VALUES (?, ?, ?, ?)',
            [email, otp, purpose, expiresAt]
        );

        console.log(`\n========================================`);
        console.log(`🔑 DEV MODE: OTP for ${email} is: ${otp}`);
        console.log(`========================================\n`);

        await sendOTP(email, otp, purpose);
        return true;
    }

    async verifyOTP(email, otp, purpose) {
        const [rows] = await db.query(
            'SELECT * FROM OtpVerifications WHERE email = ? AND otp = ? AND purpose = ? AND verified = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp, purpose]
        );

        if (rows.length === 0) {
            return false;
        }

        // Mark as verified
        await db.query('UPDATE OtpVerifications SET verified = TRUE WHERE id = ?', [rows[0].id]);
        return true;
    }

    async checkVerified(email, purpose) {
        const [rows] = await db.query(
            'SELECT * FROM OtpVerifications WHERE email = ? AND purpose = ? AND verified = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, purpose]
        );
        return rows.length > 0;
    }

    async consumeVerification(email, purpose) {
        await db.query(
            'UPDATE OtpVerifications SET expires_at = CURRENT_TIMESTAMP WHERE email = ? AND purpose = ? AND verified = TRUE',
            [email, purpose]
        );
    }
}

export default new OtpService();

