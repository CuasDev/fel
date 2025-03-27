import express from 'express';
import ViteExpress from 'vite-express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import setupSwagger from './config/swagger.js';
import config from './config/index.js';

// Importar rutas
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging en desarrollo
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Configurar rutas API
app.use(`${config.apiPrefix}/users`, userRoutes);
app.use(`${config.apiPrefix}/products`, productRoutes);
app.use(`${config.apiPrefix}/customers`, customerRoutes);
app.use(`${config.apiPrefix}/invoices`, invoiceRoutes);

// Ruta de prueba
app.get('/hello', (req, res) => {
  res.send('Hello Vite + React!');
});

// Configurar Swagger
setupSwagger(app);

// Iniciar servidor
ViteExpress.listen(app, config.port, () =>
  console.log(`Servidor ejecutándose en modo ${config.env} en el puerto ${config.port}...`)
);
