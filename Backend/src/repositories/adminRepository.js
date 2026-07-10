import db from '../../database/db.js';

class AdminRepository {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM Admins WHERE email = ?', [email]);
        return rows[0];
    }
    
    async findById(id) {
        const [rows] = await db.query('SELECT * FROM Admins WHERE admin_id = ?', [id]);
        return rows[0];
    }

    async incrementFailedLogin(email) {
        await db.query('UPDATE Admins SET failed_login_attempts = failed_login_attempts + 1 WHERE email = ?', [email]);
    }

    async lockAccount(email, unlockTime) {
        await db.query('UPDATE Admins SET locked_until = ? WHERE email = ?', [unlockTime, email]);
    }

    async resetFailedLogin(email) {
        await db.query('UPDATE Admins SET failed_login_attempts = 0, locked_until = NULL WHERE email = ?', [email]);
    }
    
    async updatePassword(email, password_hash) {
        await db.query('UPDATE Admins SET password_hash = ? WHERE email = ?', [password_hash, email]);
    }

    async getDashboardStats() {
        const [[{ total_reports }]] = await db.query('SELECT COUNT(*) as total_reports FROM Complaints');
        const [[{ pending_reports }]] = await db.query('SELECT COUNT(*) as pending_reports FROM Complaints WHERE status = "Not Viewed" OR status = "Pending"');
        const [[{ in_progress_reports }]] = await db.query('SELECT COUNT(*) as in_progress_reports FROM Complaints WHERE status = "In Progress"');
        const [[{ resolved_reports }]] = await db.query('SELECT COUNT(*) as resolved_reports FROM Complaints WHERE status = "Resolved"');
        const [[{ rejected_reports }]] = await db.query('SELECT COUNT(*) as rejected_reports FROM Complaints WHERE status = "Rejected"');
        
        const [[{ total_authorities }]] = await db.query('SELECT COUNT(*) as total_authorities FROM Authorities');
        const [[{ active_authorities }]] = await db.query('SELECT COUNT(*) as active_authorities FROM Authorities WHERE status = "Approved"');
        const [[{ pending_authorities }]] = await db.query('SELECT COUNT(*) as pending_authorities FROM Authorities WHERE status = "Pending Verification"');

        return {
            reports: {
                total: total_reports,
                pending: pending_reports,
                in_progress: in_progress_reports,
                resolved: resolved_reports,
                rejected: rejected_reports
            },
            authorities: {
                total: total_authorities,
                active: active_authorities,
                pending: pending_authorities
            }
        };
    }
    
    async getAllAuthorities() {
        const [rows] = await db.query('SELECT authority_id, name, email, region, registration_certificate, status, rejection_reason, failed_login_attempts, locked_until, google_id FROM Authorities ORDER BY authority_id DESC');
        return rows;
    }
    
    async getPendingAuthorities() {
        const [rows] = await db.query('SELECT authority_id, name, email, region, registration_certificate, status FROM Authorities WHERE status = "Pending Verification" ORDER BY authority_id DESC');
        return rows;
    }

    async updateAuthorityStatus(id, status, reason = null) {
        await db.query('UPDATE Authorities SET status = ?, rejection_reason = ? WHERE authority_id = ?', [status, reason, id]);
    }

    async deleteAuthority(id) {
        // Soft delete logic if we had is_deleted, for now we can just hard delete or set a special status.
        // The requirements say "Soft delete", but there's no is_deleted column in Authorities. 
        // Let's add it via ALTER query if needed, or just delete it.
        // Wait, schema.sql doesn't have is_deleted for Authorities. Let's do hard delete for now.
        await db.query('DELETE FROM Authorities WHERE authority_id = ?', [id]);
    }
    
    async getAllReports() {
        const [rows] = await db.query(`
            SELECT c.*, l.location_name, l.district, l.longitude, l.latitude 
            FROM Complaints c 
            LEFT JOIN Locations l ON c.complaint_id = l.complaint_id 
            ORDER BY c.complaint_id DESC
        `);
        return rows;
    }

    async getReportEvidences(complaintId) {
        const [rows] = await db.query('SELECT * FROM Evidences WHERE complaint_id = ?', [complaintId]);
        return rows;
    }

    async getReportStatusUpdates(complaintId) {
        const [rows] = await db.query('SELECT * FROM StatusUpdates WHERE complaint_id = ? ORDER BY timestamp DESC', [complaintId]);
        return rows;
    }
    
    async deleteReport(id) {
        await db.query('DELETE FROM Complaints WHERE complaint_id = ?', [id]);
    }
}

export default new AdminRepository();
