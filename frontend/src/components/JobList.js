import React, { useState, useEffect, useRef } from 'react';
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
  const formRef = useRef(null);

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

  // Função para buscar uma vaga específica pelo ID
  const fetchJobById = async (jobId) => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vaga com ID ${jobId}:`, error);
      enqueueSnackbar('Erro ao carregar dados da vaga', { variant: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      let response;
      
      // Garantir que os dados estejam no formato correto para o backend
      const dataToSend = {
        ...formData,
        // Garantir que o salary seja um número
        salary: typeof formData.salary === 'string' ? 
          parseInt(formData.salary.replace(/[^\d]/g, ''), 10) || 0 : 
          formData.salary || 0,
      };
      
      console.log("Dados a serem enviados:", dataToSend);
      
      if (selectedJob) {
        console.log("Editando vaga existente:", selectedJob.id);
        // Usando POST com _method: 'PUT' para contornar problemas com o método PUT
        response = await api.post(`/jobs/${selectedJob.id}`, {
          ...dataToSend,
          _method: 'PUT'
        });
        console.log("Resposta da edição:", response);
      } else {
        console.log("Criando nova vaga");
        response = await api.post('/jobs', dataToSend);
        console.log("Resposta da criação:", response);
      }

      await fetchJobs();
      handleCloseModal();
      enqueueSnackbar('Vaga salva com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      enqueueSnackbar('Não foi possível salvar a vaga. Por favor, tente novamente mais tarde.', { variant: 'error' });
    }
  };

  const handleDelete = async (ids) => {
    if (!window.confirm('Tem certeza que deseja excluir estas vagas?')) return;

    try {
      // Modificando para usar o formato correto para requisições DELETE
      if (ids.length === 1) {
        // Para exclusão única
        await api.post(`/jobs/${ids[0]}`, {
          _method: 'DELETE'
        });
      } else {
        // Para exclusão em massa
        await api.post('/jobs', {
          _method: 'DELETE',
          ids: ids.join(',')
        });
      }
      enqueueSnackbar('Vagas excluídas com sucesso.', { variant: 'success' });
      setSelectedJobs([]);
      fetchJobs();
    } catch (error) {
      console.error('Erro ao deletar vagas:', error);
      enqueueSnackbar('Não foi possível excluir as vagas. Por favor, tente novamente mais tarde.', { variant: 'error' });
    }
  };

  const handleEdit = async (job) => {
    console.log("Iniciando edição da vaga:", job.id);
    
    try {
      // Buscar dados completos e atualizados da vaga
      const fullJobData = await fetchJobById(job.id);
      
      if (!fullJobData) {
        enqueueSnackbar('Não foi possível carregar os dados da vaga para edição', { variant: 'error' });
        return;
      }
      
      console.log("Dados completos da vaga recebidos:", fullJobData);
      
      // Garantir que os dados da vaga estão completos e formatados corretamente
      const jobToEdit = {
        ...fullJobData,
        // Converter strings JSON para arrays se necessário
        requirements: typeof fullJobData.requirements === 'string' ? 
          JSON.parse(fullJobData.requirements) : fullJobData.requirements || [],
        benefits: typeof fullJobData.benefits === 'string' ? 
          JSON.parse(fullJobData.benefits) : fullJobData.benefits || []
      };
      
      console.log("Dados formatados para edição:", jobToEdit);
      setSelectedJob(jobToEdit);
      setModalOpen(true);
    } catch (error) {
      console.error("Erro ao preparar vaga para edição:", error);
      enqueueSnackbar('Erro ao preparar vaga para edição', { variant: 'error' });
    }
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
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar vagas..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size={isMobile ? "small" : "medium"}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="aberta">Aberta</MenuItem>
              <MenuItem value="fechada">Fechada</MenuItem>
              <MenuItem value="em_andamento">Em Andamento</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
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
      </Grid>
    </Box>
  );

  const renderMobileView = () => (
    <Box sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
      <Grid container spacing={2}>
        {jobs.map((job) => (
          <Grid item xs={12} key={job.id}>
            <Card
              className="fade-in"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <CardContent sx={{ flex: 1, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {job.title}
                  </Typography>
                  <Chip
                    label={job.status === 'aberta' ? 'Aberta' : job.status === 'fechada' ? 'Fechada' : 'Em Andamento'}
                    color={job.status === 'aberta' ? 'success' : job.status === 'fechada' ? 'error' : 'warning'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {job.company}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {job.location}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={job.type === 'full_time' ? 'Tempo Integral' : 
                           job.type === 'part_time' ? 'Meio Período' : 
                           job.type === 'contract' ? 'Contrato' : 
                           job.type === 'temporary' ? 'Temporário' : 'Estágio'}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`R$ ${job.salary.toLocaleString()}`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  {job.description}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDesktopView = () => (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 2, 
          maxWidth: '100%', 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          }
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedJobs.length > 0 && selectedJobs.length < jobs.length}
                  checked={jobs.length > 0 && selectedJobs.length === jobs.length}
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
              <TableCell>Local</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'salary'}
                  direction={sortDirection}
                  onClick={() => handleSort('salary')}
                >
                  Salário
                </TableSortLabel>
              </TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                hover
                key={job.id}
                selected={selectedJobs.includes(job.id)}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => handleSelectJob(job.id)}
                  />
                </TableCell>
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle2">{job.title}</Typography>
                </TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>R$ {job.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={job.type === 'full_time' ? 'Tempo Integral' : 
                             job.type === 'part_time' ? 'Meio Período' : 
                             job.type === 'contract' ? 'Contrato' : 
                             job.type === 'temporary' ? 'Temporário' : 'Estágio'}
                      size="small"
                      variant="outlined"
                    />
                </TableCell>
                <TableCell>
                  <Chip
                    label={job.status === 'aberta' ? 'Aberta' : job.status === 'fechada' ? 'Fechada' : 'Em Andamento'}
                    color={job.status === 'aberta' ? 'success' : job.status === 'fechada' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleEdit(job)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete([job.id])}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <div className="fade-in" style={{ overflow: 'hidden', width: '100%' }}>
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        overflow: 'hidden', 
        width: '100%',
        maxWidth: '100%'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          width: '100%'
        }}>
          <Typography variant="h4" component="h1" sx={{ mb: { xs: 0, sm: 0 } }}>
            Vagas
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              height: 48,
              px: 3,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Nova Vaga
          </Button>
        </Box>

        {renderFilters()}

        {selectedJobs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDelete(selectedJobs)}
            >
              Excluir Selecionados ({selectedJobs.length})
            </Button>
          </Box>
        )}

        {isMobile ? renderMobileView() : renderDesktopView()}

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(e, value) => handleChangePage(e, value - 1)}
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      </Box>

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedJob ? 'Editar Vaga' : 'Nova Vaga'}
        onSubmit={() => {
          console.log("Botão salvar clicado");
          if (formRef.current) {
            console.log("Referência do formulário encontrada, chamando handleSubmit");
            // Simular um evento de submit
            formRef.current.dispatchEvent(
              new Event('submit', { bubbles: true, cancelable: true })
            );
          } else {
            console.error("Referência do formulário não encontrada");
          }
        }}
        submitLabel="Salvar"
        hideActions={false}
      >
        <JobForm
          onSubmit={handleSubmit}
          initialData={selectedJob}
          onCancel={handleCloseModal}
          formRef={formRef}
        />
      </FormModal>
    </div>
  );
};

export default JobList; 