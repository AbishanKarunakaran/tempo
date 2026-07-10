import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Abish@07',
  database: process.env.DB_NAME || 'green_justice',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  max_allowed_packet: 16 * 1024 * 1024 // 16MB
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'green_justice'));
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database', err);
  });

export default pool;
