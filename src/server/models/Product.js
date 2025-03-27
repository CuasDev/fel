import mongoose from 'mongoose';

/**
 * Esquema de Producto para el sistema de facturación electrónica
 * @typedef {Object} Product
 * @property {string} code - Código único del producto
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripción del producto
 * @property {number} price - Precio unitario
 * @property {number} taxRate - Tasa de impuesto aplicable (porcentaje)
 * @property {string} unit - Unidad de medida
 * @property {number} stock - Cantidad en inventario
 * @property {string} category - Categoría del producto
 * @property {boolean} active - Estado del producto
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de actualización
 */
const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'El código es obligatorio'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    taxRate: {
      type: Number,
      required: [true, 'La tasa de impuesto es obligatoria'],
      default: 0,
      min: [0, 'La tasa de impuesto no puede ser negativa'],
    },
    unit: {
      type: String,
      required: [true, 'La unidad de medida es obligatoria'],
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    category: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt
  }
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - price
 *         - taxRate
 *         - unit
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado del producto
 *         code:
 *           type: string
 *           description: Código único del producto
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         description:
 *           type: string
 *           description: Descripción del producto
 *         price:
 *           type: number
 *           description: Precio unitario
 *         taxRate:
 *           type: number
 *           description: Tasa de impuesto aplicable (porcentaje)
 *         unit:
 *           type: string
 *           description: Unidad de medida
 *         stock:
 *           type: number
 *           description: Cantidad en inventario
 *         category:
 *           type: string
 *           description: Categoría del producto
 *         active:
 *           type: boolean
 *           description: Estado del producto
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

const Product = mongoose.model('Product', productSchema);

export default Product;