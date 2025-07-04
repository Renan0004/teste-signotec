import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  TextField,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  InputAdornment,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, candidate: null });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/candidates', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search
        }
      });
      setCandidates(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar candidatos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page, rowsPerPage, search]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/candidates/${deleteDialog.candidate.id}`);
      enqueueSnackbar('Candidato excluído com sucesso', { variant: 'success' });
      fetchCandidates();
    } catch (error) {
      enqueueSnackbar('Erro ao excluir candidato', { variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, candidate: null });
    }
  };

  const handleDownloadResume = async (candidate) => {
    try {
      const response = await api.get(`/candidates/${candidate.id}/resume`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidate.name}_curriculo.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      enqueueSnackbar('Erro ao baixar currículo', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Candidatos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/candidates/new')}
        >
          Novo Candidato
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Pesquisar candidatos..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Filtros">
                    <IconButton>
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>LinkedIn</TableCell>
                <TableCell>Currículo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone}</TableCell>
                  <TableCell>
                    {candidate.linkedin_url && (
                      <Link
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver perfil
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    {candidate.resume_url && (
                      <Tooltip title="Baixar currículo">
                        <IconButton
                          onClick={() => handleDownloadResume(candidate)}
                          size="small"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => navigate(`/candidates/${candidate.id}/edit`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, candidate })}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {candidates.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum candidato encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, candidate: null })}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o candidato "{deleteDialog.candidate?.name}"?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, candidate: null })}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates; 