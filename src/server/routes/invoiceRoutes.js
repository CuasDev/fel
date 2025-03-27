import express from 'express';
import { body } from 'express-validator';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  generateInvoiceReport,
} from '../controllers/invoiceController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/invoices:
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceNumber
 *               - customer
 *               - items
 *               - paymentMethod
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *                 description: Número de factura
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de emisión
 *               customer:
 *                 type: string
 *                 description: ID del cliente
 *               items:
 *                 type: array
 *                 description: Productos o servicios facturados
 *                 items:
 *                   type: object
 *                   required:
 *                     - product
 *                     - quantity
 *                     - unitPrice
 *                     - taxRate
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: ID del producto
 *                     description:
 *                       type: string
 *                       description: Descripción del producto
 *                     quantity:
 *                       type: number
 *                       description: Cantidad
 *                     unitPrice:
 *                       type: number
 *                       description: Precio unitario
 *                     taxRate:
 *                       type: number
 *                       description: Tasa de impuesto
 *               paymentMethod:
 *                 type: string
 *                 enum: [efectivo, tarjeta, transferencia, cheque, otro]
 *                 description: Método de pago
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de vencimiento
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cliente o producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/',
  [
    body('invoiceNumber').notEmpty().withMessage('El número de factura es obligatorio'),
    body('customer').notEmpty().withMessage('El cliente es obligatorio'),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem'),
    body('items.*.product').notEmpty().withMessage('El producto es obligatorio'),
    body('items.*.quantity').isNumeric().withMessage('La cantidad debe ser un número'),
    body('items.*.unitPrice').isNumeric().withMessage('El precio unitario debe ser un número'),
    body('items.*.taxRate').isNumeric().withMessage('La tasa de impuesto debe ser un número'),
    body('paymentMethod')
      .isIn(['efectivo', 'tarjeta', 'transferencia', 'cheque', 'otro'])
      .withMessage('Método de pago no válido'),
  ],
  createInvoice
);

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [emitida, pagada, cancelada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/', getInvoices);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getInvoiceById);

/**
 * @swagger
 * /api/v1/invoices/{id}/status:
 *   patch:
 *     summary: Actualizar estado de factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [emitida, pagada, cancelada]
 *                 description: Nuevo estado de la factura
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch(
  '/:id/status',
  [body('status').isIn(['emitida', 'pagada', 'cancelada']).withMessage('Estado no válido')],
  updateInvoiceStatus
);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   delete:
 *     summary: Eliminar factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura eliminada
 *       400:
 *         description: Solo se pueden eliminar facturas canceladas
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteInvoice);

/**
 * @swagger
 * /api/v1/invoices/report:
 *   get:
 *     summary: Generar reporte de facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [emitida, pagada, cancelada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Reporte generado
 *       500:
 *         description: Error del servidor
 */
router.get('/report', generateInvoiceReport);

export default router;