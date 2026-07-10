import notificationRepository from '../repositories/notificationRepository.js';

class NotificationService {
    async processReminders() {
        const complaints = await notificationRepository.getOldUnresolvedComplaints();
        if (complaints.length === 0) {
            return 0;
        }

        const reminderValues = complaints.map(c => [
            c.complaint_id, 
            new Date(), 
            false, 
            c.assigned_authority_id
        ]);

        await notificationRepository.createReminders(reminderValues);
        return complaints.length;
    }

    async getStatusTimeline(complaintId) {
        return await notificationRepository.getTimeline(complaintId);
    }
}

export default new NotificationService();
