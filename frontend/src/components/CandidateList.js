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
  Link
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import DownloadIcon from '@mui/icons-material/Download';
import WorkIcon from '@mui/icons-material/Work';
import FormModal from './FormModal';
import CandidateForm from './CandidateForm';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [jobs, setJobs] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [page, searchTerm, sortBy]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs');
      if (!response.ok) throw new Error('Erro ao buscar vagas');
      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/candidates?page=${page}&search=${searchTerm}&sort=${sortBy}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCandidates(data.data || []);
      setTotalCandidates(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      setError('Erro ao carregar os candidatos. Por favor, tente novamente.');
      setCandidates([]);
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
      setFeedback({
        open: true,
        message: `Candidato ${selectedCandidate ? 'atualizado' : 'cadastrado'} com sucesso!`,
        type: 'success'
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
      setFeedback({
        open: true,
        message: 'Candidato excluído com sucesso!',
        type: 'success'
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

  const handleCloseFeedback = () => {
    setFeedback({ ...feedback, open: false });
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

  const renderFilters = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar candidatos por nome, email ou telefone..."
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
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Ordenar</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Ordenar"
          >
            <MenuItem value="newest">Mais recentes</MenuItem>
            <MenuItem value="oldest">Mais antigos</MenuItem>
            <MenuItem value="name">Nome</MenuItem>
            <MenuItem value="email">Email</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderMobileView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {candidates.map((candidate) => (
        <Card key={candidate.id}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {candidate.name}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {candidate.email}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {candidate.phone}
            </Typography>
            {candidate.curriculum_url && (
              <Button
                variant="outlined"
                size="small"
                href={candidate.curriculum_url}
                target="_blank"
                startIcon={<DownloadIcon />}
                sx={{ mt: 1, mb: 2 }}
              >
                Baixar Currículo
              </Button>
            )}
            {getJobTitles(candidate.jobs).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Vagas de Interesse:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getJobTitles(candidate.jobs).map((title, index) => (
                    <Chip
                      key={index}
                      label={title}
                      size="small"
                      icon={<WorkIcon />}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
          <CardActions>
            <Button
              startIcon={<EditIcon />}
              onClick={() => handleEdit(candidate)}
              size="small"
            >
              Editar
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => handleDelete(candidate.id)}
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
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell>Currículo</TableCell>
            <TableCell>Vagas de Interesse</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>{candidate.name}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.phone}</TableCell>
              <TableCell>
                {candidate.curriculum_url && (
                  <Button
                    variant="outlined"
                    size="small"
                    href={candidate.curriculum_url}
                    target="_blank"
                    startIcon={<DownloadIcon />}
                  >
                    Baixar
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {getJobTitles(candidate.jobs).map((title, index) => (
                    <Chip
                      key={index}
                      label={title}
                      size="small"
                      icon={<WorkIcon />}
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(candidate)}
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => handleDelete(candidate.id)}
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
            Lista de Candidatos
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Total: {totalCandidates} {totalCandidates === 1 ? 'candidato' : 'candidatos'}
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
          Novo Candidato
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
          count={Math.ceil(totalCandidates / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedCandidate ? 'Editar Candidato' : 'Novo Candidato'}
      >
        <CandidateForm
          onSubmit={handleSubmit}
          initialData={selectedCandidate}
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

export default CandidateList; 