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
  Link,
  Stack,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import DownloadIcon from '@mui/icons-material/Download';
import WorkIcon from '@mui/icons-material/Work';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FormModal from './FormModal';
import CandidateForm from './CandidateForm';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [perPage, setPerPage] = useState(20);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'info' });
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [searchTerm, sortBy, sortDirection, perPage, page]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs', {
        params: { per_page: 100 }
      });
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      setJobs([]);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/candidates', {
        params: {
          search: searchTerm,
          sort_by: sortBy,
          sort_direction: sortDirection,
          per_page: perPage,
          page: page
        }
      });

      if (!response.data) {
        throw new Error('Resposta inválida da API');
      }

      setCandidates(response.data.data || []);
      setTotalCandidates(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / (response.data.per_page || perPage)));
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      setError('Erro ao carregar os candidatos. Por favor, tente novamente.');
      setCandidates([]);
      setTotalCandidates(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = selectedCandidate
        ? `http://localhost:8000/api/candidates/${selectedCandidate.id}`
        : 'http://localhost:8000/api/candidates';

      const method = selectedCandidate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (!response.ok) throw new Error('Erro ao salvar candidato');

      await fetchCandidates();
      handleCloseModal();
      enqueueSnackbar(`Candidato ${selectedCandidate ? 'atualizado' : 'cadastrado'} com sucesso!`, { 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este candidato?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/candidates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchCandidates();
      enqueueSnackbar('Candidato excluído com sucesso!', { 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Erro ao deletar candidato:', error);
      setError('Erro ao deletar o candidato. Por favor, tente novamente.');
    }
  };

  const handleEdit = (candidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCandidate(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCandidate(null);
  };

  const getJobTitles = (candidateJobs) => {
    if (!candidateJobs || !Array.isArray(candidateJobs)) return [];
    return candidateJobs.map(jobId => {
      const job = jobs.find(j => j.id === jobId);
      return job ? job.title : '';
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3 },
        backgroundColor: 'background.default',
        minHeight: '100vh'
      }}
      className="fade-in"
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              mb: 1
            }}
          >
            Lista de Candidatos
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
          >
            Total: {totalCandidates} candidatos
          </Typography>
        </Box>

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
          Novo Candidato
        </Button>
      </Box>

      {/* Filters */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'background.paper',
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="email">E-mail</MenuItem>
                <MenuItem value="created_at">Data de Cadastro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Direção</InputLabel>
              <Select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                label="Direção"
              >
                <MenuItem value="asc">Crescente</MenuItem>
                <MenuItem value="desc">Decrescente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}

      {/* Content */}
      {candidates.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            Nenhum candidato encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente ajustar os filtros ou adicione um novo candidato
          </Typography>
        </Paper>
      ) : (
        <>
          {isMobile ? (
            <Grid container spacing={2}>
              {candidates.map((candidate) => (
                <Grid item xs={12} key={candidate.id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {candidate.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {candidate.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {candidate.phone}
                      </Typography>
                      
                      {candidate.jobs && candidate.jobs.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Vagas de Interesse:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {getJobTitles(candidate.jobs).map((title, index) => (
                              <Chip
                                key={index}
                                label={title}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(candidate)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(candidate.id)}
                      >
                        Excluir
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer 
              component={Paper}
              sx={{ 
                borderRadius: 2,
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Currículo</TableCell>
                    <TableCell>Vagas de Interesse</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow
                      key={candidate.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle2">
                          {candidate.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>
                        {candidate.resume_path && (
                          <Link
                            href={`http://localhost:8000/storage/${candidate.resume_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                            Baixar CV
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {getJobTitles(candidate.jobs).map((title, index) => (
                            <Chip
                              key={index}
                              label={title}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(candidate)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(candidate.id)}
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
          )}

          {/* Pagination */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 1
                }
              }}
            />
          </Box>
        </>
      )}

      {/* Modal */}
      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedCandidate ? 'Editar Candidato' : 'Novo Candidato'}
      >
        <CandidateForm
          initialData={selectedCandidate}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          availableJobs={jobs}
        />
      </FormModal>
    </Box>
  );
};

export default CandidateList; 