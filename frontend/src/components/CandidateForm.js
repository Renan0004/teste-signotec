import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  CircularProgress,
  FormHelperText,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  LinkedIn as LinkedInIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';

// Componente simplificado para evitar problemas de renderização
const CandidateForm = ({ initialData = null, onSubmit, onCancel, availableJobs = [] }) => {
  // Estado inicial simplificado
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    description: '',
    experiences: [{ company: '', position: '', description: '', period: '' }]
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  // Efeito para inicializar o formulário
  useEffect(() => {
    // Use availableJobs se disponível
    if (availableJobs && availableJobs.length > 0) {
      setJobs(availableJobs);
    } else {
      fetchJobs();
    }
    
    // Inicializa com os dados do candidato se disponíveis
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        linkedin: initialData.linkedin || '',
        description: initialData.description || '',
        experiences: initialData.experiences && initialData.experiences.length > 0 
          ? initialData.experiences.map(exp => ({
              ...exp,
              period: typeof exp.period === 'string' ? exp.period : ''
            }))
          : [{ company: '', position: '', description: '', period: '' }]
      });
      
      if (initialData.jobs) {
        // Extrai IDs das vagas se forem objetos
        const jobIds = initialData.jobs.map(job => 
          typeof job === 'object' && job !== null ? job.id : job
        );
        setSelectedJobs(jobIds);
      }
    }
  }, [initialData, availableJobs]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      enqueueSnackbar('Erro ao carregar vagas', { variant: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Atualiza o estado com o novo valor
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpa o erro quando o campo é editado
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    const limitedDigits = digits.substring(0, 11);
    
    let formattedPhone = '';
    if (limitedDigits.length <= 2) {
      formattedPhone = limitedDigits.length === 0 ? '' : `(${limitedDigits}`;
    } else if (limitedDigits.length <= 7) {
      formattedPhone = `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2)}`;
    } else {
      formattedPhone = `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2, 7)}-${limitedDigits.substring(7)}`;
    }
    
    handleChange({
      target: {
        name: 'phone',
        value: formattedPhone
      }
    });
  };

  const handlePeriodChange = (index, e) => {
    const input = e.target.value;
    
    // Remove caracteres não numéricos exceto a barra
    let formatted = input.replace(/[^\d/]/g, '');
    
    // Limita a 7 caracteres (MM/AAAA)
    if (formatted.length > 7) {
      formatted = formatted.slice(0, 7);
    }
    
    // Adiciona a barra automaticamente após os dois primeiros dígitos
    if (formatted.length >= 2 && !formatted.includes('/')) {
      const month = parseInt(formatted.substring(0, 2));
      
      // Valida o mês (01-12)
      let validMonth = month;
      if (month > 12) validMonth = 12;
      if (month < 1 || isNaN(month)) validMonth = '01';
      
      // Formata com zero à esquerda se necessário
      const formattedMonth = validMonth < 10 && validMonth.toString().length === 1 
        ? `0${validMonth}` 
        : validMonth.toString();
      
      const year = formatted.substring(2);
      formatted = `${formattedMonth}/${year}`;
    }
    
    // Se já tiver a barra, garante que o mês seja válido
    if (formatted.includes('/')) {
      const parts = formatted.split('/');
      if (parts[0] && parts[0].length > 0) {
        const month = parseInt(parts[0]);
        if (month > 12) parts[0] = '12';
        if (month < 1 || isNaN(month)) parts[0] = '01';
        
        // Formata com zero à esquerda
        if (parts[0].length === 1) parts[0] = `0${parts[0]}`;
        
        formatted = parts.join('/');
      }
    }
    
    // Garante que o valor seja sempre tratado como string
    formatted = String(formatted);
    
    console.log('Período formatado:', formatted);
    handleExperienceChange(index, 'period', formatted);
  };

  const handleExperienceChange = (index, field, value) => {
    // Cria uma cópia do array de experiências
    const newExperiences = [...formData.experiences];
    
    // Garante que o valor seja sempre uma string
    const safeValue = typeof value === 'string' ? value : String(value || '');
    
    // Atualiza o campo específico da experiência no índice especificado
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: safeValue
    };
    
    // Atualiza o estado com o novo array
    setFormData({
      ...formData,
      experiences: newExperiences
    });
    
    // Limpa o erro quando o campo é editado
    const errorKey = `experiences.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors({
        ...errors,
        [errorKey]: null
      });
    }
  };

  const addExperience = () => {
    // Cria uma cópia do array de experiências e adiciona uma nova experiência vazia
    const newExperiences = [
      ...formData.experiences,
      { company: '', position: '', description: '', period: '' }
    ];
    
    // Atualiza o estado com o novo array
    setFormData({
      ...formData,
      experiences: newExperiences
    });
  };

  const removeExperience = (index) => {
    // Se houver apenas uma experiência, não permite remover
    if (formData.experiences.length <= 1) {
      return;
    }
    
    // Cria uma cópia do array de experiências
    const newExperiences = [...formData.experiences];
    
    // Remove a experiência no índice especificado
    newExperiences.splice(index, 1);
    
    // Atualiza o estado com o novo array
    setFormData({
      ...formData,
      experiences: newExperiences
    });
  };

  const handleJobsChange = (event) => {
    const { value } = event.target;
    
    // Atualiza o estado com os novos valores selecionados
    setSelectedJobs(value);
    
    // Limpa o erro quando o campo é editado
    if (errors.job_ids) {
      setErrors({
        ...errors,
        job_ids: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validação de campos obrigatórios
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';
    
    // Validação de experiências
    formData.experiences.forEach((exp, index) => {
      if (!exp.company) newErrors[`experiences.${index}.company`] = 'Empresa é obrigatória';
      if (!exp.position) newErrors[`experiences.${index}.position`] = 'Cargo é obrigatório';
      if (!exp.period) newErrors[`experiences.${index}.period`] = 'Período é obrigatório';
    });
    
    // Validação de vagas de interesse
    if (!selectedJobs || selectedJobs.length === 0) {
      newErrors.job_ids = 'Selecione pelo menos uma vaga';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Por favor, corrija os erros no formulário', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepara os dados para envio
      const formattedExperiences = formData.experiences.map(exp => ({
        company: String(exp.company || ''),
        position: String(exp.position || ''),
        description: String(exp.description || ''),
        period: String(exp.period || '')
      }));
      
      const dataToSubmit = {
        ...formData,
        experiences: formattedExperiences,
        job_ids: selectedJobs.length > 0 ? selectedJobs : [1] // Garantir que pelo menos uma vaga seja enviada
      };
      
      // Log para debug
      console.log('Enviando dados do formulário:', dataToSubmit);
      
      // Chama a função onSubmit passada como prop
      await onSubmit(dataToSubmit);
      
      // Exibe mensagem de sucesso
      enqueueSnackbar('Candidato salvo com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
      
      // Trata erros de validação da API
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          apiErrors[key] = messages[0];
        });
        setErrors(apiErrors);
        enqueueSnackbar('Verifique os erros no formulário', { variant: 'error' });
      } else {
        // Mensagem genérica de erro
        enqueueSnackbar(error.message || 'Erro ao salvar candidato', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Telefone"
            value={formData.phone}
            onChange={handlePhoneChange}
            error={!!errors.phone}
            helperText={errors.phone || 'Formato: (00) 00000-0000'}
            placeholder="(00) 00000-0000"
            inputProps={{
              inputMode: 'tel',
              maxLength: 15,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="LinkedIn"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            error={!!errors.linkedin}
            helperText={errors.linkedin}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkedInIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={4}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.job_ids}>
            <InputLabel id="jobs-label">Vagas de Interesse</InputLabel>
            <Select
              labelId="jobs-label"
              id="jobs-select"
              multiple
              value={selectedJobs}
              onChange={handleJobsChange}
              input={<OutlinedInput label="Vagas de Interesse" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((jobId) => {
                    const job = jobs.find(j => j.id === jobId);
                    return job ? (
                      <Chip key={`chip-${jobId}`} label={job.title} />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {jobs.map((job) => (
                <MenuItem key={`job-${job.id}`} value={job.id}>
                  {job.title}
                </MenuItem>
              ))}
            </Select>
            {errors.job_ids && <FormHelperText>{errors.job_ids}</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Experiências
          </Typography>
          
          {formData.experiences.map((experience, index) => (
            <Box 
              key={`experience-${index}`}
              sx={{ 
                mb: 3, 
                p: 2, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                position: 'relative'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Empresa"
                    value={experience.company || ''}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    error={!!errors[`experiences.${index}.company`]}
                    helperText={errors[`experiences.${index}.company`]}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Cargo"
                    value={experience.position || ''}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    error={!!errors[`experiences.${index}.position`]}
                    helperText={errors[`experiences.${index}.position`]}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Período (MM/AAAA)"
                    value={experience.period || ''}
                    onChange={(e) => handlePeriodChange(index, e)}
                    error={!!errors[`experiences.${index}.period`]}
                    helperText={errors[`experiences.${index}.period`] || 'Ex: 01/2020'}
                    placeholder="MM/AAAA"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    value={experience.description || ''}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
              
              {formData.experiences.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => removeExperience(index)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={addExperience}
            variant="outlined"
            color="primary"
            sx={{ mt: 1 }}
            type="button"
          >
            Adicionar Experiência
          </Button>
        </Grid>
        
        <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {initialData ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateForm; 