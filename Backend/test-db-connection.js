import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchAndSaveDBEntries() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'green_justice'
    });

    console.log('Connected to MySQL database.');

    const tables = ['Violations', 'Users', 'Authorities', 'Complaints', 'Evidences'];
    let outputContent = "--- DATABASE ENTRIES ---\n\n";

    for (let table of tables) {
      const [rows] = await connection.query(`SELECT * FROM ${table}`);
      outputContent += `TABLE: ${table}\n`;
      if (rows.length === 0) {
        outputContent += `(No entries found in ${table})\n\n`;
      } else {
        // Simple table formatting
        const headers = Object.keys(rows[0]);
        // align columns rudimentarily
        outputContent += headers.join('\t| ') + '\n';
        outputContent += '-'.repeat(80) + '\n';
        rows.forEach(row => {
          outputContent += Object.values(row).map(val => val === null ? 'NULL' : val).join('\t| ') + '\n';
        });
        outputContent += '\n';
      }
    }

    const outputPath = path.join(__dirname, 'database_entries.txt');
    fs.writeFileSync(outputPath, outputContent, 'utf-8');
    console.log(`Successfully wrote database entries to database_entries.txt`);

    await connection.end();
  } catch (error) {
    console.error('Error fetching database entries:', error);
  }
}

fetchAndSaveDBEntries();
