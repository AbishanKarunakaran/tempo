import adminService from '../services/adminService.js';
import jwt from 'jsonwebtoken';
import otpService from '../services/otpService.js';
import { sendAuthorityApproval, sendAuthorityRejection } from '../services/emailService.js';
import db from '../../database/db.js';

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminService.login(email, password);
        
        const token = jwt.sign(
            { id: admin.admin_id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET || 'greenjustice_secret_key_2024',
            { expiresIn: '1d' }
        );
        
        res.status(200).json({ message: 'Login successful', token, admin });
    } catch (error) {
        console.error('Admin login error:', error.message);
        if (error.status) return res.status(error.status).json({ error: error.message });
        res.status(500).json({ error: 'Authentication failed' });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};

export const getPendingAuthorities = async (req, res) => {
    try {
        const authorities = await adminService.getPendingAuthorities();
        res.status(200).json(authorities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending authorities' });
    }
};

export const getAllAuthorities = async (req, res) => {
    try {
        const authorities = await adminService.getAllAuthorities();
        res.status(200).json(authorities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch authorities' });
    }
};

export const approveAuthority = async (req, res) => {
    try {
        const { id } = req.params;
        const [[authority]] = await db.query('SELECT name, email FROM Authorities WHERE authority_id = ?', [id]);
        
        if (!authority) return res.status(404).json({ error: 'Authority not found' });
        
        await adminService.approveAuthority(id);
        await sendAuthorityApproval(authority.email, authority.name);
        
        res.status(200).json({ message: 'Authority approved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve authority' });
    }
};

export const rejectAuthority = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const [[authority]] = await db.query('SELECT name, email FROM Authorities WHERE authority_id = ?', [id]);
        if (!authority) return res.status(404).json({ error: 'Authority not found' });
        
        await adminService.rejectAuthority(id, reason);
        await sendAuthorityRejection(authority.email, authority.name, reason);
        
        res.status(200).json({ message: 'Authority rejected successfully' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        res.status(500).json({ error: 'Failed to reject authority' });
    }
};

export const suspendAuthority = async (req, res) => {
    try {
        await adminService.suspendAuthority(req.params.id);
        res.status(200).json({ message: 'Authority suspended' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to suspend authority' });
    }
};

export const reactivateAuthority = async (req, res) => {
    try {
        await adminService.reactivateAuthority(req.params.id);
        res.status(200).json({ message: 'Authority reactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reactivate authority' });
    }
};

export const deleteAuthority = async (req, res) => {
    try {
        await adminService.deleteAuthority(req.params.id);
        res.status(200).json({ message: 'Authority deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete authority' });
    }
};

export const getAllReports = async (req, res) => {
    try {
        const reports = await adminService.getAllReports();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

export const deleteReport = async (req, res) => {
    try {
        await adminService.deleteReport(req.params.id);
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete report' });
    }
};
