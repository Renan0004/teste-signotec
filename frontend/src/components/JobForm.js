import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  InputAdornment,
  Typography,
  Chip,
  Autocomplete,
  FormHelperText,
  Stack,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  LocationOn as LocationIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const JobForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full_time',
    status: 'active',
    salary: '',
    experience_level: '',
    requirements: [],
    benefits: [],
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const jobTypes = [
    { value: 'full_time', label: 'Tempo Integral' },
    { value: 'part_time', label: 'Meio Período' },
    { value: 'contract', label: 'Contrato' },
    { value: 'temporary', label: 'Temporário' },
    { value: 'internship', label: 'Estágio' }
  ];

  const experienceLevels = [
    { value: 'internship', label: 'Estágio' },
    { value: 'junior', label: 'Júnior' },
    { value: 'mid_level', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'expert', label: 'Especialista' },
    { value: 'manager', label: 'Gerente' }
  ];

  const commonRequirements = [
    'JavaScript',
    'React',
    'Node.js',
    'PHP',
    'Laravel',
    'MySQL',
    'Git',
    'Scrum',
    'Inglês',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    '.NET',
    'AWS',
    'Docker',
    'Kubernetes'
  ];

  const commonBenefits = [
    'Vale Refeição',
    'Vale Transporte',
    'Plano de Saúde',
    'Plano Odontológico',
    'Seguro de Vida',
    'Gympass',
    'Day Off no Aniversário',
    'Home Office',
    'Horário Flexível',
    'PLR',
    'Stock Options'
  ];

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'O título da vaga é obrigatório';
    }
    
    if (!formData.company?.trim()) {
      newErrors.company = 'O nome da empresa é obrigatório';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    } else if (formData.description.length < 50) {
      newErrors.description = 'A descrição deve ter pelo menos 50 caracteres';
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = 'A localização é obrigatória';
    }
    
    if (!formData.type) {
      newErrors.type = 'O tipo de contratação é obrigatório';
    }
    
    if (!formData.salary?.trim()) {
      newErrors.salary = 'A faixa salarial é obrigatória';
    }
    
    if (!formData.experience_level) {
      newErrors.experience_level = 'O nível de experiência é obrigatório';
    }
    
    if (!formData.requirements?.length) {
      newErrors.requirements = 'Adicione pelo menos um requisito';
    }
    
    if (!formData.benefits?.length) {
      newErrors.benefits = 'Adicione pelo menos um benefício';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      enqueueSnackbar('Por favor, corrija os erros no formulário', { variant: 'error' });
      return;
    }
    
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        requirements: formData.requirements.map(req => req.trim()),
        benefits: formData.benefits.map(ben => ben.trim())
      };

      await onSubmit(dataToSend);
      enqueueSnackbar('Vaga salva com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      enqueueSnackbar('Erro ao salvar a vaga. Por favor, tente novamente.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações Básicas
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Título da Vaga"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title || 'Ex: Desenvolvedor Full Stack Senior'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="company"
              label="Empresa"
              value={formData.company}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.company}
              helperText={errors.company}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="location"
              label="Localização"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.location}
              helperText={errors.location || 'Ex: São Paulo, SP ou Remoto'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Descrição"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description || 'Descreva as responsabilidades e requisitos da vaga (mínimo 50 caracteres)'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {formData.description.length}/50 caracteres mínimos
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Requisitos e Benefícios
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={commonRequirements}
              value={formData.requirements}
              onChange={(_, newValue) => {
                setFormData(prev => ({ ...prev, requirements: newValue }));
                if (errors.requirements) {
                  setErrors(prev => ({ ...prev, requirements: undefined }));
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Requisitos"
                  required
                  error={!!errors.requirements}
                  helperText={errors.requirements || 'Pressione Enter para adicionar requisitos personalizados'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={commonBenefits}
              value={formData.benefits}
              onChange={(_, newValue) => {
                setFormData(prev => ({ ...prev, benefits: newValue }));
                if (errors.benefits) {
                  setErrors(prev => ({ ...prev, benefits: undefined }));
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Benefícios"
                  required
                  error={!!errors.benefits}
                  helperText={errors.benefits || 'Pressione Enter para adicionar benefícios personalizados'}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detalhes da Vaga
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.type}>
              <InputLabel>Tipo de Contratação</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Tipo de Contratação"
              >
                {jobTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.experience_level}>
              <InputLabel>Nível de Experiência</InputLabel>
              <Select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                label="Nível de Experiência"
              >
                {experienceLevels.map(level => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.experience_level && (
                <FormHelperText>{errors.experience_level}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="salary"
              label="Faixa Salarial"
              value={formData.salary}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.salary}
              helperText={errors.salary || 'Ex: R$ 5.000 - R$ 7.000 ou A combinar'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    status: e.target.checked ? 'active' : 'inactive'
                  }))}
                  color="primary"
                />
              }
              label="Vaga Ativa"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Vaga'}
        </Button>
      </Box>
    </Box>
  );
};

export default JobForm; 