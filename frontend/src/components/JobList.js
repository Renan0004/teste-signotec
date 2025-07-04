import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Snackbar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  Checkbox,
  Menu,
  Badge,
  Text,
  TablePagination,
  TableSortLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FormModal from './FormModal';
import JobForm from './JobForm';
import api from '../services/api';
import { useSnackbar } from 'notistack';
import LoadingScreen from './LoadingScreen';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchJobs();
  }, [page, rowsPerPage, filterStatus, filterType, sortBy, sortDirection, perPage, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/jobs', {
        params: {
          search: searchTerm,
          status: filterStatus,
          type: filterType,
          sort_by: sortBy,
          sort_direction: sortDirection,
          per_page: perPage,
          page: page + 1
        }
      });
      setJobs(response.data.data || []);
      setTotalRows(parseInt(response.data.total) || 0);
      setTotalPages(Math.ceil(response.data.total / response.data.per_page));
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      setError('Erro ao carregar as vagas. Por favor, tente novamente.');
      setJobs([]);
      enqueueSnackbar('Erro ao carregar vagas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = selectedJob
        ? `http://localhost:8000/api/jobs/${selectedJob.id}`
        : 'http://localhost:8000/api/jobs';

      const method = selectedJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar vaga');

      await fetchJobs();
      handleCloseModal();
      enqueueSnackbar('Vaga salva com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      enqueueSnackbar('Não foi possível salvar a vaga. Por favor, tente novamente mais tarde.', { variant: 'error' });
    }
  };

  const handleDelete = async (ids) => {
    if (!window.confirm('Tem certeza que deseja excluir estas vagas?')) return;

    try {
      await api.delete('/jobs', { params: { ids: ids.join(',') } });
      enqueueSnackbar('Vagas excluídas com sucesso.', { variant: 'success' });
      setSelectedJobs([]);
      fetchJobs();
    } catch (error) {
      console.error('Erro ao deletar vagas:', error);
      enqueueSnackbar('Não foi possível excluir as vagas. Por favor, tente novamente mais tarde.', { variant: 'error' });
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedJob(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'search') {
      setSearchTerm(value);
    } else if (name === 'status') {
      setFilterStatus(value);
    } else if (name === 'type') {
      setFilterType(value);
    }
    setPage(0);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const renderFilters = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar vagas..."
            value={searchTerm}
            onChange={handleFilterChange}
            name="search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              name="status"
              label="Status"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Ativas</MenuItem>
              <MenuItem value="paused">Pausadas</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filterType}
              onChange={handleFilterChange}
              name="type"
              label="Tipo"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="full_time">Tempo Integral</MenuItem>
              <MenuItem value="part_time">Meio Período</MenuItem>
              <MenuItem value="contract">Contrato</MenuItem>
              <MenuItem value="temporary">Temporário</MenuItem>
              <MenuItem value="internship">Estágio</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ height: '100%', fontWeight: 700, borderRadius: 2 }}
          >
            Nova Vaga
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderMobileView = () => (
    <Box sx={{ width: '100%' }}>
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          sx={{ 
            mb: 2,
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {job.title}
                </Typography>
                <Chip
                  label={job.status === 'active' ? 'Ativa' : 'Pausada'}
                  color={job.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {job.company}
              </Typography>
              
              <Typography variant="body2">
                <strong>Localização:</strong> {job.location}
              </Typography>
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Tipo:</strong> {job.type}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Salário:</strong> {job.salary || 'Não informado'}
                </Typography>
              </Box>
              
              {job.requirements && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Requisitos:</strong>
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {job.requirements.map((req, index) => (
                      <Chip key={index} label={req} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleEdit(job)}
            >
              Editar
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDelete([job.id])}
            >
              Excluir
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedJobs.length === jobs.length}
                indeterminate={selectedJobs.length > 0 && selectedJobs.length < jobs.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'title'}
                direction={sortDirection}
                onClick={() => handleSort('title')}
              >
                Título
              </TableSortLabel>
            </TableCell>
            <TableCell>Empresa</TableCell>
            <TableCell>Localização</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'type'}
                direction={sortDirection}
                onClick={() => handleSort('type')}
              >
                Tipo
              </TableSortLabel>
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              selected={selectedJobs.includes(job.id)}
              hover
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                transition: 'background-color 0.2s'
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedJobs.includes(job.id)}
                  onChange={() => handleSelectJob(job.id)}
                />
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">{job.title}</Typography>
                {job.requirements && (
                  <Box sx={{ mt: 1 }}>
                    {job.requirements.slice(0, 2).map((req, index) => (
                      <Chip
                        key={index}
                        label={req}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {job.requirements.length > 2 && (
                      <Chip
                        label={`+${job.requirements.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )}
                  </Box>
                )}
              </TableCell>
              <TableCell>{job.company}</TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>{job.type}</TableCell>
              <TableCell>
                <Chip
                  label={job.status === 'active' ? 'Ativa' : 'Pausada'}
                  color={job.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEdit(job)} sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton size="small" color="error" onClick={() => handleDelete([job.id])}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="body2" color="text.secondary">
          {selectedJobs.length} {selectedJobs.length === 1 ? 'vaga selecionada' : 'vagas selecionadas'}
        </Typography>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Box>
    </TableContainer>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography variant="h5" component="h1">
          Vagas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
        >
          Nova Vaga
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        {renderFilters()}
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="h6" gutterBottom>
            Nenhuma vaga encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente ajustar os filtros ou criar uma nova vaga
          </Typography>
        </Box>
      ) : (
        isMobile ? renderMobileView() : renderDesktopView()
      )}

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedJob ? 'Editar Vaga' : 'Nova Vaga'}
      >
        <JobForm
          initialData={selectedJob}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </FormModal>
    </Box>
  );
};

export default JobList; 