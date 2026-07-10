import db from '../../database/db.js';
class AuthorityRepository {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM Authorities WHERE email = ?', [email]);
        return rows[0] || null;
    }

    async createAuthority(name, email, password_hash, region, registration_certificate, google_id = null) {
        const [result] = await db.query(
            'INSERT INTO Authorities (name, email, password_hash, region, registration_certificate, google_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, password_hash, region, registration_certificate, google_id]
        );
        return result.insertId;
    }

    async incrementFailedLogin(email) {
        await db.query('UPDATE Authorities SET failed_login_attempts = failed_login_attempts + 1 WHERE email = ?', [email]);
    }

    async lockAccount(email, unlockTime) {
        await db.query('UPDATE Authorities SET locked_until = ? WHERE email = ?', [unlockTime, email]);
    }

    async resetFailedLogin(email) {
        await db.query('UPDATE Authorities SET failed_login_attempts = 0, locked_until = NULL WHERE email = ?', [email]);
    }

    async updateLastActive(authorityId) {
        await db.query('UPDATE Authorities SET last_active = CURRENT_TIMESTAMP WHERE authority_id = ?', [authorityId]);
    }

    async getComplaintCount(district) {
        let query = 'SELECT COUNT(c.complaint_id) as count FROM Complaints c LEFT JOIN Locations l ON c.complaint_id = l.complaint_id';
        const params = [];
        if (district) {
            query += ' WHERE l.district = ?';
            params.push(district);
        }
        const [total] = await db.query(query, params);
        return total[0].count;
    }
    
    async getResolvedComplaintCount(district) {
        let query = 'SELECT COUNT(c.complaint_id) as count FROM Complaints c LEFT JOIN Locations l ON c.complaint_id = l.complaint_id WHERE c.status = "Resolved"';
        const params = [];
        if (district) {
            query += ' AND l.district = ?';
            params.push(district);
        }
        const [resolved] = await db.query(query, params);
        return resolved[0].count;
    }

    async getPendingComplaintCount(district) {
        let query = 'SELECT COUNT(c.complaint_id) as count FROM Complaints c LEFT JOIN Locations l ON c.complaint_id = l.complaint_id WHERE c.status != "Resolved"';
        const params = [];
        if (district) {
            query += ' AND l.district = ?';
            params.push(district);
        }
        const [pending] = await db.query(query, params);
        return pending[0].count;
    }

    async getAllComplaintsForAuthority(district) {
        let query = `
            SELECT 
                c.complaint_id, c.violation_type, c.description, c.status, c.report_date, c.violation_id_string,
                l.location_name, l.latitude, l.longitude, l.district,
                e.file_type, e.file_url,
                (SELECT COUNT(*) FROM Complaints child WHERE child.parent_complaint_id = c.complaint_id) as linked_count,
                (SELECT GROUP_CONCAT(child.violation_id_string) FROM Complaints child WHERE child.parent_complaint_id = c.complaint_id) as linked_ids
            FROM Complaints c
            LEFT JOIN Locations l ON c.complaint_id = l.complaint_id
            LEFT JOIN Evidences e ON c.complaint_id = e.complaint_id
            WHERE c.parent_complaint_id IS NULL
        `;
        const params = [];
        if (district) {
            query += ' AND l.district = ?';
            params.push(district);
        }
        query += ' ORDER BY c.report_date DESC';
        const [rows] = await db.query(query, params);
        return rows;
    }

    async deleteComplaint(id) {
        const [result] = await db.query('DELETE FROM Complaints WHERE complaint_id = ?', [id]);
        return result.affectedRows > 0;
    }
}

export default new AuthorityRepository();

