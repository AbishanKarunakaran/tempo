import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'green_justice'
    });

    console.log('Connected to MySQL database.');

    const [rows] = await connection.query('DESCRIBE Complaints');
    console.log('Complaints table structure:');
    console.log(rows);

    const [rows2] = await connection.query('DESCRIBE Locations');
    console.log('Locations table structure:');
    console.log(rows2);

    const [rows3] = await connection.query('DESCRIBE Evidences');
    console.log('Evidences table structure:');
    console.log(rows3);

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructure();
