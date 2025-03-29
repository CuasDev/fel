import React from 'react';
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
  IconButton,
  Tooltip,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const InvoiceList = ({
  invoices,
  loading,
  pagination,
  handleChangePage,
  handleChangeRowsPerPage,
  handleOpenForm,
  handleOpenDeleteDialog,
  formatCurrency,
  formatDate,
}) => {
  // Obtener chip de estado
  const getStatusChip = (status) => {
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
    
    return (
      <Chip
        label={status.toUpperCase()}
        color={color}
        size="small"
      />
    );
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper sx={{ width: '100%', overflow: 'auto' }}>
      <TableContainer sx={{ maxHeight: 440, maxWidth: isMobile ? '100vw' : 'auto' }}>
        <Table stickyHeader aria-label="sticky table" sx={{ minWidth: isMobile ? 800 : 'auto' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Número</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Fecha</TableCell>
              {!isMobile && (
                <>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Total</TableCell>
                </>
              )}
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow hover key={invoice._id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{invoice.invoiceNumber}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(invoice.issueDate)}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {invoice.customer.name}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    </>
                  )}
                  <TableCell>{getStatusChip(invoice.status)}</TableCell>
                  <TableCell align="right" sx={{ pr: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Imprimir">
                        <IconButton
                          color="primary"
                          onClick={() => window.open(`/invoices/${invoice._id}/pdf`, '_blank')}
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenForm(invoice)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(invoice)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 6} align="center">
                  No se encontraron facturas
                </TableCell>
              </TableRow>
            )}
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
  );
};

export default InvoiceList;