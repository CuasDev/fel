import express from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - price
 *               - taxRate
 *               - unit
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código único del producto
 *               name:
 *                 type: string
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *               price:
 *                 type: number
 *                 description: Precio unitario
 *               taxRate:
 *                 type: number
 *                 description: Tasa de impuesto aplicable (porcentaje)
 *               unit:
 *                 type: string
 *                 description: Unidad de medida
 *               stock:
 *                 type: number
 *                 description: Cantidad en inventario
 *               category:
 *                 type: string
 *                 description: Categoría del producto
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/',
  [
    body('code').notEmpty().withMessage('El código es obligatorio'),
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('price').isNumeric().withMessage('El precio debe ser un número'),
    body('taxRate').isNumeric().withMessage('La tasa de impuesto debe ser un número'),
    body('unit').notEmpty().withMessage('La unidad de medida es obligatoria'),
    body('stock').optional().isNumeric().withMessage('El stock debe ser un número'),
    body('category').optional(),
  ],
  createProduct
);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o código
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
router.get('/', getProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *               price:
 *                 type: number
 *                 description: Precio unitario
 *               taxRate:
 *                 type: number
 *                 description: Tasa de impuesto aplicable (porcentaje)
 *               unit:
 *                 type: string
 *                 description: Unidad de medida
 *               stock:
 *                 type: number
 *                 description: Cantidad en inventario
 *               category:
 *                 type: string
 *                 description: Categoría del producto
 *               active:
 *                 type: boolean
 *                 description: Estado del producto
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put(
  '/:id',
  [
    body('name').optional(),
    body('description').optional(),
    body('price').optional().isNumeric().withMessage('El precio debe ser un número'),
    body('taxRate').optional().isNumeric().withMessage('La tasa de impuesto debe ser un número'),
    body('unit').optional(),
    body('stock').optional().isNumeric().withMessage('El stock debe ser un número'),
    body('category').optional(),
    body('active').optional().isBoolean().withMessage('El estado debe ser un valor booleano'),
  ],
  updateProduct
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteProduct);

export default router;