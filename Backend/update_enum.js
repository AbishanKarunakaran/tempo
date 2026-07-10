import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const updateEnum = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Abish_007',
            database: process.env.DB_NAME || 'green_justice',
        });
        
        await connection.query("ALTER TABLE Authorities MODIFY COLUMN status ENUM('Pending Verification', 'Approved', 'Rejected', 'Suspended') DEFAULT 'Pending Verification'");
        console.log("Successfully updated Authorities status ENUM.");
        
        await connection.end();
    } catch (error) {
        console.error("Error updating ENUM:", error.message);
    }
};

updateEnum();
