import notificationService from '../services/notificationService.js';

export const triggerReminders = async (req, res) => {
    try {
        const count = await notificationService.processReminders();
        if (count === 0) {
            return res.status(200).json({ message: 'No reminders to trigger' });
        }
        res.status(200).json({ message: `Triggered ${count} reminders` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process reminders' });
    }
};

export const getStatusTimeline = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const timeline = await notificationService.getStatusTimeline(complaintId);
        res.status(200).json(timeline);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch timeline' });
    }
};
