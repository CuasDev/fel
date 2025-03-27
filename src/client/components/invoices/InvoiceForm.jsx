import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import {
  AddCircleOutline as AddItemIcon,
  RemoveCircleOutline as RemoveItemIcon,
} from '@mui/icons-material';

const InvoiceForm = ({
  openForm,
  handleCloseForm,
  formData,
  handleFormChange,
  handleCustomerChange,
  handleProductChange,
  handleItemChange,
  addItem,
  removeItem,
  handleSubmitForm,
  isEditing,
  loading,
  formErrors,
  customers,
  products,
  selectedCustomer,
}) => {
  return (
    <Dialog open={openForm} onClose={handleCloseForm} maxWidth="lg" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Factura' : 'Nueva Factura'}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="invoiceNumber"
                label="Número de Factura"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleFormChange}
                error={!!formErrors.invoiceNumber}
                helperText={formErrors.invoiceNumber}
                disabled={loading || isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="issueDate"
                label="Fecha de Emisión"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleFormChange}
                error={!!formErrors.issueDate}
                helperText={formErrors.issueDate}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                margin="normal"
                fullWidth
                id="dueDate"
                label="Fecha de Vencimiento"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                id="customer"
                options={customers}
                getOptionLabel={(option) => option.name || ''}
                value={selectedCustomer}
                onChange={handleCustomerChange}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    required
                    label="Cliente"
                    error={!!formErrors.customer}
                    helperText={formErrors.customer}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Productos y Servicios
              </Typography>
            </Grid>
            
            {formData.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={products}
                        getOptionLabel={(option) => `${option.code} - ${option.name}` || ''}
                        onChange={(event, newValue) => handleProductChange(index, event, newValue)}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Producto"
                            required
                            error={!!formErrors.items?.[index]?.product}
                            helperText={formErrors.items?.[index]?.product}
                            disabled={loading}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Descripción"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, e)}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        required
                        label="Cantidad"
                        name="quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        error={!!formErrors.items?.[index]?.quantity}
                        helperText={formErrors.items?.[index]?.quantity}
                        disabled={loading}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        required
                        label="Precio Unitario"
                        name="unitPrice"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, e)}
                        error={!!formErrors.items?.[index]?.unitPrice}
                        helperText={formErrors.items?.[index]?.unitPrice}
                        disabled={loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        required
                        label="Tasa de Impuesto"
                        name="taxRate"
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(index, e)}
                        disabled={loading}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Subtotal"
                        value={item.subtotal.toFixed(2)}
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Impuesto"
                        value={item.taxAmount.toFixed(2)}
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Total"
                        value={item.total.toFixed(2)}
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                      <IconButton
                        color="error"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1 || loading}
                      >
                        <RemoveItemIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Button
                startIcon={<AddItemIcon />}
                onClick={addItem}
                disabled={loading}
              >
                Agregar Producto
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  label="Método de Pago"
                  onChange={handleFormChange}
                  error={!!formErrors.paymentMethod}
                  disabled={loading}
                >
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                  <MenuItem value="tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="transferencia">Transferencia</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                margin="normal"
                fullWidth
                label="Subtotal"
                value={formData.subtotal.toFixed(2)}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                margin="normal"
                fullWidth
                label="Impuestos"
                value={formData.taxAmount.toFixed(2)}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                margin="normal"
                fullWidth
                label="Total"
                value={formData.total.toFixed(2)}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="normal"
                fullWidth
                label="Notas"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseForm} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmitForm} variant="contained" disabled={loading}>
          {isEditing ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceForm;