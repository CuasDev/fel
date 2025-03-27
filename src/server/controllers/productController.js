import { validationResult } from 'express-validator';
import Product from '../models/Product.js';

/**
 * @desc    Crear un nuevo producto
 * @route   POST /api/v1/products
 * @access  Privado
 */
export const createProduct = async (req, res) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si ya existe un producto con el mismo código
    const existingProduct = await Product.findOne({ code: req.body.code });
    if (existingProduct) {
      return res.status(400).json({
        message: `Ya existe un producto con el código ${req.body.code}`,
      });
    }

    // Crear el producto
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener todos los productos con filtros y paginación
 * @route   GET /api/v1/products
 * @access  Privado
 */
export const getProducts = async (req, res) => {
  try {
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Construir query con filtros
    const query = {};

    // Filtrar por estado activo/inactivo
    if (req.query.active !== undefined) {
      query.active = req.query.active === 'true';
    }

    // Filtrar por categoría
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Búsqueda por nombre o código
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Ejecutar consulta con paginación
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Contar total de documentos para la paginación
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: products,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener un producto por ID
 * @route   GET /api/v1/products/:id
 * @access  Privado
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar un producto
 * @route   PUT /api/v1/products/:id
 * @access  Privado
 */
export const updateProduct = async (req, res) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Buscar y actualizar el producto
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar un producto
 * @route   DELETE /api/v1/products/:id
 * @access  Privado
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto',
      error: error.message,
    });
  }
};