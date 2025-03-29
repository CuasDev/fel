import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import InvoiceFilters from '../components/invoices/InvoiceFilters';
import InvoiceList from '../components/invoices/InvoiceList';
import InvoiceForm from '../components/invoices/InvoiceForm';
import { formatCurrency, formatDate, calculateItemTotals, calculateInvoiceTotals, generateInvoiceNumber } from '../components/invoices/InvoiceUtils';
import axios from 'axios';

const Invoices = () => {
  // Estado para las facturas y paginación
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
  });

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: '',
  });

  // Estado para el formulario
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    customer: '',
    items: [
      {
        product: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 16,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      },
    ],
    paymentMethod: 'efectivo',
    notes: '',
    subtotal: 0,
    taxAmount: 0,
    total: 0,
  });
  const [formErrors, setFormErrors] = useState({});

  // Estado para clientes y productos
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Estado para diálogo de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    invoice: null,
  });

  // Cargar facturas al montar el componente
  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchProducts();
  }, []);

  // Efecto para aplicar filtros
  useEffect(() => {
    fetchInvoices();
  }, [pagination.page, pagination.limit, statusFilter, dateFilter, searchTerm]);

  // Función para obtener facturas
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let url = `/invoices?page=${pagination.page + 1}&limit=${pagination.limit}`;
      
      if (statusFilter) url += `&status=${statusFilter}`;
      if (dateFilter.from) url += `&fromDate=${dateFilter.from}`;
      if (dateFilter.to) url += `&toDate=${dateFilter.to}`;
      
      const response = await axios.get(url);
      
      // Filtrar por término de búsqueda en el cliente
      let filteredInvoices = response.data?.invoices || [];
      if (searchTerm) {
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setInvoices(filteredInvoices);
      // Verificar si response.data.pagination existe antes de acceder a sus propiedades
      if (response.data.pagination) {
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      } else {
        // Si no hay paginación, establecer el total al número de facturas obtenidas
        setPagination({
          ...pagination,
          total: filteredInvoices.length,
        });
      }
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      showNotification('Error al cargar las facturas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener clientes
  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  // Función para obtener productos
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data.data || []); // Corregido para usar data en lugar de products
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  // Funciones para paginación
  const handleChangePage = (event, newPage) => {
    setPagination({
      ...pagination,
      page: newPage,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({
      ...pagination,
      limit: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  // Funciones para el formulario
  const handleOpenForm = (invoice = null) => {
    if (invoice) {
      // Editar factura existente
      setIsEditing(true);
      
      // Encontrar el cliente seleccionado
      const customer = customers?.find(c => c._id === invoice.customer?._id) || null;
      setSelectedCustomer(customer || null);
      
      // Preparar los items con los cálculos
      const items = invoice.items && invoice.items.length > 0 ? invoice.items.map(item => ({
        product: item.product._id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: 16, // Valor por defecto si no existe
        subtotal: item.subtotal || (item.quantity * item.unitPrice),
        taxAmount: item.taxAmount || ((item.quantity * item.unitPrice) * 0.16),
        total: (item.subtotal || (item.quantity * item.unitPrice)) + 
               (item.taxAmount || ((item.quantity * item.unitPrice) * 0.16)),
      })) : [];
      
      
      setFormData({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        customer: invoice.customer._id,
        items,
        paymentMethod: invoice.paymentMethod || 'efectivo',
        notes: invoice.notes || '',
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
      });
    } else {
      // Nueva factura
      setIsEditing(false);
      setSelectedCustomer(null);
      setFormData({
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        customer: '',
        items: [
          {
            product: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 16,
            subtotal: 0,
            taxAmount: 0,
            total: 0,
          },
        ],
        paymentMethod: 'efectivo',
        notes: '',
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      });
    }
    
    setFormErrors({});
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      customer: '',
      items: [
        {
          product: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 16,
          subtotal: 0,
          taxAmount: 0,
          total: 0,
        },
      ],
      paymentMethod: 'efectivo',
      notes: '',
      subtotal: 0,
      taxAmount: 0,
      total: 0,
    });
    setSelectedCustomer(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCustomerChange = (event, newValue) => {
    setSelectedCustomer(newValue);
    setFormData({
      ...formData,
      customer: newValue ? newValue._id : '',
    });
  };

  const handleProductChange = (index, event, newValue) => {
    if (!newValue) return;
    
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      product: newValue._id,
      description: newValue.name,
      unitPrice: newValue.price || 0,
    };
    
    // Recalcular totales
    const calculatedItem = calculateItemTotals(updatedItems[index]);
    updatedItems[index] = calculatedItem;
    
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(updatedItems);
    
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value,
    };
    
    // Recalcular totales
    const calculatedItem = calculateItemTotals(updatedItems[index]);
    updatedItems[index] = calculatedItem;
    
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(updatedItems);
    
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
    });
  };

  const addItem = () => {
    const newItem = {
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 16,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(updatedItems);
    
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.invoiceNumber) errors.invoiceNumber = 'El número de factura es requerido';
    if (!formData.issueDate) errors.issueDate = 'La fecha de emisión es requerida';
    if (!formData.customer) errors.customer = 'El cliente es requerido';
    
    if (!formData.items?.length) {
      errors.items = 'Debe agregar al menos un artículo';
    }
    
    // Validar items
    const itemErrors = [];
    formData.items.forEach((item, index) => {
      const itemError = {};
      
      if (!item.product) itemError.product = 'El producto es requerido';
      if (!item.quantity || item.quantity <= 0) itemError.quantity = 'La cantidad debe ser mayor a 0';
      if (!item.unitPrice || item.unitPrice < 0) itemError.unitPrice = 'El precio debe ser mayor o igual a 0';
      
      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });
    
    if (itemErrors.length > 0) errors.items = itemErrors;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const invoiceData = {
        ...formData,
        items: formData.items && formData.items.length > 0 ? formData.items.map(item => ({
          product: item.product,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          taxRate: parseFloat(item.taxRate),
        })) : [],
      };
      
      let response;
      if (isEditing) {
        response = await axios.put(`/invoices/${formData._id}`, invoiceData);
        showNotification('Factura actualizada correctamente', 'success');
      } else {
        response = await axios.post('/invoices', invoiceData);
        showNotification('Factura creada correctamente', 'success');
      }
      
      handleCloseForm();
      fetchInvoices();
    } catch (error) {
      console.error('Error al guardar factura:', error);
      showNotification(
        error.response?.data?.message || 'Error al guardar la factura',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Funciones para eliminar factura
  const handleOpenDeleteDialog = (invoice) => {
    setDeleteDialog({
      open: true,
      invoice,
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      invoice: null,
    });
  };

  const handleDeleteInvoice = async () => {
    if (!deleteDialog.invoice) return;
    
    try {
      setLoading(true);
      await axios.delete(`/invoices/${deleteDialog.invoice._id}`);
      showNotification('Factura eliminada correctamente', 'success');
      handleCloseDeleteDialog();
      fetchInvoices();
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      showNotification(
        error.response?.data?.message || 'Error al eliminar la factura',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar notificaciones
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Facturas
        </Typography>
        
        <InvoiceFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          fetchInvoices={fetchInvoices}
          handleOpenForm={handleOpenForm}
        />
        
        <InvoiceList
          invoices={invoices}
          loading={loading}
          pagination={pagination}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleOpenForm={handleOpenForm}
          handleOpenDeleteDialog={handleOpenDeleteDialog}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
        
        <InvoiceForm
          openForm={openForm}
          handleCloseForm={handleCloseForm}
          formData={formData}
          handleFormChange={handleFormChange}
          handleCustomerChange={handleCustomerChange}
          handleProductChange={handleProductChange}
          handleItemChange={handleItemChange}
          addItem={addItem}
          removeItem={removeItem}
          handleSubmitForm={handleSubmitForm}
          isEditing={isEditing}
          loading={loading}
          formErrors={formErrors}
          customers={customers}
          products={products}
          selectedCustomer={selectedCustomer}
        />
        
        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            ¿Está seguro de que desea eliminar la factura {deleteDialog.invoice?.invoiceNumber}?
            Esta acción no se puede deshacer.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
            <Button onClick={handleDeleteInvoice} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Notificaciones */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Invoices;