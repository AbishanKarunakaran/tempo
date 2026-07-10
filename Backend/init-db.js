import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDB() {
  try {
    // Connect without DB selected to create the DB first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'green_justice'}\`;`);
    console.log(`Database '${process.env.DB_NAME}' created or already exists.`);

    await connection.changeUser({ database: process.env.DB_NAME || 'green_justice' });

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    // Splitting by semicolon and filtering out empty queries
    const queries = sqlScript.split(';').filter(q => q.trim().length > 0);

    for (let query of queries) {
      if (query.trim()) {
         try {
             await connection.query(query);
         } catch (e) {
             console.error('Error executing query:', query.substring(0, 50) + '...', e.message);
         }
      }
    }
    
    console.log('Schema imported successfully!');
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDB();
