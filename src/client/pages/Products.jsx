import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]); // Inicializar como array vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
  });
  
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Estados para el diálogo de formulario
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    taxRate: '',
    unit: '',
    stock: '',
    category: '',
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Estado para el diálogo de confirmación de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page + 1, // API espera páginas desde 1
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (activeFilter !== '') params.active = activeFilter === 'true';
      
      const res = await axios.get('/products', { params });
      
      if (res.data.success) {
        setProducts(res.data.data || []); // Usar data directamente en lugar de data.products
        setPagination({
          ...pagination,
          total: res.data.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar la lista de productos. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, searchTerm, categoryFilter, activeFilter]);
  
  // Manejadores de paginación
  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  const handleChangeRowsPerPage = (event) => {
    setPagination({
      ...pagination,
      limit: parseInt(event.target.value, 10),
      page: 0,
    });
  };
  
  // Manejadores de formulario
  const handleOpenForm = (product = null) => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description || '',
        price: product.price,
        taxRate: product.taxRate,
        unit: product.unit,
        stock: product.stock || '',
        category: product.category || '',
        active: product.active,
      });
      setIsEditing(true);
      setSelectedProductId(product._id);
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        price: '',
        taxRate: '',
        unit: '',
        stock: '',
        category: '',
        active: true,
      });
      setIsEditing(false);
      setSelectedProductId(null);
    }
    setFormErrors({});
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
  };
  
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'active' ? checked : value,
    });
    
    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.code) {
      errors.code = 'El código es obligatorio';
    }
    
    if (!formData.name) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.price) {
      errors.price = 'El precio es obligatorio';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errors.price = 'El precio debe ser un número positivo';
    }
    
    if (!formData.taxRate) {
      errors.taxRate = 'La tasa de impuesto es obligatoria';
    } else if (isNaN(formData.taxRate) || parseFloat(formData.taxRate) < 0) {
      errors.taxRate = 'La tasa de impuesto debe ser un número positivo';
    }
    
    if (!formData.unit) {
      errors.unit = 'La unidad de medida es obligatoria';
    }
    
    if (formData.stock && (isNaN(formData.stock) || parseInt(formData.stock) < 0)) {
      errors.stock = 'El stock debe ser un número positivo';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Convertir valores numéricos
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        taxRate: parseFloat(formData.taxRate),
        stock: formData.stock ? parseInt(formData.stock) : undefined,
      };
      
      let res;
      if (isEditing) {
        res = await axios.put(`/products/${selectedProductId}`, productData);
      } else {
        res = await axios.post('/products', productData);
      }
      
      if (res.data.success) {
        handleCloseForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError('Error al guardar los datos del producto. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejadores de eliminación
  const handleOpenDeleteDialog = (product) => {
    setProductToDelete(product);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setProductToDelete(null);
  };
  
  const handleDeleteProduct = async () => {
    try {
      setLoading(true);
      
      const res = await axios.delete(`/products/${productToDelete._id}`);
      
      if (res.data.success) {
        handleCloseDeleteDialog();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setError('Error al eliminar el producto. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Productos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Barra de herramientas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoryFilter}
              label="Categoría"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Servicios">Servicios</MenuItem>
              <MenuItem value="Productos">Productos</MenuItem>
              <MenuItem value="Software">Software</MenuItem>
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="Otros">Otros</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={activeFilter}
              label="Estado"
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Activo</MenuItem>
              <MenuItem value="false">Inactivo</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Actualizar">
            <IconButton onClick={() => fetchProducts()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Paper>
      
      {/* Tabla de productos */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          {loading && (products?.length === 0) ? ( // Verificación reforzada
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Impuesto</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.taxRate}%</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.stock || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.active ? 'ACTIVO' : 'INACTIVO'}
                          color={product.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenForm(product)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(product)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>
      
      {/* Diálogo de formulario */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="code"
                  label="Código"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  error={!!formErrors.code}
                  helperText={formErrors.code}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="description"
                  label="Descripción"
                  name="description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={handleFormChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="price"
                  label="Precio"
                  name="price"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={formData.price}
                  onChange={handleFormChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="taxRate"
                  label="Tasa de Impuesto"
                  name="taxRate"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  value={formData.taxRate}
                  onChange={handleFormChange}
                  error={!!formErrors.taxRate}
                  helperText={formErrors.taxRate}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="unit"
                  label="Unidad de Medida"
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  error={!!formErrors.unit}
                  helperText={formErrors.unit}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="stock"
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleFormChange}
                  error={!!formErrors.stock}
                  helperText={formErrors.stock}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="category-label">Categoría</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formData.category}
                    label="Categoría"
                    onChange={handleFormChange}
                    disabled={loading}
                  >
                    <MenuItem value="">Ninguna</MenuItem>
                    <MenuItem value="Servicios">Servicios</MenuItem>
                    <MenuItem value="Productos">Productos</MenuItem>
                    <MenuItem value="Software">Software</MenuItem>
                    <MenuItem value="Hardware">Hardware</MenuItem>
                    <MenuItem value="Otros">Otros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitForm} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar el producto {productToDelete?.name}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteProduct} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;