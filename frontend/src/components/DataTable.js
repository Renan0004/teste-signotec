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
  ListItemText,
  useMediaQuery,
  useTheme,
  Grid
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Renderizar cards para visualização mobile
  const renderMobileCards = () => {
    return data.map((row) => {
      const isItemSelected = isSelected(row.id);
      
      return (
        <Card 
          key={row.id} 
          sx={{ 
            mb: 2, 
            position: 'relative',
            bgcolor: isItemSelected ? alpha(theme.palette.primary.main, 0.1) : 'inherit'
          }}
        >
          {selectable && (
            <Checkbox
              checked={isItemSelected}
              onChange={(event) => handleClick(event, row.id)}
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                p: 1 
              }}
            />
          )}
          <CardContent sx={{ pt: 2, pb: 2 }}>
            {columns.map((column) => {
              // Não mostrar colunas de ações no corpo do card
              if (column.field === 'actions') return null;
              
              // Renderizar conteúdo da célula
              let cellContent = row[column.field];
              if (column.renderCell) {
                cellContent = column.renderCell(row);
              }
              
              return (
                <Box key={column.field} sx={{ mb: 1.5, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                    {column.headerName}:
                  </Typography>
                  <Box>{cellContent}</Box>
                </Box>
              );
            })}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {onEdit && (
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={() => onEdit(row)}
                  aria-label="editar"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => onDelete(row)}
                  aria-label="excluir"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              {actions.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(event) => handleActionMenuOpen(event, row)}
                  aria-label="mais ações"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    });
  };

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
              sx={{ minWidth: { xs: '100%', sm: 200 }, mb: { xs: 1, sm: 0 } }}
            />
            
            <Tooltip title="Filtrar lista">
              <Button 
                variant={showFilters ? "contained" : "outlined"} 
                color="primary" 
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterListIcon />}
                size="small"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
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
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                Excluir ({selected.length})
              </Button>
            )}
          </Box>
        </StyledToolbar>
        
        {/* Filtros */}
        {showFilters && filterFields.length > 0 && (
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Grid container spacing={2}>
              {filterFields.map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field.name}>
                  <TextField
                    name={field.name}
                    label={field.label}
                    size="small"
                    fullWidth
                    value={filters[field.name] || ''}
                    onChange={handleFilterChange}
                    type={field.type || 'text'}
                    select={field.options ? true : false}
                  >
                    {field.options && field.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="small"
                    onClick={() => {
                      setFilters({});
                      onFilter && onFilter({});
                    }}
                  >
                    Limpar
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={applyFilters}
                  >
                    Aplicar Filtros
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Visualização para dispositivos móveis */}
        {isMobile ? (
          <Box sx={{ p: 2 }}>
            {renderMobileCards()}
          </Box>
        ) : (
          /* Visualização para desktop - tabela tradicional */
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  {selectable && (
                    <StyledTableHeadCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < data.length}
                        checked={data.length > 0 && selected.length === data.length}
                        onChange={handleSelectAllClick}
                      />
                    </StyledTableHeadCell>
                  )}
                  {columns.map((column) => (
                    <StyledTableHeadCell
                      key={column.field}
                      sortDirection={orderBy === column.field ? order : false}
                      align={column.align || 'left'}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => {
                  const isItemSelected = isSelected(row.id);
                  
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
                          <Checkbox checked={isItemSelected} />
                        </StyledTableCell>
                      )}
                      {columns.map((column) => {
                        return (
                          <StyledTableCell key={column.field} align={column.align || 'left'}>
                            {column.renderCell ? column.renderCell(row) : row[column.field]}
                          </StyledTableCell>
                        );
                      })}
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={totalItems}
          rowsPerPage={perPage}
          page={page - 1}
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          labelRowsPerPage={isMobile ? "Linhas:" : "Linhas por página:"}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </CardContent>
      
      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionMenuClose}
      >
        {actions.map((action) => (
          <MenuItem 
            key={action.name} 
            onClick={() => {
              action.handler(actionMenuRow);
              handleActionMenuClose();
            }}
          >
            {action.icon && (
              <ListItemIcon>
                {action.icon}
              </ListItemIcon>
            )}
            <ListItemText primary={action.name} />
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
};

export default DataTable; 