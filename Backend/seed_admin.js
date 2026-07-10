import bcrypt from 'bcrypt';
import db from './database/db.js';

async function seedAdmin() {
    try {
        const email = 'admin.gj.26@gmail.com';
        const name = 'Super Admin';
        const password = 'Admin_GJ_2026';
        
        // Clear existing admins to ensure these custom credentials are the only ones
        await db.query('TRUNCATE TABLE Admins');

        const password_hash = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO Admins (name, email, password_hash) VALUES (?, ?, ?)', [name, email, password_hash]);
        console.log('Default admin created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed admin:', error);
        process.exit(1);
    }
}

seedAdmin();
