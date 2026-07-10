import db from '../../database/db.js';
class NotificationRepository {
    async getOldUnresolvedComplaints() {
        const [complaints] = await db.query(`
            SELECT complaint_id, assigned_authority_id, report_date 
            FROM Complaints 
            WHERE status != 'Resolved' 
            AND report_date <= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        return complaints;
    }

    async createReminders(reminderValues) {
        await db.query(
            'INSERT IGNORE INTO Reminders (complaint_id, scheduled_date, sent_status, recipient_authority_id) VALUES ?',
            [reminderValues]
        );
    }

    async getTimeline(complaintId) {
        const [timeline] = await db.query(
            'SELECT * FROM StatusUpdates WHERE complaint_id = ? ORDER BY timestamp DESC',
            [complaintId]
        );
        return timeline;
    }
}

export default new NotificationRepository();
