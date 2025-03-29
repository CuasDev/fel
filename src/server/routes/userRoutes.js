import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 description: Correo electrónico (único)
 *               password:
 *                 type: string
 *                 description: Contraseña
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 description: Rol del usuario (solo admin puede asignar)
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     active:
 *                       type: boolean
 *                     token:
 *                       type: string
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional(),
  ],
  registerUser
);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Iniciar sesión y obtener token
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico
 *               password:
 *                 type: string
 *                 description: Contraseña
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     active:
 *                       type: boolean
 *                     token:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Actualizar perfil de usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 description: Correo electrónico (único)
 *               password:
 *                 type: string
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put(
  '/profile',
  protect,
  [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  updateUserProfile
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Obtener todos los usuarios (solo admin)
 *     tags: [Usuarios]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, user]
 *         description: Filtrar por rol
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o correo electrónico
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 description: Correo electrónico (único)
 *               password:
 *                 type: string
 *                 description: Nueva contraseña
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 description: Rol del usuario
 *               active:
 *                 type: boolean
 *                 description: Estado del usuario
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put(
  '/:id',
  [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Rol no válido'),
    body('active').optional().isBoolean().withMessage('El estado debe ser un valor booleano'),
  ],
  updateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: No se puede eliminar el usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteUser);

export default router;