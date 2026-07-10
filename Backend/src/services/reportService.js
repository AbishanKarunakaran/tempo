import db from '../../database/db.js';
import reportRepository from '../repositories/reportRepository.js';

import otpService from './otpService.js';
import { sendStatusUpdate } from './emailService.js';

class ReportService {
    async sumbitReportData(payload) {
        const { user_id, user_email, violation_type, description, location_name, longitude, latitude, district, file_type, file_url } = payload;
        
        // Validation: Verify files (images/videos only)
        if (file_url) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
            if (!allowedTypes.includes(file_type) && !file_type.startsWith('image/') && !file_type.startsWith('video/')) {
                throw new Error('Invalid file type. Only images and videos are allowed as evidence.');
            }
        }

        // If email is provided, verify that an OTP was successfully validated
        if (user_email) {
            const isVerified = await otpService.checkVerified(user_email, 'REPORT');
            if (!isVerified) {
                throw new Error('Email verification required. Please verify OTP before submitting.');
            }
        }

        // Check for duplicate submissions within last 1 minute
        if (longitude && latitude) {
            const [recentDuplicate] = await db.query(
                `SELECT c.complaint_id FROM Complaints c 
                 JOIN Locations l ON c.complaint_id = l.complaint_id
                 WHERE l.latitude = ? AND l.longitude = ? AND c.violation_type = ? 
                   AND c.report_date >= NOW() - INTERVAL 1 MINUTE LIMIT 1`,
                [latitude, longitude, violation_type]
            );
            if (recentDuplicate && recentDuplicate.length > 0) {
                throw new Error('Duplicate submission detected. Please wait a moment before reporting again.');
            }
        }
        if (description) {
            const [recentDescDuplicate] = await db.query(
                `SELECT complaint_id FROM Complaints 
                 WHERE description = ? AND violation_type = ? 
                   AND report_date >= NOW() - INTERVAL 1 MINUTE LIMIT 1`,
                [description, violation_type]
            );
            if (recentDescDuplicate && recentDescDuplicate.length > 0) {
                throw new Error('Duplicate submission detected. Please wait a moment before reporting again.');
            }
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Find duplicate/nearby complaint
            let parent_complaint_id = null;
            if (longitude && latitude) {
                parent_complaint_id = await reportRepository.findNearbyComplaint(connection, violation_type, longitude, latitude, 100, 48);
            }

            // Generate unique sequential Violation ID (e.g. VR-2026-000001)
            const year = new Date().getFullYear();
            const [countRows] = await connection.query(
                'SELECT COUNT(*) as count FROM Complaints WHERE violation_id_string LIKE ?',
                [`VR-${year}-%`]
            );
            const sequenceNum = (countRows[0].count + 1).toString().padStart(6, '0');
            const violation_id_string = `VR-${year}-${sequenceNum}`;

            const complaintId = await reportRepository.createComplaint(connection, user_id, user_email, violation_type, description, violation_id_string, parent_complaint_id);

            if (longitude && latitude) {
                await reportRepository.createLocation(connection, complaintId, location_name, longitude, latitude, district);
            }

            if (file_url) {
                await reportRepository.createEvidence(connection, complaintId, file_type, file_url);
            }

            await connection.commit();

            // Consume OTP verification
            if (user_email) {
                await otpService.consumeVerification(user_email, 'REPORT');
            }

            return { complaintId, violation_id_string };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getStatus(id) {
        const complaint = await reportRepository.getComplaintStatusById(id);
        if (!complaint) {
            throw new Error('Complaint not found');
        }
        return complaint.status;
    }

    async updateStatus(id, status, authority_id, description) {
        if (!description || description.trim() === '') {
            throw new Error('Authority Remark is required when updating status');
        }

        // Get all affected complaints (the parent and its children)
        const [rows] = await db.query(
            'SELECT complaint_id, user_email, violation_id_string FROM Complaints WHERE complaint_id = ? OR parent_complaint_id = ?',
            [id, id]
        );

        if (rows.length === 0) {
            throw new Error('Complaint not found');
        }

        // Update status in Complaints table
        await reportRepository.updateComplaintStatus(id, status);

        // Add history and send emails for all affected complaints
        for (const row of rows) {
            await reportRepository.createStatusUpdateHistory(row.complaint_id, authority_id, status, description);
            
            if (row.user_email) {
                // Fire and forget email sending
                sendStatusUpdate(row.user_email, row.violation_id_string, status, description).catch(err => {
                    console.error('Failed to send status update email to', row.user_email, err);
                });
            }
        }

        return true;
    }
}

export default new ReportService();
