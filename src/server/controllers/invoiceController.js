import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Crear una nueva factura
 * @route   POST /api/v1/invoices
 * @access  Privado
 */
export const createInvoice = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { invoiceNumber, issueDate, customer, items, paymentMethod, dueDate, notes } = req.body;

    // Verificar si el número de factura ya existe
    const invoiceExists = await Invoice.findOne({ invoiceNumber });
    if (invoiceExists) {
      return res.status(400).json({ message: 'El número de factura ya existe' });
    }

    // Verificar si el cliente existe
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar y procesar los items de la factura
    const processedItems = [];
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
      // Verificar si el producto existe
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.product}` });
      }

      // Calcular subtotal del item
      const itemSubtotal = item.quantity * item.unitPrice;
      
      // Calcular impuesto del item
      const itemTaxAmount = (itemSubtotal * item.taxRate) / 100;

      // Agregar item procesado
      processedItems.push({
        product: item.product,
        description: item.description || product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        subtotal: itemSubtotal,
      });

      // Actualizar totales
      subtotal += itemSubtotal;
      taxAmount += itemTaxAmount;
    }

    // Calcular total
    const total = subtotal + taxAmount;

    // Crear nueva factura
    const invoice = await Invoice.create({
      invoiceNumber,
      issueDate: issueDate || new Date(),
      customer,
      items: processedItems,
      subtotal,
      taxAmount,
      total,
      status: 'emitida',
      paymentMethod,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
      notes,
    });

    // Poblar los datos del cliente y productos para la respuesta
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'name taxId email')
      .populate('items.product', 'code name');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ message: 'Error al crear factura', error: error.message });
  }
};

/**
 * @desc    Obtener todas las facturas
 * @route   GET /api/v1/invoices
 * @access  Privado
 */
export const getInvoices = async (req, res) => {
  try {
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Opciones de filtrado
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customer) filter.customer = req.query.customer;
    if (req.query.fromDate && req.query.toDate) {
      filter.issueDate = {
        $gte: new Date(req.query.fromDate),
        $lte: new Date(req.query.toDate),
      };
    }

    // Contar total de documentos para paginación
    const total = await Invoice.countDocuments(filter);

    // Obtener facturas con paginación y filtros
    const invoices = await Invoice.find(filter)
      .populate('customer', 'name taxId email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ message: 'Error al obtener facturas', error: error.message });
  }
};

/**
 * @desc    Obtener una factura por ID
 * @route   GET /api/v1/invoices/:id
 * @access  Privado
 */
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name taxId email phone address')
      .populate('items.product', 'code name price unit');

    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ message: 'Error al obtener factura', error: error.message });
  }
};

/**
 * @desc    Actualizar estado de factura
 * @route   PATCH /api/v1/invoices/:id/status
 * @access  Privado
 */
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Verificar si el estado es válido
    if (!['emitida', 'pagada', 'cancelada'].includes(status)) {
      return res.status(400).json({ message: 'Estado de factura no válido' });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    // Actualizar estado
    invoice.status = status;
    await invoice.save();

    res.status(200).json({ message: 'Estado de factura actualizado', invoice });
  } catch (error) {
    console.error('Error al actualizar estado de factura:', error);
    res.status(500).json({ message: 'Error al actualizar estado de factura', error: error.message });
  }
};

/**
 * @desc    Eliminar factura
 * @route   DELETE /api/v1/invoices/:id
 * @access  Privado (Admin)
 */
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    // Solo permitir eliminar facturas en estado 'cancelada'
    if (invoice.status !== 'cancelada') {
      return res.status(400).json({
        message: 'Solo se pueden eliminar facturas canceladas',
      });
    }

    await invoice.deleteOne();
    res.status(200).json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ message: 'Error al eliminar factura', error: error.message });
  }
};

/**
 * @desc    Generar reporte de facturas
 * @route   GET /api/v1/invoices/report
 * @access  Privado
 */
export const generateInvoiceReport = async (req, res) => {
  try {
    const { fromDate, toDate, status } = req.query;

    // Construir filtro
    const filter = {};
    
    if (fromDate && toDate) {
      filter.issueDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    
    if (status) {
      filter.status = status;
    }

    // Obtener datos para el reporte
    const invoices = await Invoice.find(filter)
      .populate('customer', 'name taxId')
      .select('invoiceNumber issueDate customer subtotal taxAmount total status');

    // Calcular totales
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalTax = invoices.reduce((sum, invoice) => sum + invoice.taxAmount, 0);
    const totalSubtotal = invoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);

    // Agrupar por estado
    const byStatus = {
      emitida: invoices.filter(inv => inv.status === 'emitida').length,
      pagada: invoices.filter(inv => inv.status === 'pagada').length,
      cancelada: invoices.filter(inv => inv.status === 'cancelada').length,
    };

    res.status(200).json({
      invoices,
      summary: {
        count: invoices.length,
        totalAmount,
        totalTax,
        totalSubtotal,
        byStatus,
      },
    });
  } catch (error) {
    console.error('Error al generar reporte de facturas:', error);
    res.status(500).json({ message: 'Error al generar reporte', error: error.message });
  }
};