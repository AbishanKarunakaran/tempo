import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addColumn() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'green_justice'
    });

    console.log('Connected to MySQL database.');

    await connection.query('ALTER TABLE Complaints ADD COLUMN description TEXT');
    console.log('Added description column to Complaints table.');

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

addColumn();
