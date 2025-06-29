import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Toolbar,
  Button,
  Chip,
  Divider,
  styled,
  alpha,
  Card,
  CardHeader,
  CardContent,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';

// Estilização personalizada para a tabela
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  // Esconde a última borda
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'medium',
  padding: theme.spacing(1.5),
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  padding: theme.spacing(1.5),
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const DataTable = ({
  title,
  data,
  columns,
  totalItems,
  page,
  perPage,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onEdit,
  onDelete,
  onFilter,
  onSearch,
  onBulkDelete,
  onRefresh,
  selectable = true,
  loading = false,
  filterFields = [],
  actions = []
}) => {
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    if (!selectable) return;
    
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    onSort && onSort(property, newOrder);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    onSearch && onSearch(searchTerm);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    onFilter && onFilter(filters);
  };

  const handleBulkDelete = () => {
    onBulkDelete && onBulkDelete(selected);
    setSelected([]);
  };

  const handleRefresh = () => {
    onRefresh && onRefresh();
  };

  const handleActionMenuOpen = (event, row) => {
    setActionMenuRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setActionMenuRow(null);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const rowsPerPageOptions = [5, 10, 20, 50, 100];

  return (
    <Card elevation={3}>
      <CardHeader
        title={
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Atualizar dados">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Alterar visualização">
              <IconButton color="primary">
                <ViewListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <StyledToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            
            <Tooltip title="Filtrar lista">
              <Button 
                variant={showFilters ? "contained" : "outlined"} 
                color="primary" 
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterListIcon />}
                size="small"
              >
                Filtros
              </Button>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selected.length > 0 && (
              <Button 
                variant="contained" 
                color="error" 
                size="small" 
                onClick={handleBulkDelete}
                startIcon={<DeleteIcon />}
              >
                Excluir ({selected.length})
              </Button>
            )}
          </Box>
        </StyledToolbar>
        
        {showFilters && (
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, backgroundColor: alpha('#f5f5f5', 0.8) }}>
            {filterFields.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                size="small"
                value={filters[field.name] || ''}
                onChange={handleFilterChange}
                select={field.type === 'select'}
                SelectProps={{ native: true }}
                sx={{ minWidth: 200 }}
              >
                {field.type === 'select' && (
                  <>
                    <option value="">Todos</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </>
                )}
              </TextField>
            ))}
            <Button 
              variant="contained" 
              color="primary" 
              onClick={applyFilters}
              size="small"
            >
              Aplicar Filtros
            </Button>
          </Box>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                {selectable && (
                  <StyledTableHeadCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < data.length}
                      checked={data.length > 0 && selected.length === data.length}
                      onChange={handleSelectAllClick}
                    />
                  </StyledTableHeadCell>
                )}
                {columns.map((column) => (
                  <StyledTableHeadCell
                    key={column.field}
                    align={column.align || 'left'}
                    sortDirection={orderBy === column.field ? order : false}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.field}
                        direction={orderBy === column.field ? order : 'asc'}
                        onClick={() => handleRequestSort(column.field)}
                      >
                        {column.headerName}
                      </TableSortLabel>
                    ) : (
                      column.headerName
                    )}
                  </StyledTableHeadCell>
                ))}
                <StyledTableHeadCell align="right">Ações</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 2 : 1)} align="center">
                    <Typography variant="body1" sx={{ py: 5 }}>Carregando...</Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 2 : 1)} align="center">
                    <Typography variant="body1" sx={{ py: 5 }}>Nenhum registro encontrado</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <StyledTableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      {selectable && (
                        <StyledTableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </StyledTableCell>
                      )}
                      {columns.map((column) => {
                        const value = row[column.field];
                        return (
                          <StyledTableCell 
                            key={column.field} 
                            align={column.align || 'left'}
                          >
                            {column.renderCell ? column.renderCell(row) : value}
                          </StyledTableCell>
                        );
                      })}
                      <StyledTableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {actions.length > 0 ? (
                            <>
                              <IconButton
                                aria-label="more"
                                aria-controls="row-menu"
                                aria-haspopup="true"
                                onClick={(e) => handleActionMenuOpen(e, row)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                id="row-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl) && actionMenuRow?.id === row.id}
                                onClose={handleActionMenuClose}
                              >
                                {actions.map((action) => (
                                  <MenuItem 
                                    key={action.name} 
                                    onClick={() => {
                                      action.handler(actionMenuRow);
                                      handleActionMenuClose();
                                    }}
                                    disabled={action.disabled && action.disabled(actionMenuRow)}
                                  >
                                    <ListItemIcon>
                                      {action.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={action.name} />
                                  </MenuItem>
                                ))}
                                <Divider />
                                <MenuItem 
                                  onClick={() => {
                                    onEdit(actionMenuRow);
                                    handleActionMenuClose();
                                  }}
                                >
                                  <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary="Editar" />
                                </MenuItem>
                                <MenuItem 
                                  onClick={() => {
                                    onDelete(actionMenuRow);
                                    handleActionMenuClose();
                                  }}
                                >
                                  <ListItemIcon>
                                    <DeleteIcon fontSize="small" color="error" />
                                  </ListItemIcon>
                                  <ListItemText primary="Excluir" />
                                </MenuItem>
                              </Menu>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Editar">
                                <IconButton
                                  aria-label="editar"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(row);
                                  }}
                                  color="primary"
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton
                                  aria-label="excluir"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(row);
                                  }}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={totalItems}
          rowsPerPage={perPage}
          page={page - 1}
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </CardContent>
    </Card>
  );
};

export default DataTable; 