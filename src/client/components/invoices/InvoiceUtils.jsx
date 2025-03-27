import React from 'react';

/**
 * Utilidades para el manejo de facturas
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-MX', options);
};

export const calculateItemTotals = (item) => {
  const quantity = parseFloat(item.quantity) || 0;
  const unitPrice = parseFloat(item.unitPrice) || 0;
  const taxRate = parseFloat(item.taxRate) || 0;
  
  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  return {
    ...item,
    subtotal,
    taxAmount,
    total,
  };
};

export const calculateInvoiceTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const total = subtotal + taxAmount;
  
  return { subtotal, taxAmount, total };
};

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

export const getStatusChip = (status) => {
  let color = 'default';
  switch (status) {
    case 'emitida':
      color = 'primary';
      break;
    case 'pagada':
      color = 'success';
      break;
    case 'vencida':
      color = 'error';
      break;
    case 'cancelada':
      color = 'default';
      break;
    default:
      color = 'default';
  }
  
  return { color, label: status.toUpperCase() };
};