import bcrypt from 'bcrypt';
import adminRepository from '../repositories/adminRepository.js';

class AdminService {
    async login(email, password) {
        const admin = await adminRepository.findByEmail(email);
        
        if (!admin) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
            throw { status: 403, message: 'Account is locked. Please try again later.' };
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            await adminRepository.incrementFailedLogin(email);
            const updatedAdmin = await adminRepository.findByEmail(email);
            
            if (updatedAdmin.failed_login_attempts >= 5) {
                const unlockTime = new Date(Date.now() + 30 * 60000); // lock for 30 minutes
                await adminRepository.lockAccount(email, unlockTime);
                throw { status: 403, message: 'Account locked due to too many failed attempts' };
            }
            throw { status: 401, message: 'Invalid credentials' };
        }

        await adminRepository.resetFailedLogin(email);
        
        // Remove password hash before returning
        const { password_hash, ...adminData } = admin;
        return adminData;
    }

    async getDashboardStats() {
        return await adminRepository.getDashboardStats();
    }

    async getPendingAuthorities() {
        return await adminRepository.getPendingAuthorities();
    }
    
    async getAllAuthorities() {
        return await adminRepository.getAllAuthorities();
    }

    async approveAuthority(id) {
        await adminRepository.updateAuthorityStatus(id, 'Approved');
        // Email handled in controller to avoid circular deps or service bloat, though typically it is here.
    }

    async rejectAuthority(id, reason) {
        if (!reason) throw { status: 400, message: 'Rejection reason is required' };
        await adminRepository.updateAuthorityStatus(id, 'Rejected', reason);
    }
    
    async suspendAuthority(id) {
        await adminRepository.updateAuthorityStatus(id, 'Suspended');
    }
    
    async reactivateAuthority(id) {
        await adminRepository.updateAuthorityStatus(id, 'Approved');
    }
    
    async deleteAuthority(id) {
        await adminRepository.deleteAuthority(id);
    }
    
    async getAllReports() {
        const reports = await adminRepository.getAllReports();
        
        // Fetch evidence for all reports (optimization: can use IN clause, but this is simple)
        for (let report of reports) {
            report.mediaFiles = await adminRepository.getReportEvidences(report.complaint_id);
            report.statusUpdates = await adminRepository.getReportStatusUpdates(report.complaint_id);
        }
        return reports;
    }
    
    async deleteReport(id) {
        await adminRepository.deleteReport(id);
    }
}

export default new AdminService();
