require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuration via environment variables; defaults provided for convenience
// You can create a `.env` file in the project root or set environment variables.
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const DB_USER = process.env.DB_USER || 'root';
// Default password is empty string (suitable for default XAMPP/MariaDB root without password)
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const DB_NAME = process.env.DB_NAME || 'library';

let pool;

async function initPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return pool;
}

async function query(sql, params) {
  const p = await initPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(path.resolve(filePath), 'utf8');
  // simple split by semicolon — OK for our controlled migration file
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Use a direct connection to run CREATE DATABASE / USE statements
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, multipleStatements: true });
  try {
    for (const stmt of statements) {
      await conn.query(stmt);
    }
  } finally {
    await conn.end();
  }
}

module.exports = {
  initPool,
  query,
  runSqlFile,
};
