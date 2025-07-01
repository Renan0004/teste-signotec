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
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FormModal from './FormModal';
import JobForm from './JobForm';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  const [totalJobs, setTotalJobs] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = 10;

  useEffect(() => {
    fetchJobs();
  }, [page, searchTerm, filterStatus, filterType, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/jobs?page=${page}&search=${searchTerm}&status=${filterStatus}&type=${filterType}&sort=${sortBy}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setJobs(data.data || []);
      setTotalJobs(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      setError('Erro ao carregar as vagas. Por favor, tente novamente.');
      setJobs([]);
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
      setFeedback({
        open: true,
        message: `Vaga ${selectedJob ? 'atualizada' : 'criada'} com sucesso!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta vaga?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchJobs();
      setFeedback({
        open: true,
        message: 'Vaga excluída com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      setError('Erro ao deletar a vaga. Por favor, tente novamente.');
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

  const handleCloseFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderFilters = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar vagas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="active">Ativas</MenuItem>
            <MenuItem value="inactive">Inativas</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Tipo"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="CLT">CLT</MenuItem>
            <MenuItem value="PJ">PJ</MenuItem>
            <MenuItem value="FREELANCER">Freelancer</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl fullWidth>
          <InputLabel>Ordenar</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Ordenar"
          >
            <MenuItem value="newest">Mais recentes</MenuItem>
            <MenuItem value="oldest">Mais antigas</MenuItem>
            <MenuItem value="title">Título</MenuItem>
            <MenuItem value="company">Empresa</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderMobileView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {job.title}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {job.company} - {job.location}
            </Typography>
            <Typography variant="body2" paragraph>
              {job.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip 
                label={job.contract_type} 
                color="primary" 
                size="small" 
              />
              <Chip 
                label={job.is_active ? 'Ativa' : 'Inativa'} 
                color={job.is_active ? 'success' : 'error'} 
                size="small" 
              />
            </Box>
          </CardContent>
          <CardActions>
            <Button
              startIcon={<EditIcon />}
              onClick={() => handleEdit(job)}
              size="small"
            >
              Editar
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => handleDelete(job.id)}
              size="small"
            >
              Excluir
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Título</TableCell>
            <TableCell>Empresa</TableCell>
            <TableCell>Localização</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.title}</TableCell>
              <TableCell>{job.company}</TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>
                <Tooltip title={job.description}>
                  <Typography noWrap sx={{ maxWidth: 200 }}>
                    {job.description}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip 
                  label={job.contract_type} 
                  color="primary" 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={job.is_active ? 'Ativa' : 'Inativa'} 
                  color={job.is_active ? 'success' : 'error'} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(job)}
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => handleDelete(job.id)}
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box>
          <Typography variant="h5" component="h2">
            Lista de Vagas
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Total: {totalJobs} {totalJobs === 1 ? 'vaga' : 'vagas'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Nova Vaga
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderFilters()}

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(totalJobs / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedJob ? 'Editar Vaga' : 'Nova Vaga'}
      >
        <JobForm
          onSubmit={handleSubmit}
          initialData={selectedJob}
          onClose={handleCloseModal}
        />
      </FormModal>

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        message={feedback.message}
      />
    </Box>
  );
};

export default JobList; 