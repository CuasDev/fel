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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Customers = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
  });
  
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Estados para el diálogo de formulario
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    taxId: '',
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Estado para el diálogo de confirmación de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  
  // Cargar clientes
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page + 1, // API espera páginas desde 1
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (activeFilter !== '') params.active = activeFilter === 'true';
      
      const res = await axios.get('/customers', { params });
      
        setCustomers(res.data.customers);
        setPagination({
          ...pagination,
          total: res.data.pagination.total,
        });
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar la lista de clientes. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, searchTerm, activeFilter]);
  
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
  const handleOpenForm = (customer = null) => {
    if (customer) {
      setFormData({
        taxId: customer.taxId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          postalCode: customer.address?.postalCode || '',
          country: customer.address?.country || '',
        },
        active: customer.active,
      });
      setIsEditing(true);
      setSelectedCustomerId(customer._id);
    } else {
      setFormData({
        taxId: '',
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        active: true,
      });
      setIsEditing(false);
      setSelectedCustomerId(null);
    }
    setFormErrors({});
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
  };
  
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name.includes('.')) {
      // Manejar campos anidados (address)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'active' ? checked : value,
      });
    }
    
    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.taxId) {
      errors.taxId = 'La identificación fiscal es obligatoria';
    }
    
    if (!formData.name) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      let res;
      if (isEditing) {
        res = await axios.put(`/customers/${selectedCustomerId}`, formData);
      } else {
        res = await axios.post('/customers', formData);
      }
      
        handleCloseForm();
        fetchCustomers();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setFormErrors({
        ...formErrors,
        general: error.response?.data?.errors?.[0]?.msg || 'Error al guardar el cliente',
      });
      setError(error.response?.data?.errors?.[0]?.msg || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejadores de eliminación
  const handleOpenDeleteDialog = (customer) => {
    setCustomerToDelete(customer);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCustomerToDelete(null);
  };
  
  const handleDeleteCustomer = async () => {
    try {
      setLoading(true);
      
      const res = await axios.delete(`/customers/${customerToDelete._id}`);
      
        handleCloseDeleteDialog();
        fetchCustomers();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      setError('Error al eliminar el cliente. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Clientes
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
            <IconButton onClick={() => fetchCustomers()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Cliente
          </Button>
        </Box>
      </Paper>
      
      {/* Tabla de clientes */}
      <Paper sx={{ width: '100%', overflow: 'auto' }}>
        <TableContainer sx={{ maxHeight: 440, maxWidth: isMobile ? '100vw' : 'auto' }}>
          <Table stickyHeader aria-label="sticky table" sx={{ minWidth: isMobile ? 800 : 'auto' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Nombre</TableCell>
                {!isMobile && (
                  <>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Tax ID</TableCell>
                    <TableCell>Email</TableCell>
                  </>
                )}
                <TableCell>Teléfono</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow hover key={customer._id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.name}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.taxId}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {customer.email}
                      </TableCell>
                    </>
                  )}
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={customer.active ? 'Activo' : 'Inactivo'}
                      color={customer.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenForm(customer)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(customer)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <DialogTitle>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction={isMobile ? 'column' : 'row'}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax ID"
                name="taxId"
                value={formData.taxId}
                onChange={handleFormChange}
                error={!!formErrors.taxId}
                helperText={formErrors.taxId}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
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
            ¿Está seguro de que desea eliminar al cliente {customerToDelete?.name}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteCustomer} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;