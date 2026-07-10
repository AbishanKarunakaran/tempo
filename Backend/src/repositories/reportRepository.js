import db from '../../database/db.js';

class ReportRepository {
    async createComplaint(connection, user_id, user_email, violation_type, description, violation_id_string, parent_complaint_id) {
        const [result] = await connection.query(
            'INSERT INTO Complaints (user_id, user_email, violation_type, description, status, report_date, violation_id_string, parent_complaint_id) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)',
            [user_id || null, user_email || null, violation_type, description || '', 'Not Viewed', violation_id_string || null, parent_complaint_id || null]
        );
        return result.insertId;
    }

    async findNearbyComplaint(connection, violation_type, longitude, latitude, radiusMeters = 100, hours = 48) {
        const query = `
            SELECT c.complaint_id 
            FROM Complaints c
            JOIN Locations l ON c.complaint_id = l.complaint_id
            WHERE c.violation_type = ? 
              AND c.report_date >= NOW() - INTERVAL ? HOUR
              AND c.parent_complaint_id IS NULL
              AND (
                  6371000 * acos (
                      cos ( radians(?) )
                      * cos( radians( l.latitude ) )
                      * cos( radians( l.longitude ) - radians(?) )
                      + sin ( radians(?) )
                      * sin( radians( l.latitude ) )
                  )
              ) <= ?
            ORDER BY c.report_date DESC
            LIMIT 1
        `;
        const [rows] = await connection.query(query, [violation_type, hours, latitude, longitude, latitude, radiusMeters]);
        return rows.length > 0 ? rows[0].complaint_id : null;
    }

    async getComplaintByViolationIdString(violation_id_string) {
        const [rows] = await db.query(`
            SELECT c.*, l.location_name, l.district, l.latitude, l.longitude 
            FROM Complaints c
            LEFT JOIN Locations l ON c.complaint_id = l.complaint_id
            WHERE c.violation_id_string = ?
        `, [violation_id_string]);
        return rows[0] || null;
    }

    async getStatusUpdates(complaint_id) {
        const [rows] = await db.query('SELECT * FROM StatusUpdates WHERE complaint_id = ? ORDER BY timestamp DESC', [complaint_id]);
        return rows;
    }

    async createLocation(connection, complaintId, location_name, longitude, latitude, district) {
        await connection.query(
            'INSERT INTO Locations (complaint_id, location_name, longitude, latitude, district) VALUES (?, ?, ?, ?, ?)',
            [complaintId, location_name || '', longitude, latitude, district || null]
        );
    }

    async createEvidence(connection, complaintId, file_type, file_url) {
        await connection.query(
            'INSERT INTO Evidences (complaint_id, file_type, file_url) VALUES (?, ?, ?)',
            [complaintId, file_type || 'image', file_url]
        );
    }

    async getComplaintStatusById(id) {
        const [rows] = await db.query('SELECT status FROM Complaints WHERE complaint_id = ?', [id]);
        return rows[0] || null;
    }

    async updateComplaintStatus(id, status) {
        // Update the main complaint and all its children
        const [result] = await db.query('UPDATE Complaints SET status = ? WHERE complaint_id = ? OR parent_complaint_id = ?', [status, id, id]);
        return result.affectedRows > 0;
    }

    async createStatusUpdateHistory(id, authority_id, status, description) {
        await db.query(
            'INSERT INTO StatusUpdates (complaint_id, updated_by_authority_id, status, description, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [id, authority_id || null, status, description || 'Status changed']
        );
    }
}

export default new ReportRepository();

