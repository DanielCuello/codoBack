import dotenv from 'dotenv';
import express from 'express';
import { createPool } from 'mysql2/promise';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware para permitir CORS
const corsOptions = {
    origin: '*',
    credentials: true
};

app.use(cors(corsOptions));

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

// Ruta para obtener todos los productos
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

// Ruta para crear un nuevo producto
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

// Ruta para obtener un producto por su ID
app.get('/productos/:id', async (req, res) => {
    const idProducto = req.params.id;
    const sql = `SELECT * FROM productos WHERE id_producto = ?`;

    try {
        const [rows] = await pool.query(sql, idProducto);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        console.error('Error en GET /productos/:id:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para actualizar un producto por su ID
app.put('/productos/:id', async (req, res) => {
    const idProducto = req.params.id;
    const nuevoProducto = req.body;

    const sql = `UPDATE productos SET ? WHERE id_producto = ?`;

    try {
        const [result] = await pool.query(sql, [nuevoProducto, idProducto]);
        res.status(200).send(`Producto actualizado con ID: ${idProducto}`);
    } catch (error) {
        console.error('Error en PUT /productos/:id', error);
        res.status(500).send('Error interno del servidor al actualizar el producto');
    }
});

// Ruta para eliminar un producto por su ID
app.delete('/productos/:id', async (req, res) => {
    const idProducto = req.params.id;

    const sql = `DELETE FROM productos WHERE id_producto = ?`;

    try {
        const [result] = await pool.query(sql, idProducto);
        res.status(200).send(`Producto eliminado con ID: ${idProducto}`);
    } catch (error) {
        console.error('Error en DELETE /productos/:id', error);
        res.status(500).send('Error interno del servidor al eliminar el producto');
    }
});

// Puerto de escucha del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});