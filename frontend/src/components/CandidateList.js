import React, { useState, useEffect, useCallback } from 'react';
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
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  Divider
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
import { useSnackbar } from 'notistack';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api, { candidatesService } from '../services/api';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(0);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchCandidates = useCallback(async (pageNum = page, search = searchTerm) => {
    setLoading(true);
    try {
      console.log('Buscando candidatos...', { page: pageNum + 1, per_page: perPage, search, sort_by: sortBy, sort_direction: sortDirection });
      
      const response = await candidatesService.list({
        page: pageNum + 1, // API usa paginação baseada em 1
        per_page: perPage,
        search,
        sort_by: sortBy,
        sort_direction: sortDirection
      });
      
      console.log('Resposta da API:', response.data);
      
      // Verifica se a resposta contém dados
      if (response.data && response.data.data) {
        setCandidates(response.data.data);
        setTotalCandidates(response.data.meta?.total || 0);
        setTotalPages(Math.ceil((response.data.meta?.total || 0) / perPage));
      } else {
        console.warn('Resposta da API não contém dados de candidatos:', response.data);
        setCandidates([]);
        setTotalCandidates(0);
        setTotalPages(1);
      }
      
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      enqueueSnackbar('Erro ao carregar candidatos', { variant: 'error' });
      setError('Erro ao carregar candidatos. Por favor, tente novamente.');
      setCandidates([]);
      setTotalCandidates(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchTerm, sortBy, sortDirection, enqueueSnackbar]);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [fetchCandidates]);

  useEffect(() => {
    // Calcula o número total de páginas
    setTotalPages(Math.ceil(totalCandidates / perPage));
  }, [totalCandidates, perPage]);

  // Atualiza a lista quando os filtros mudarem
  useEffect(() => {
    // Reseta para a primeira página quando os filtros mudarem
    if (page !== 0) {
      setPage(0);
    } else {
      fetchCandidates(0);
    }
  }, [searchTerm, sortBy, sortDirection, fetchCandidates]);

  const fetchJobs = async () => {
    try {
      console.log('Buscando vagas...');
      const response = await api.get('/jobs');
      console.log('Vagas recebidas:', response.data);
      
      // Verifica se a resposta contém dados
      if (response.data && response.data.data) {
        setJobs(response.data.data);
      } else {
        console.warn('Resposta da API não contém dados de vagas:', response.data);
        setJobs([]);
      }
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      enqueueSnackbar('Erro ao carregar vagas', { variant: 'error' });
      setJobs([]);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Log para debug
      console.log('Enviando dados do formulário:', formData);
      
      if (selectedCandidate) {
        console.log('Atualizando candidato ID:', selectedCandidate.id);
        await candidatesService.update(selectedCandidate.id, formData);
        enqueueSnackbar('Candidato atualizado com sucesso!', { variant: 'success' });
      } else {
        console.log('Criando novo candidato');
        await candidatesService.create(formData);
        enqueueSnackbar('Candidato adicionado com sucesso!', { variant: 'success' });
      }
      
      handleCloseModal();
      fetchCandidates();
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      
      // Exibe mensagem de erro mais específica se disponível
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || 'Erro ao salvar candidato';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else {
        enqueueSnackbar('Erro ao salvar candidato. Verifique sua conexão.', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este candidato?')) return;

    try {
      console.log("Excluindo candidato:", id);
      await api.post(`/candidates/${id}`, {
        _method: 'DELETE'
      });
      
      console.log("Candidato excluído com sucesso");
      await fetchCandidates();
      enqueueSnackbar('Candidato excluído com sucesso!', { 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Erro ao deletar candidato:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      enqueueSnackbar('Erro ao excluir candidato. Por favor, tente novamente.', { 
        variant: 'error' 
      });
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
    
    return candidateJobs.map(job => {
      // Se job for um objeto com propriedade id e title
      if (typeof job === 'object' && job !== null) {
        if (job.title) return job.title;
        if (job.id) {
          const jobObj = jobs.find(j => j.id === job.id);
          return jobObj ? jobObj.title : '';
        }
      } 
      // Se job for apenas um ID
      else if (typeof job === 'number') {
        const jobObj = jobs.find(j => j.id === job);
        return jobObj ? jobObj.title : '';
      }
      return '';
    }).filter(Boolean);
  };

  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCandidateToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;
    
    setLoading(true);
    try {
      await candidatesService.delete(candidateToDelete.id);
      enqueueSnackbar('Candidato excluído com sucesso!', { variant: 'success' });
      fetchCandidates();
    } catch (error) {
      console.error('Erro ao excluir candidato:', error);
      enqueueSnackbar('Erro ao excluir candidato', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setCandidateToDelete(null);
      setLoading(false);
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidateDetails(candidate);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedCandidateDetails(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortDirectionChange = (e) => {
    setSortDirection(e.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1); // Ajusta para base-0
    fetchCandidates(newPage - 1);
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
              onChange={handleSearchChange}
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
                onChange={handleSortByChange}
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
                onChange={handleSortDirectionChange}
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
                <Grid item xs={12} key={`candidate-${candidate.id}`}>
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
                                key={`job-chip-${candidate.id}-${index}`}
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
                        onClick={() => handleDeleteClick(candidate)}
                      >
                        Excluir
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Vagas</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>{candidate.name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>{getJobTitles(candidate.jobs).join(', ')}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(candidate)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(candidate)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
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
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
          size={isMobile ? "small" : "medium"}
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 1
            }
          }}
        />
      </Box>

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

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o candidato "{candidateToDelete?.name}"? 
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalhes do candidato */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedCandidateDetails && (
          <>
            <DialogTitle>
              Detalhes do Candidato
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedCandidateDetails.name}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedCandidateDetails.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedCandidateDetails.phone}
                    </Typography>
                  </Box>
                  
                  {selectedCandidateDetails.linkedin && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinkedInIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {selectedCandidateDetails.linkedin}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {selectedCandidateDetails.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                      Descrição
                    </Typography>
                    <Typography variant="body2">
                      {selectedCandidateDetails.description}
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Vagas de Interesse
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {selectedCandidateDetails.jobs && selectedCandidateDetails.jobs.length > 0 ? (
                    selectedCandidateDetails.jobs.map(job => (
                      <Chip 
                        key={`detail-job-${job.id}`}
                        label={job.title} 
                        color="primary" 
                        variant="outlined" 
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma vaga selecionada
                    </Typography>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Experiências
                </Typography>
                
                {selectedCandidateDetails.experiences && selectedCandidateDetails.experiences.length > 0 ? (
                  selectedCandidateDetails.experiences.map((exp, index) => (
                    <Box 
                      key={`detail-exp-${index}`}
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="subtitle2">
                        {exp.position} - {exp.company}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        {exp.period}
                      </Typography>
                      {exp.description && (
                        <Typography variant="body2">
                          {exp.description}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma experiência cadastrada
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  handleCloseDetails();
                  handleEdit(selectedCandidateDetails);
                }} 
                color="primary"
                variant="contained"
                startIcon={<EditIcon />}
              >
                Editar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CandidateList;