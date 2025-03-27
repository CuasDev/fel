import express from 'express';
import { body } from 'express-validator';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taxId
 *               - name
 *               - email
 *             properties:
 *               taxId:
 *                 type: string
 *                 description: Identificación fiscal (RFC, NIT, etc.)
 *               name:
 *                 type: string
 *                 description: Nombre o razón social
 *               email:
 *                 type: string
 *                 description: Correo electrónico
 *               phone:
 *                 type: string
 *                 description: Teléfono
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: Calle
 *                   city:
 *                     type: string
 *                     description: Ciudad
 *                   state:
 *                     type: string
 *                     description: Estado/Provincia
 *                   postalCode:
 *                     type: string
 *                     description: Código postal
 *                   country:
 *                     type: string
 *                     description: País
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/',
  [
    body('taxId').notEmpty().withMessage('La identificación fiscal es obligatoria'),
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
    body('phone').optional(),
    body('address').optional(),
    body('address.street').optional(),
    body('address.city').optional(),
    body('address.state').optional(),
    body('address.postalCode').optional(),
    body('address.country').optional(),
  ],
  createCustomer
);

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
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
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, identificación fiscal o correo electrónico
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
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
router.get('/', getCustomers);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getCustomerById);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre o razón social
 *               email:
 *                 type: string
 *                 description: Correo electrónico
 *               phone:
 *                 type: string
 *                 description: Teléfono
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: Calle
 *                   city:
 *                     type: string
 *                     description: Ciudad
 *                   state:
 *                     type: string
 *                     description: Estado/Provincia
 *                   postalCode:
 *                     type: string
 *                     description: Código postal
 *                   country:
 *                     type: string
 *                     description: País
 *               active:
 *                 type: boolean
 *                 description: Estado del cliente
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
    body('phone').optional(),
    body('address').optional(),
    body('address.street').optional(),
    body('address.city').optional(),
    body('address.state').optional(),
    body('address.postalCode').optional(),
    body('address.country').optional(),
    body('active').optional().isBoolean().withMessage('El estado debe ser un valor booleano'),
  ],
  updateCustomer
);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteCustomer);

export default router;