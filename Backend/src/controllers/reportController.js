import reportService from '../services/reportService.js';
import authorityService from '../services/authorityService.js';
import otpService from '../services/otpService.js';
import reportRepository from '../repositories/reportRepository.js';

export const submitComplaint = async (req, res) => {
    try {
        const result = await reportService.sumbitReportData(req.body);
        res.status(201).json({ 
            message: 'Complaint submitted successfully', 
            complaint_id: result.complaintId,
            violation_id: result.violation_id_string
        });
    } catch (error) {
        console.error('Failed to submit complaint:', error.message);
        res.status(500).json({ error: 'Failed to submit complaint: ' + error.message });
    }
};

export const getPublicStats = async (req, res) => {
    try {
        const stats = await authorityService.getStats(); // no district = global stats
        res.status(200).json(stats);
    } catch (error) {
        console.error('Failed to fetch public stats:', error.message);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        await otpService.createAndSendOTP(email, 'REPORT');
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Failed to send OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const isValid = await otpService.verifyOTP(email, otp, 'REPORT');
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

export const trackReport = async (req, res) => {
    try {
        const { violation_id } = req.params;
        const report = await reportRepository.getComplaintByViolationIdString(violation_id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        const updates = await reportRepository.getStatusUpdates(report.complaint_id);
        res.status(200).json({ report, updates });
    } catch (error) {
        console.error('Failed to track report:', error);
        res.status(500).json({ error: 'Failed to track report' });
    }
};

export const getComplaintStatus = async (req, res) => {
    try {
        const status = await reportService.getStatus(req.params.id);
        res.status(200).json({ status });
    } catch (error) {
        if (error.message === 'Complaint not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, authority_id, description } = req.body;
        console.log(`Backend: Update status request for complaint_id: ${id} to ${status}`);

        await reportService.updateStatus(id, status, authority_id, description);

        console.log(`Backend: Successfully updated status for complaint_id: ${id}`);
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        if (error.message === 'Complaint not found') {
            console.log(`Backend: No complaint found to update status for ID: ${req.params.id}`);
            return res.status(404).json({ error: error.message });
        }
        console.error('Update status error:', error.message);
        res.status(500).json({ error: 'Failed to update complaint status: ' + error.message });
    }
};
