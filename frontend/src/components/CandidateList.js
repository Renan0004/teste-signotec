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
import CandidateForm from './CandidateForm';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/candidates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      setError('Erro ao carregar os candidatos. Por favor, tente novamente.');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const url = selectedCandidate
      ? `http://localhost:8000/api/candidates/${selectedCandidate.id}`
      : 'http://localhost:8000/api/candidates';

    const method = selectedCandidate ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar candidato');
    }

    await fetchCandidates();
    setModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/candidates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchCandidates();
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderMobileView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {candidates.map((candidate) => (
        <Card key={candidate.id}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {candidate.name}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {candidate.email} - {candidate.phone}
            </Typography>
            <Typography variant="body2" paragraph>
              {candidate.resume}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.isArray(candidate.jobs) && candidate.jobs.map((job) => (
                <Chip
                  key={job.id}
                  label={job.title}
                  size="small"
                  color="primary"
                />
              ))}
            </Box>
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
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.isArray(candidate.jobs) && candidate.jobs.map((job) => (
                    <Chip
                      key={job.id}
                      label={job.title}
                      size="small"
                      color="primary"
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lista de Candidatos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Novo Candidato
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {candidates.length === 0 ? (
        <Alert severity="info">
          Nenhum candidato encontrado.
        </Alert>
      ) : (
        isMobile ? renderMobileView() : renderDesktopView()
      )}

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCandidate(null);
        }}
        title={selectedCandidate ? 'Editar Candidato' : 'Novo Candidato'}
      >
        <CandidateForm
          initialData={selectedCandidate}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setSelectedCandidate(null);
          }}
        />
      </FormModal>
    </Box>
  );
};

export default CandidateList; 