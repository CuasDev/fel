import mongoose from 'mongoose';
import config from './index.js';

/**
 * Conecta a la base de datos MongoDB
 * @returns {Promise} Promesa de conexión a MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.uri, {
      // Opciones de conexión
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;