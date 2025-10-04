// src/db.js
const mysql = require("mysql2/promise");

const {
  DB_HOST = "db",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "demo_db",
} = process.env;

let pool;

async function init() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Create table if doesn't exist
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  await pool.query(createTableSql);
  return pool;
}

module.exports = { init };
