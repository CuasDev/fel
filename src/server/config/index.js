import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fel',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fel-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  apiPrefix: '/api/v1',
  swaggerPrefix: '/api-docs',
};

export default config;