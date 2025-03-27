import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const InvoiceFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  fetchInvoices,
  handleOpenForm,
}) => {
  return (
    <Box sx={{ p: 2, mb: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
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
            value={statusFilter}
            label="Estado"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="emitida">Emitida</MenuItem>
            <MenuItem value="pagada">Pagada</MenuItem>
            <MenuItem value="vencida">Vencida</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          label="Desde"
          type="date"
          size="small"
          value={dateFilter.from}
          onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
        
        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={dateFilter.to}
          onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
        
        <Tooltip title="Actualizar">
          <IconButton onClick={() => fetchInvoices()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nueva Factura
        </Button>
      </Box>
    </Box>
  );
};

export default InvoiceFilters;