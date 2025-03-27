import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PeopleOutline as PeopleIcon,
  PersonOutline as PersonIcon,
  Inventory2Outlined as InventoryIcon,
  ReceiptOutlined as ReceiptIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    customers: 0,
    products: 0,
    invoices: 0,
  });
  
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // En un escenario real, estas serían llamadas a la API para obtener datos del dashboard
        // Por ahora, usaremos datos de ejemplo
        
        // Simulación de carga de datos
        setTimeout(() => {
          // Datos de ejemplo
          setStats({
            users: 15,
            customers: 48,
            products: 124,
            invoices: 256,
          });
          
          setRecentInvoices([
            { id: 'INV-001', customer: 'Empresa ABC', total: 1250.00, date: '2023-06-15', status: 'pagada' },
            { id: 'INV-002', customer: 'Distribuidora XYZ', total: 3450.75, date: '2023-06-14', status: 'emitida' },
            { id: 'INV-003', customer: 'Servicios Técnicos', total: 850.50, date: '2023-06-12', status: 'pagada' },
            { id: 'INV-004', customer: 'Consultora Legal', total: 2100.00, date: '2023-06-10', status: 'pagada' },
          ]);
          
          setTopCustomers([
            { name: 'Empresa ABC', invoices: 12, total: 15600.00 },
            { name: 'Distribuidora XYZ', invoices: 8, total: 12450.75 },
            { name: 'Servicios Técnicos', invoices: 6, total: 8200.50 },
          ]);
          
          setTopProducts([
            { name: 'Servicio de Consultoría', quantity: 45, total: 22500.00 },
            { name: 'Producto Premium', quantity: 38, total: 19000.00 },
            { name: 'Licencia Software', quantity: 30, total: 15000.00 },
          ]);
          
          setLoading(false);
        }, 1000); // Simular tiempo de carga
        
        // En un escenario real, haríamos llamadas a la API:
        // const statsRes = await axios.get('/api/v1/dashboard/stats');
        // const invoicesRes = await axios.get('/api/v1/dashboard/recent-invoices');
        // etc.
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos del dashboard. Inténtelo de nuevo.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.users}</Typography>
            <Typography variant="subtitle1">Usuarios</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
          >
            <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.customers}</Typography>
            <Typography variant="subtitle1">Clientes</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
            }}
          >
            <InventoryIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.products}</Typography>
            <Typography variant="subtitle1">Productos</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'info.contrastText',
            }}
          >
            <ReceiptIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.invoices}</Typography>
            <Typography variant="subtitle1">Facturas</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Sección de datos detallados */}
      <Grid container spacing={3}>
        {/* Facturas recientes */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader title="Facturas Recientes" />
            <Divider />
            <CardContent>
              {recentInvoices.length > 0 ? (
                <List>
                  {recentInvoices.map((invoice) => (
                    <ListItem key={invoice.id} divider>
                      <ListItemText
                        primary={`${invoice.id} - ${invoice.customer}`}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(invoice.total)} | {invoice.date} | 
                            <span style={{ 
                              color: invoice.status === 'pagada' ? 'green' : 
                                     invoice.status === 'emitida' ? 'orange' : 'red'
                            }}>
                              {invoice.status.toUpperCase()}
                            </span>
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hay facturas recientes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Clientes principales */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader title="Clientes Principales" />
            <Divider />
            <CardContent>
              {topCustomers.length > 0 ? (
                <List>
                  {topCustomers.map((customer, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={customer.name}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {customer.invoices} facturas | {formatCurrency(customer.total)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hay clientes principales
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Productos principales */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader title="Productos Principales" />
            <Divider />
            <CardContent>
              {topProducts.length > 0 ? (
                <List>
                  {topProducts.map((product, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={product.name}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {product.quantity} vendidos | {formatCurrency(product.total)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hay productos principales
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;