import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createPool } from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear pool de conexiones a MySQL
const pool = createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Connected to the database");
    connection.release();
  })
  .catch((error) => {
    console.log("Error connecting to the database", error);
  });

export default pool;
