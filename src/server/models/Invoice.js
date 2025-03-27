import mongoose from 'mongoose';

/**
 * Esquema de Factura para el sistema de facturación electrónica
 * @typedef {Object} Invoice
 * @property {string} invoiceNumber - Número de factura
 * @property {Date} issueDate - Fecha de emisión
 * @property {mongoose.Schema.Types.ObjectId} customer - Cliente asociado
 * @property {Array} items - Productos o servicios facturados
 * @property {number} subtotal - Subtotal antes de impuestos
 * @property {number} taxAmount - Monto de impuestos
 * @property {number} total - Total de la factura
 * @property {string} status - Estado de la factura (emitida, pagada, cancelada)
 * @property {string} paymentMethod - Método de pago
 * @property {Date} dueDate - Fecha de vencimiento
 * @property {string} notes - Notas adicionales
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de actualización
 */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'El número de factura es obligatorio'],
      unique: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'La fecha de emisión es obligatoria'],
      default: Date.now,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'El cliente es obligatorio'],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'El producto es obligatorio'],
        },
        description: {
          type: String,
          required: [true, 'La descripción es obligatoria'],
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, 'La cantidad es obligatoria'],
          min: [1, 'La cantidad debe ser al menos 1'],
        },
        unitPrice: {
          type: Number,
          required: [true, 'El precio unitario es obligatorio'],
          min: [0, 'El precio unitario no puede ser negativo'],
        },
        taxRate: {
          type: Number,
          required: [true, 'La tasa de impuesto es obligatoria'],
          default: 0,
        },
        subtotal: {
          type: Number,
          required: [true, 'El subtotal es obligatorio'],
        },
      },
    ],
    subtotal: {
      type: Number,
      required: [true, 'El subtotal es obligatorio'],
      min: [0, 'El subtotal no puede ser negativo'],
    },
    taxAmount: {
      type: Number,
      required: [true, 'El monto de impuestos es obligatorio'],
      min: [0, 'El monto de impuestos no puede ser negativo'],
    },
    total: {
      type: Number,
      required: [true, 'El total es obligatorio'],
      min: [0, 'El total no puede ser negativo'],
    },
    status: {
      type: String,
      required: [true, 'El estado es obligatorio'],
      enum: ['emitida', 'pagada', 'cancelada'],
      default: 'emitida',
    },
    paymentMethod: {
      type: String,
      required: [true, 'El método de pago es obligatorio'],
      enum: ['efectivo', 'tarjeta', 'transferencia', 'cheque', 'otro'],
      default: 'efectivo',
    },
    dueDate: {
      type: Date,
      required: [true, 'La fecha de vencimiento es obligatoria'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt
  }
);

// Middleware para calcular subtotal, impuestos y total antes de guardar
invoiceSchema.pre('save', function (next) {
  // Calcular subtotal
  this.subtotal = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  
  // Calcular impuestos
  this.taxAmount = this.items.reduce(
    (acc, item) => acc + (item.subtotal * item.taxRate) / 100,
    0
  );
  
  // Calcular total
  this.total = this.subtotal + this.taxAmount;
  
  next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - invoiceNumber
 *         - issueDate
 *         - customer
 *         - items
 *         - subtotal
 *         - taxAmount
 *         - total
 *         - status
 *         - paymentMethod
 *         - dueDate
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado de la factura
 *         invoiceNumber:
 *           type: string
 *           description: Número de factura
 *         issueDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de emisión
 *         customer:
 *           type: string
 *           description: ID del cliente asociado
 *         items:
 *           type: array
 *           description: Productos o servicios facturados
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: ID del producto
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *               quantity:
 *                 type: number
 *                 description: Cantidad
 *               unitPrice:
 *                 type: number
 *                 description: Precio unitario
 *               taxRate:
 *                 type: number
 *                 description: Tasa de impuesto
 *               subtotal:
 *                 type: number
 *                 description: Subtotal del ítem
 *         subtotal:
 *           type: number
 *           description: Subtotal antes de impuestos
 *         taxAmount:
 *           type: number
 *           description: Monto de impuestos
 *         total:
 *           type: number
 *           description: Total de la factura
 *         status:
 *           type: string
 *           enum: [emitida, pagada, cancelada]
 *           description: Estado de la factura
 *         paymentMethod:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia, cheque, otro]
 *           description: Método de pago
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de vencimiento
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;