import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createPool } from 'mysql2/promise';

const app = express(); // Crea la instancia de Express aquí

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permite todas las solicitudes, reemplaza '*' con tu dominio si es específico.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear pool de conexiones a MySQL
const pool = createPool({
  host: process.env.MYSQL_ADDON_HOST,
  port: process.env.MYSQL_ADDON_PORT,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB
});

// Verifica la conexión a la base de datos
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the database');
    connection.release();
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();

// Rutas y controladores
app.get('/productos', async (req, res) => {
    const sql = `SELECT productos.id_producto, productos.nombre, productos.precio, productos.descripcion, productos.stock, 
                categorias.nombre AS categoria, promos.promos AS banco, promos.descuento, 
                cuotas.cuotas, cuotas.interes
                FROM productos 
                JOIN categorias ON productos.fk_categoria = categorias.id_categoria
                JOIN promos ON productos.fk_promos = promos.id_promos
                JOIN cuotas ON productos.fk_cuotas = cuotas.id_cuotas
                ORDER BY productos.precio DESC`;
    try {
      const [rows] = await pool.query(sql);
      res.json(rows);
    } catch (error) {
      console.error('Error en GET /productos:', error);
      res.status(500).send('Internal server error');
    }
});

app.post('/productos', async (req, res) => {
  const producto = req.body;
  const sql = `INSERT INTO productos SET ?`;

  try {
    const [result] = await pool.query(sql, producto);
    res.status(201).send(`Producto creado con id: ${result.insertId}`);
  } catch (error) {
    console.error('Error en POST /productos:', error);
    res.status(500).send('Internal server error');
  }
});

// ... otras rutas y configuraciones

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



