import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { 
  Add as AddIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { jobService } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CLT',
    requirements: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: 'created_at', direction: 'desc' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchJobs();
  }, [page, perPage, filters, sort]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAll(
        page,
        perPage,
        filters,
        { sort_by: sort.field, sort_direction: sort.direction }
      );
      setJobs(response.data.data);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      showSnackbar('Erro ao carregar vagas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const handleSort = (field, direction) => {
    setSort({ field, direction });
  };

  const handleFilter = (filterData) => {
    setFilters(filterData);
    setPage(1);
  };

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }));
    setPage(1);
  };

  const handleOpenDialog = (job = null) => {
    if (job) {
      setCurrentJob(job);
      setFormData({
        title: job.title,
        description: job.description,
        type: job.type,
        requirements: job.requirements,
        active: job.active
      });
    } else {
      setCurrentJob(null);
      setFormData({
        title: '',
        description: '',
        type: 'CLT',
        requirements: '',
        active: true
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'active' ? checked : value
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title) {
      errors.title = 'O título é obrigatório';
    }
    
    if (!formData.description) {
      errors.description = 'A descrição é obrigatória';
    }
    
    if (!formData.type) {
      errors.type = 'O tipo de vaga é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (currentJob) {
        await jobService.update(currentJob.id, formData);
        showSnackbar('Vaga atualizada com sucesso');
      } else {
        await jobService.create(formData);
        showSnackbar('Vaga criada com sucesso');
      }
      
      handleCloseDialog();
      fetchJobs();
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      showSnackbar('Erro ao salvar vaga', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (job) => {
    if (window.confirm(`Tem certeza que deseja excluir a vaga "${job.title}"?`)) {
      try {
        setLoading(true);
        await jobService.delete(job.id);
        showSnackbar('Vaga excluída com sucesso');
        fetchJobs();
      } catch (error) {
        console.error('Erro ao excluir vaga:', error);
        showSnackbar('Erro ao excluir vaga', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async (ids) => {
    if (window.confirm(`Tem certeza que deseja excluir ${ids.length} vagas selecionadas?`)) {
      try {
        setLoading(true);
        await jobService.bulkDelete(ids);
        showSnackbar(`${ids.length} vagas excluídas com sucesso`);
        fetchJobs();
      } catch (error) {
        console.error('Erro ao excluir vagas em massa:', error);
        showSnackbar('Erro ao excluir vagas', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      setLoading(true);
      await jobService.toggleStatus(job.id);
      showSnackbar(`Vaga ${job.active ? 'pausada' : 'ativada'} com sucesso`);
      fetchJobs();
    } catch (error) {
      console.error('Erro ao alterar status da vaga:', error);
      showSnackbar('Erro ao alterar status da vaga', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const columns = [
    { field: 'title', headerName: 'Título', minWidth: 200 },
    { 
      field: 'type', 
      headerName: 'Tipo', 
      minWidth: 120,
      renderCell: (row) => {
        const types = {
          'CLT': 'CLT',
          'PJ': 'Pessoa Jurídica',
          'FREELANCER': 'Freelancer'
        };
        
        const colors = {
          'CLT': 'primary',
          'PJ': 'secondary',
          'FREELANCER': 'default'
        };
        
        return (
          <Chip 
            label={types[row.type] || row.type} 
            color={colors[row.type] || 'default'} 
            size="small" 
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'active', 
      headerName: 'Status', 
      minWidth: 120,
      renderCell: (row) => (
        <Chip 
          label={row.active ? 'Ativa' : 'Pausada'} 
          color={row.active ? 'success' : 'error'} 
          size="small"
          icon={row.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
        />
      )
    },
    { field: 'description', headerName: 'Descrição', minWidth: 300 },
  ];

  // Ações adicionais para o menu de cada linha
  const actions = [
    {
      name: row => row.active ? 'Pausar Vaga' : 'Ativar Vaga',
      icon: <ToggleOnIcon />,
      handler: handleToggleStatus
    }
  ];

  // Campos para filtro
  const filterFields = [
    {
      name: 'type',
      label: 'Tipo de Vaga',
      type: 'select',
      options: [
        { value: 'CLT', label: 'CLT' },
        { value: 'PJ', label: 'Pessoa Jurídica' },
        { value: 'FREELANCER', label: 'Freelancer' }
      ]
    },
    {
      name: 'active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Ativa' },
        { value: 'false', label: 'Pausada' }
      ]
    }
  ];

  const renderForm = () => (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <TextField
          label="Título da Vaga"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          required
          error={!!formErrors.title}
          helperText={formErrors.title}
        />
      </Grid>
      <Grid xs={12} sm={6}>
        <FormControl fullWidth required error={!!formErrors.type}>
          <InputLabel>Tipo de Contratação</InputLabel>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            label="Tipo de Contratação"
          >
            <MenuItem value="CLT">CLT</MenuItem>
            <MenuItem value="PJ">PJ</MenuItem>
            <MenuItem value="Freelancer">Freelancer</MenuItem>
            <MenuItem value="Estágio">Estágio</MenuItem>
            <MenuItem value="Temporário">Temporário</MenuItem>
          </Select>
          {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.active}
              onChange={handleChange}
              name="active"
              color="primary"
            />
          }
          label="Vaga Ativa"
        />
      </Grid>
      <Grid xs={12}>
        <TextField
          label="Descrição"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          required
          multiline
          rows={4}
          error={!!formErrors.description}
          helperText={formErrors.description}
        />
      </Grid>
      <Grid xs={12}>
        <TextField
          label="Requisitos"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  );

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gerenciamento de Vagas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Vaga
        </Button>
      </Box>

      <DataTable
        title="Vagas"
        data={jobs}
        columns={columns}
        totalItems={totalItems}
        page={page}
        perPage={perPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSort={handleSort}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onFilter={handleFilter}
        onSearch={handleSearch}
        onBulkDelete={handleBulkDelete}
        onRefresh={fetchJobs}
        loading={loading}
        filterFields={filterFields}
        actions={actions}
      />

      <FormModal
        open={openDialog}
        onClose={handleCloseDialog}
        title={currentJob ? `Editar Vaga: ${currentJob.title}` : 'Nova Vaga'}
        onSubmit={handleSubmit}
        loading={loading}
        submitText={currentJob ? 'Atualizar' : 'Criar'}
      >
        {renderForm()}
      </FormModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Jobs; 