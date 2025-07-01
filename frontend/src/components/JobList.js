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
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import FormModal from './FormModal';
import JobForm from './JobForm';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      setError('Erro ao carregar as vagas. Por favor, tente novamente.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const url = selectedJob
      ? `http://localhost:8000/api/jobs/${selectedJob.id}`
      : 'http://localhost:8000/api/jobs';

    const method = selectedJob ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar vaga');
    }

    await fetchJobs();
    setModalOpen(false);
    setSelectedJob(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchJobs();
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lista de Vagas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Nova Vaga
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {jobs.length === 0 ? (
        <Alert severity="info">
          Nenhuma vaga encontrada.
        </Alert>
      ) : (
        isMobile ? renderMobileView() : renderDesktopView()
      )}

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedJob(null);
        }}
        title={selectedJob ? 'Editar Vaga' : 'Nova Vaga'}
      >
        <JobForm
          initialData={selectedJob}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setSelectedJob(null);
          }}
        />
      </FormModal>
    </Box>
  );
};

export default JobList; 