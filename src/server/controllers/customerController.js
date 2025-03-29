import Customer from '../models/Customer.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Crear un nuevo cliente
 * @route   POST /api/v1/customers
 * @access  Privado
 */
export const createCustomer = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taxId, name, email, phone, address } = req.body;

    // Verificar si el cliente ya existe por identificación fiscal o correo
    const customerExists = await Customer.findOne({
      $or: [{ taxId }, { email }],
    });

    if (customerExists) {
      return res.status(400).json({
        errors: [{
          msg: customerExists.taxId === taxId
            ? 'La identificación fiscal ya está registrada'
            : 'El correo electrónico ya está registrado'
        }]
      });
    }

    // Crear nuevo cliente
    const customer = await Customer.create({
      taxId,
      name,
      email,
      phone,
      address,
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear cliente', error: error.message });
  }
};

/**
 * @desc    Obtener todos los clientes
 * @route   GET /api/v1/customers
 * @access  Privado
 */
export const getCustomers = async (req, res) => {
  try {
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Opciones de filtrado
    const filter = {};
    if (req.query.active !== undefined) {
      filter.active = req.query.active === 'true';
    }

    // Búsqueda por texto
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { taxId: searchRegex },
        { email: searchRegex },
      ];
    }

    // Contar total de documentos para paginación
    const total = await Customer.countDocuments(filter);

    // Obtener clientes con paginación y filtros
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
};

/**
 * @desc    Obtener un cliente por ID
 * @route   GET /api/v1/customers/:id
 * @access  Privado
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ message: 'Error al obtener cliente', error: error.message });
  }
};

/**
 * @desc    Actualizar un cliente
 * @route   PUT /api/v1/customers/:id
 * @access  Privado
 */
export const updateCustomer = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, address, active } = req.body;

    // Verificar si el cliente existe
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar si el correo ya está en uso por otro cliente
    if (email && email !== customer.email) {
      const emailExists = await Customer.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ errors: [{ msg: 'El correo electrónico ya está registrado' }] });
      }
    }

    // Actualizar cliente
    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone !== undefined ? phone : customer.phone;
    
    if (address) {
      customer.address.street = address.street !== undefined ? address.street : customer.address.street;
      customer.address.city = address.city !== undefined ? address.city : customer.address.city;
      customer.address.state = address.state !== undefined ? address.state : customer.address.state;
      customer.address.postalCode = address.postalCode !== undefined ? address.postalCode : customer.address.postalCode;
      customer.address.country = address.country !== undefined ? address.country : customer.address.country;
    }
    
    if (active !== undefined) {
      customer.active = active;
    }

    const updatedCustomer = await customer.save();
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error al actualizar cliente', error: error.message });
  }
};

/**
 * @desc    Eliminar un cliente
 * @route   DELETE /api/v1/customers/:id
 * @access  Privado (Admin)
 */
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar si el cliente tiene facturas asociadas
    // Nota: Esta verificación se implementaría si tuviéramos un modelo de Factura con referencia a Cliente
    // const invoicesCount = await Invoice.countDocuments({ customer: req.params.id });
    // if (invoicesCount > 0) {
    //   return res.status(400).json({
    //     message: 'No se puede eliminar el cliente porque tiene facturas asociadas',
    //   });
    // }

    await customer.deleteOne();
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error al eliminar cliente', error: error.message });
  }
};