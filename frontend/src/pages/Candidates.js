import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  Chip,
  Autocomplete,
  FormHelperText,
  Avatar,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { 
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { candidateService, jobService } from '../services/api';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openJobsDialog, setOpenJobsDialog] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: '',
    jobs: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: 'created_at', direction: 'desc' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCandidates();
    fetchAllJobs();
  }, [page, perPage, filters, sort]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getAll(
        page,
        perPage,
        filters,
        { sort_by: sort.field, sort_direction: sort.direction }
      );
      setCandidates(response.data.data);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      showSnackbar('Erro ao carregar candidatos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJobs = async () => {
    try {
      const response = await jobService.getAll(1, 100, { active: true });
      setJobs(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  const fetchCandidateJobs = async (candidateId) => {
    try {
      setLoading(true);
      const response = await candidateService.getJobs(candidateId);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vagas do candidato:', error);
      return [];
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

  const handleOpenDialog = async (candidate = null) => {
    if (candidate) {
      setCurrentCandidate(candidate);
      const candidateJobs = await fetchCandidateJobs(candidate.id);
      
      setFormData({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || '',
        resume: candidate.resume || '',
        jobs: candidateJobs
      });
    } else {
      setCurrentCandidate(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        resume: '',
        jobs: []
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenJobsDialog = async (candidate) => {
    setCurrentCandidate(candidate);
    const candidateJobs = await fetchCandidateJobs(candidate.id);
    
    setFormData(prev => ({
      ...prev,
      jobs: candidateJobs
    }));
    
    setOpenJobsDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseJobsDialog = () => {
    setOpenJobsDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleJobsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      jobs: newValue
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'O nome é obrigatório';
    }
    
    if (!formData.email) {
      errors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-mail inválido';
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
      
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resume: formData.resume
      };
      
      if (currentCandidate) {
        await candidateService.update(currentCandidate.id, dataToSend);
        
        // Atualizar inscrições em vagas
        const currentJobs = await fetchCandidateJobs(currentCandidate.id);
        const currentJobIds = currentJobs.map(job => job.id);
        const newJobIds = formData.jobs.map(job => job.id);
        
        // Adicionar novas inscrições
        for (const job of formData.jobs) {
          if (!currentJobIds.includes(job.id)) {
            await candidateService.applyToJob(currentCandidate.id, job.id);
          }
        }
        
        // Remover inscrições
        for (const job of currentJobs) {
          if (!newJobIds.includes(job.id)) {
            await candidateService.removeFromJob(currentCandidate.id, job.id);
          }
        }
        
        showSnackbar('Candidato atualizado com sucesso');
      } else {
        const response = await candidateService.create(dataToSend);
        const candidateId = response.data.id;
        
        // Adicionar inscrições em vagas
        for (const job of formData.jobs) {
          await candidateService.applyToJob(candidateId, job.id);
        }
        
        showSnackbar('Candidato criado com sucesso');
      }
      
      handleCloseDialog();
      fetchCandidates();
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
      showSnackbar('Erro ao salvar candidato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJobs = async () => {
    try {
      setLoading(true);
      
      // Atualizar inscrições em vagas
      const currentJobs = await fetchCandidateJobs(currentCandidate.id);
      const currentJobIds = currentJobs.map(job => job.id);
      const newJobIds = formData.jobs.map(job => job.id);
      
      // Adicionar novas inscrições
      for (const job of formData.jobs) {
        if (!currentJobIds.includes(job.id)) {
          await candidateService.applyToJob(currentCandidate.id, job.id);
        }
      }
      
      // Remover inscrições
      for (const job of currentJobs) {
        if (!newJobIds.includes(job.id)) {
          await candidateService.removeFromJob(currentCandidate.id, job.id);
        }
      }
      
      showSnackbar('Vagas do candidato atualizadas com sucesso');
      handleCloseJobsDialog();
      fetchCandidates();
    } catch (error) {
      console.error('Erro ao atualizar vagas do candidato:', error);
      showSnackbar('Erro ao atualizar vagas do candidato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidate) => {
    if (window.confirm(`Tem certeza que deseja excluir o candidato "${candidate.name}"?`)) {
      try {
        setLoading(true);
        await candidateService.delete(candidate.id);
        showSnackbar('Candidato excluído com sucesso');
        fetchCandidates();
      } catch (error) {
        console.error('Erro ao excluir candidato:', error);
        showSnackbar('Erro ao excluir candidato', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async (ids) => {
    if (window.confirm(`Tem certeza que deseja excluir ${ids.length} candidatos selecionados?`)) {
      try {
        setLoading(true);
        await candidateService.bulkDelete(ids);
        showSnackbar(`${ids.length} candidatos excluídos com sucesso`);
        fetchCandidates();
      } catch (error) {
        console.error('Erro ao excluir candidatos em massa:', error);
        showSnackbar('Erro ao excluir candidatos', 'error');
      } finally {
        setLoading(false);
      }
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

  // Ações adicionais para o menu de cada linha
  const actions = [
    {
      name: 'Gerenciar Vagas',
      icon: <WorkIcon />,
      handler: handleOpenJobsDialog
    }
  ];

  const columns = [
    { 
      field: 'name', 
      headerName: 'Nome', 
      minWidth: 200,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}` 
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Typography variant="body1">{row.name}</Typography>
        </Box>
      )
    },
    { 
      field: 'email', 
      headerName: 'E-mail', 
      minWidth: 220,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">{row.email}</Typography>
        </Box>
      )
    },
    { 
      field: 'phone', 
      headerName: 'Telefone', 
      minWidth: 150,
      renderCell: (row) => row.phone ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">{row.phone}</Typography>
        </Box>
      ) : '-'
    },
    { 
      field: 'jobs_count', 
      headerName: 'Vagas', 
      minWidth: 100,
      align: 'center',
      renderCell: (row) => (
        <Chip 
          label={row.jobs_count || '0'} 
          color={row.jobs_count > 0 ? 'primary' : 'default'} 
          size="small"
          icon={<WorkIcon />}
        />
      )
    }
  ];

  // Campos para filtro
  const filterFields = [
    { name: 'name', label: 'Nome', type: 'text' },
    { name: 'email', label: 'E-mail', type: 'text' }
  ];

  // Adicionar função para renderizar o formulário
  const renderCandidateForm = () => (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <TextField
          label="Nome Completo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          error={!!formErrors.name}
          helperText={formErrors.name}
        />
      </Grid>
      <Grid xs={12} sm={6}>
        <TextField
          label="E-mail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          error={!!formErrors.email}
          helperText={formErrors.email}
        />
      </Grid>
      <Grid xs={12} sm={6}>
        <TextField
          label="Telefone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid xs={12}>
        <TextField
          label="Resumo / Currículo"
          name="resume"
          value={formData.resume}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
        />
      </Grid>
      <Grid xs={12}>
        <Autocomplete
          multiple
          id="jobs"
          options={jobs}
          getOptionLabel={(option) => option.title}
          value={formData.jobs}
          onChange={handleJobsChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Vagas de Interesse"
              placeholder="Selecione as vagas"
              fullWidth
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option.id}
                label={option.title}
                {...getTagProps({ index })}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))
          }
        />
      </Grid>
    </Grid>
  );

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gerenciamento de Candidatos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Candidato
        </Button>
      </Box>

      <DataTable
        title="Candidatos"
        data={candidates}
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
        onRefresh={fetchCandidates}
        loading={loading}
        filterFields={filterFields}
        actions={actions}
      />

      {/* Modal de Criação/Edição de Candidato */}
      <FormModal
        open={openDialog}
        onClose={handleCloseDialog}
        title={currentCandidate ? `Editar Candidato: ${currentCandidate.name}` : 'Novo Candidato'}
        onSubmit={handleSubmit}
        loading={loading}
        submitText={currentCandidate ? 'Atualizar' : 'Criar'}
      >
        {renderCandidateForm()}
      </FormModal>

      {/* Modal de Gerenciamento de Vagas do Candidato */}
      <FormModal
        open={openJobsDialog}
        onClose={handleCloseJobsDialog}
        title={currentCandidate ? `Gerenciar Vagas: ${currentCandidate.name}` : ''}
        onSubmit={handleSaveJobs}
        loading={loading}
        submitText="Salvar Vagas"
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Selecione as vagas para as quais o candidato está inscrito:
          </Typography>
          
          <Autocomplete
            multiple
            id="jobs-management"
            options={jobs}
            value={formData.jobs}
            onChange={handleJobsChange}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Vagas"
                placeholder="Selecione as vagas"
                fullWidth
                margin="normal"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.title}
                  {...getTagProps({ index })}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))
            }
          />
        </Box>
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

export default Candidates; 