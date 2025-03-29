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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
  });
  
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Estados para el diálogo de formulario
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Estado para el diálogo de confirmación de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page + 1, // API espera páginas desde 1
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== '') params.active = activeFilter === 'true';
      
      const res = await axios.get('/users', { params });
      
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination({
          ...pagination,
          total: res.data.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar la lista de usuarios. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, searchTerm, roleFilter, activeFilter]);
  
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
  const handleOpenForm = (user = null) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // No mostrar contraseña
        role: user.role,
        active: user.active,
      });
      setIsEditing(true);
      setSelectedUserId(user._id);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true,
      });
      setIsEditing(false);
      setSelectedUserId(null);
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
    
    if (!formData.name) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    
    if (!isEditing && !formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password && formData.password.length < 6 && formData.password.length > 0) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Verificar si el usuario tiene permisos de administrador
    if (user.role !== 'admin') {
      setError('No tienes permisos para crear o editar usuarios. Solo los administradores pueden realizar esta acción.');
      return;
    }
    
    try {
      setLoading(true);
      
      const userData = { ...formData };
      if (isEditing && !userData.password) {
        delete userData.password; // No enviar contraseña vacía en edición
      }
      
      let res;
      if (isEditing) {
        res = await axios.put(`/users/${selectedUserId}`, userData);
      } else {
        res = await axios.post('/users/register', userData);
      }
      
      handleCloseForm();
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setFormErrors({
        ...formErrors,
        general: error.response?.data?.errors?.[0]?.msg || 'Error al guardar los datos del usuario'
      });
      setError(error.response?.data?.errors?.[0]?.msg || 'Error al guardar los datos del usuario. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejadores de eliminación
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };
  
  const handleDeleteUser = async () => {
    // Verificar si el usuario tiene permisos de administrador
    if (user.role !== 'admin') {
      setError('No tienes permisos para eliminar usuarios. Solo los administradores pueden realizar esta acción.');
      handleCloseDeleteDialog();
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await axios.delete(`/users/${userToDelete._id}`);
      
      handleCloseDeleteDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar el usuario. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar chip de rol con color
  const getRoleChip = (role) => {
    let color = 'default';
    switch (role) {
      case 'admin':
        color = 'error';
        break;
      case 'manager':
        color = 'warning';
        break;
      case 'user':
        color = 'primary';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={role.toUpperCase()} color={color} size="small" />;
  };
  
  // Renderizar chip de estado
  const getStatusChip = (active) => {
    return (
      <Chip
        label={active ? 'ACTIVO' : 'INACTIVO'}
        color={active ? 'success' : 'default'}
        size="small"
      />
    );
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
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
            <InputLabel>Rol</InputLabel>
            <Select
              value={roleFilter}
              label="Rol"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="user">User</MenuItem>
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
            <IconButton onClick={() => fetchUsers()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {user && user.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Nuevo Usuario
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Tabla de usuarios */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          {loading && users.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Correo Electrónico</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow hover key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleChip(user.role)}</TableCell>
                      <TableCell>{getStatusChip(user.active)}</TableCell>
                      <TableCell align="right">
                        {user && user.role === 'admin' && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenForm(user)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDeleteDialog(user)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No se encontraron usuarios
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
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre Completo"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleFormChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required={!isEditing}
              fullWidth
              name="password"
              label={isEditing ? 'Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
              type="password"
              id="password"
              autoComplete={isEditing ? 'new-password' : 'current-password'}
              value={formData.password}
              onChange={handleFormChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Rol</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Rol"
                onChange={handleFormChange}
                disabled={loading}
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="user">Usuario</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                labelId="active-label"
                id="active"
                name="active"
                value={formData.active ? 'true' : 'false'}
                label="Estado"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    active: e.target.value === 'true',
                  });
                }}
                disabled={loading}
              >
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEditing ? (
              'Actualizar'
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Está seguro de que desea eliminar al usuario {userToDelete?.name}? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={loading}
            autoFocus
          >
            {loading ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;