import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'admin.gj.26@gmail.com',
        pass: process.env.EMAIL_PASS // Need an App Password here
    }
});

import fs from 'fs';
import path from 'path';

export const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_PASS) {
            console.error('\n❌ ERROR: EMAIL_PASS is missing in Backend/.env! Cannot send email.\n');
            return false;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || 'admin.gj.26@gmail.com',
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${info.response}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error.message);
        return false;
    }
};

export const sendOTP = async (to, otp, purpose) => {
    const subject = `${purpose} - Green Justice OTP Verification`;
    const html = `
        <h2>Green Justice Verification</h2>
        <p>Your One-Time Password (OTP) for ${purpose.toLowerCase()} is:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;
    return sendEmail(to, subject, html);
};

export const sendStatusUpdate = async (to, reportId, status, remarks) => {
    const subject = `Update on your Report (${reportId})`;
    const html = `
        <h2>Report Status Updated</h2>
        <p>Your violation report <strong>${reportId}</strong> has been updated.</p>
        <p><strong>New Status:</strong> ${status}</p>
        <p><strong>Authority Remarks:</strong> ${remarks || 'None provided'}</p>
        <p>Thank you for contributing to Green Justice.</p>
    `;
    return sendEmail(to, subject, html);
};

export const sendAuthorityRegistrationReceived = async (to, name) => {
    const subject = `Authority Registration Received`;
    const html = `
        <p>Hello ${name},</p>
        <p>Your authority registration request has been received successfully.</p>
        <p>Your account is currently under administrator verification.</p>
        <p>You cannot log in until your registration has been reviewed and approved.</p>
        <p>Current Status: Pending Verification</p>
        <p>Thank you.</p>
    `;
    return sendEmail(to, subject, html);
};

export const sendAuthorityApproval = async (to, name) => {
    const subject = `Authority Registration Approved`;
    const html = `
        <p>Hello ${name},</p>
        <p>Congratulations!</p>
        <p>Your authority registration has been verified and approved.</p>
        <p>You may now log in to the Authority Portal and access your dashboard.</p>
        <p>Thank you.</p>
    `;
    return sendEmail(to, subject, html);
};

export const sendAuthorityRejection = async (to, name, reason) => {
    const subject = `Authority Registration Rejected`;
    const html = `
        <p>Hello ${name},</p>
        <p>Your authority registration has been reviewed.</p>
        <p>Unfortunately, your registration request could not be approved.</p>
        <p>Reason:<br/>${reason}</p>
        <p>Please correct the issue and register again.</p>
        <p>Thank you.</p>
    `;
    return sendEmail(to, subject, html);
};
