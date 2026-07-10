import authorityRepository from '../repositories/authorityRepository.js';
import bcrypt from 'bcrypt';
import otpService from './otpService.js';
import { sendAuthorityRegistrationReceived } from './emailService.js';

const SRI_LANKAN_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

class AuthorityService {
    async registerAuthorityData(payload) {
        const { name, email, password, region, registration_certificate } = payload;
        
        if (!name || !email || !region || !registration_certificate) {
            throw new Error('Name, email, district, and registration certificate are required');
        }

        // Secure certificate validation
        const certificateExtension = registration_certificate.split('.').pop().toLowerCase();
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        if (!allowedExtensions.includes(certificateExtension)) {
            throw new Error('Invalid file type for Registration Certificate. Only PDF, JPG, JPEG, and PNG are allowed.');
        }

        if (!SRI_LANKAN_DISTRICTS.includes(region)) {
            throw new Error('Invalid Sri Lankan district selected');
        }

        const existing = await authorityRepository.findByEmail(email);
        if (existing) {
            const error = new Error('Email already registered');
            error.status = 409;
            throw error;
        }

        if (!password) throw new Error('Password is required');
        
        // Password strength check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        }
        
        // Verify OTP
        const isVerified = await otpService.checkVerified(email, 'REGISTRATION');
        if (!isVerified) {
            throw new Error('Email verification required. Please verify OTP before registering.');
        }
        
        const password_hash = await bcrypt.hash(password, 10);

        const authorityId = await authorityRepository.createAuthority(name, email, password_hash, region, registration_certificate, null);
        
        // Consume OTP verification
        await otpService.consumeVerification(email, 'REGISTRATION');
        
        // Send email
        await sendAuthorityRegistrationReceived(email, name);
        
        return authorityId;
    }

    async login(email, password) {
        const authority = await authorityRepository.findByEmail(email);
        
        if (!authority) {
            const error = new Error('Invalid email or password');
            error.status = 401;
            throw error;
        }

        if (authority.locked_until && new Date(authority.locked_until) > new Date()) {
            const error = new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
            error.status = 403;
            throw error;
        }

        if (authority.status === 'Pending Verification') {
            const error = new Error('Account Pending Verification. Please wait for Admin approval.');
            error.status = 403;
            throw error;
        } else if (authority.status === 'Rejected') {
            const error = new Error(`Account Rejected. Reason: ${authority.rejection_reason || 'N/A'}`);
            error.status = 403;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, authority.password_hash);
        if (!isMatch) {
            await authorityRepository.incrementFailedLogin(email);
            if (authority.failed_login_attempts + 1 >= 5) {
                const lockTime = new Date(Date.now() + 15 * 60000); // 15 mins
                await authorityRepository.lockAccount(email, lockTime);
            }
            const error = new Error('Invalid email or password');
            error.status = 401;
            throw error;
        }

        await authorityRepository.resetFailedLogin(email);
        await authorityRepository.updateLastActive(authority.authority_id);
        
        // Don't send password hash back
        delete authority.password_hash;
        return authority;
    }

    async getStats(district) {
        const total = await authorityRepository.getComplaintCount(district);
        const resolved = await authorityRepository.getResolvedComplaintCount(district);
        const pending = await authorityRepository.getPendingComplaintCount(district);

        return { total, resolved, pending };
    }

    async getComplaintsMap(district) {
        const rows = await authorityRepository.getAllComplaintsForAuthority(district);

        const complaintsMap = rows.reduce((acc, row) => {
            const id = row.complaint_id;
            if (!acc[id]) {
                acc[id] = {
                    id: id,
                    complaint_id: id,
                    violation_id_string: row.violation_id_string,
                    linked_count: row.linked_count,
                    linked_ids: row.linked_ids,
                    categoryLabel: row.violation_type,
                    description: row.description,
                    status: row.status,
                    createdAt: row.report_date,
                    locationName: row.location_name,
                    latitude: row.latitude ? parseFloat(row.latitude) : null,
                    longitude: row.longitude ? parseFloat(row.longitude) : null,
                    mediaFiles: []
                };
            }
            if (row.file_url) {
                const alreadyExists = acc[id].mediaFiles.some(m => m.data === row.file_url);
                if (!alreadyExists) {
                    acc[id].mediaFiles.push({
                        type: row.file_type || 'image/jpeg',
                        data: row.file_url
                    });
                }
            }
            return acc;
        }, {});

        const complaintsArray = Object.values(complaintsMap);
        complaintsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return complaintsArray;
    }

    async removeComplaint(id) {
        const isDeleted = await authorityRepository.deleteComplaint(id);
        if (!isDeleted) {
            const error = new Error('Complaint not found');
            error.status = 404;
            throw error;
        }
        return true;
    }
}

export default new AuthorityService();
