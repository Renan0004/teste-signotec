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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, job: null });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search
        }
      });
      
      // Garantir que response.data é um array
      const jobsData = Array.isArray(response.data) ? response.data : [];
      setJobs(jobsData);
      setTotal(jobsData.length);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      enqueueSnackbar('Erro ao carregar vagas', { variant: 'error' });
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
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
    if (!deleteDialog.job?.id) return;
    
    try {
      await api.delete(`/jobs/${deleteDialog.job.id}`);
      enqueueSnackbar('Vaga excluída com sucesso', { variant: 'success' });
      fetchJobs();
    } catch (error) {
      console.error('Erro ao excluir vaga:', error);
      enqueueSnackbar('Erro ao excluir vaga', { variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, job: null });
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'success';
      case 'fechada':
        return 'error';
      case 'em análise':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Vagas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/jobs/new')}
        >
          Nova Vaga
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Pesquisar vagas..."
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
                <TableCell>Título</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Tipo de Contrato</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Local</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.title || 'N/A'}</TableCell>
                    <TableCell>{job.company || 'N/A'}</TableCell>
                    <TableCell>{job.contract_type || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.is_active ? 'Aberta' : 'Fechada'}
                        color={job.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{job.location || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, job })}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma vaga encontrada
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
        onClose={() => setDeleteDialog({ open: false, job: null })}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a vaga "{deleteDialog.job?.title || ''}"?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, job: null })}
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

export default Jobs; 