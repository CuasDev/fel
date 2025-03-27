import mongoose from 'mongoose';

/**
 * Esquema de Cliente para el sistema de facturación electrónica
 * @typedef {Object} Customer
 * @property {string} taxId - Identificación fiscal (RFC, NIT, etc.)
 * @property {string} name - Nombre o razón social
 * @property {string} email - Correo electrónico
 * @property {string} phone - Teléfono
 * @property {Object} address - Dirección
 * @property {string} address.street - Calle
 * @property {string} address.city - Ciudad
 * @property {string} address.state - Estado/Provincia
 * @property {string} address.postalCode - Código postal
 * @property {string} address.country - País
 * @property {boolean} active - Estado del cliente
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de actualización
 */
const customerSchema = new mongoose.Schema(
  {
    taxId: {
      type: String,
      required: [true, 'La identificación fiscal es obligatoria'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo electrónico válido'],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: 'México',
      },
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
 *     Customer:
 *       type: object
 *       required:
 *         - taxId
 *         - name
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado del cliente
 *         taxId:
 *           type: string
 *           description: Identificación fiscal (RFC, NIT, etc.)
 *         name:
 *           type: string
 *           description: Nombre o razón social
 *         email:
 *           type: string
 *           description: Correo electrónico
 *         phone:
 *           type: string
 *           description: Teléfono
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               description: Calle
 *             city:
 *               type: string
 *               description: Ciudad
 *             state:
 *               type: string
 *               description: Estado/Provincia
 *             postalCode:
 *               type: string
 *               description: Código postal
 *             country:
 *               type: string
 *               description: País
 *         active:
 *           type: boolean
 *           description: Estado del cliente
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;