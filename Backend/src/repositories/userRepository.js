import db from '../../database/db.js';

class UserRepository {
    async createUser(preferredLanguage) {
        const [result] = await db.query(
            'INSERT INTO Users (preferred_language) VALUES (?)',
            [preferredLanguage || 'English']
        );
        return result.insertId;
    }

    async getUserById(userId) {
        const [rows] = await db.query('SELECT * FROM Users WHERE user_id = ?', [userId]);
        return rows[0] || null;
    }
}

export default new UserRepository();

