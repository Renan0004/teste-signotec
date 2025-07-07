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
  Paper,
  Divider
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  LocationOn as LocationIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon,
  LocalOffer as LocalOfferIcon,
  CardGiftcard as CardGiftcardIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const JobForm = ({ initialData, onSubmit, onCancel, formRef }) => {
  console.log("JobForm - initialData recebido:", initialData);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full_time',
    status: 'aberta',
    salary: '',
    experience_level: '',
    requirements: [],
    benefits: [],
    ...initialData
  });

  console.log("JobForm - formData após inicialização:", formData);

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
    console.log("Formulário submetido!", e);
    
    if (!validate()) {
      enqueueSnackbar('Por favor, corrija os erros no formulário', { variant: 'error' });
      return;
    }
    
    setLoading(true);

    try {
      // Converter o salário para número se for uma string
      let salary = formData.salary;
      if (typeof salary === 'string') {
        // Remove caracteres não numéricos (R$, espaços, pontos, etc)
        salary = salary.replace(/[^\d]/g, '');
        salary = parseInt(salary, 10);
        if (isNaN(salary)) salary = 0;
      }

      // Preparar os dados para envio
      const dataToSend = {
        ...formData,
        salary: salary,
        // Converter arrays para JSON strings como esperado pelo backend
        requirements: JSON.stringify(formData.requirements),
        benefits: JSON.stringify(formData.benefits)
      };

      console.log("Dados formatados para envio:", dataToSend);

      if (typeof onSubmit === 'function') {
        console.log("Chamando onSubmit");
        await onSubmit(dataToSend);
        console.log("onSubmit concluído com sucesso");
      } else {
        console.error('onSubmit não é uma função');
        enqueueSnackbar('Erro ao processar o formulário', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      enqueueSnackbar('Erro ao salvar a vaga. Por favor, tente novamente.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="form" 
      id="job-form" 
      onSubmit={handleSubmit} 
      noValidate 
      className="fade-in"
      ref={formRef}
      sx={{ mt: 1 }}
    >
      {/* Botão de submit invisível para permitir submissão programática */}
      <input type="submit" style={{ display: 'none' }} id="hidden-submit" />
      
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <WorkIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Informações Básicas
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="title"
              label="Título da Vaga"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="company"
              label="Empresa"
              value={formData.company}
              onChange={handleChange}
              error={!!errors.company}
              helperText={errors.company}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="description"
              label="Descrição da Vaga"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="location"
              label="Localização"
              value={formData.location}
              onChange={handleChange}
              error={!!errors.location}
              helperText={errors.location}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="salary"
              label="Salário"
              value={formData.salary}
              onChange={handleChange}
              error={!!errors.salary}
              helperText={errors.salary}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalOfferIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Detalhes da Vaga
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.type} size="small">
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
              {errors.type && (
                <FormHelperText>{errors.type}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.experience_level} size="small">
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

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status da Vaga</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status da Vaga"
              >
                <MenuItem value="aberta">Aberta</MenuItem>
                <MenuItem value="fechada">Fechada</MenuItem>
                <MenuItem value="em_andamento">Em Andamento</MenuItem>
              </Select>
              <FormHelperText>
                Define se a vaga está aceitando candidaturas
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Requisitos e Benefícios
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={commonRequirements}
              value={formData.requirements}
              onChange={(e, newValue) => {
                setFormData(prev => ({ ...prev, requirements: newValue }));
                if (errors.requirements) {
                  setErrors(prev => ({ ...prev, requirements: undefined }));
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index });
                  const { key, ...chipProps } = tagProps;
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option}
                      {...chipProps}
                      size="small"
                      sx={{ 
                        backgroundColor: 'primary.light', 
                        color: 'primary.contrastText',
                        borderColor: 'primary.light',
                        '& .MuiChip-deleteIcon': {
                          color: 'primary.contrastText',
                        }
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Requisitos"
                  error={!!errors.requirements}
                  helperText={errors.requirements}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SchoolIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  size="small"
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
              onChange={(e, newValue) => {
                setFormData(prev => ({ ...prev, benefits: newValue }));
                if (errors.benefits) {
                  setErrors(prev => ({ ...prev, benefits: undefined }));
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index });
                  const { key, ...chipProps } = tagProps;
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option}
                      {...chipProps}
                      size="small"
                      sx={{ 
                        backgroundColor: 'success.light', 
                        color: 'success.contrastText',
                        borderColor: 'success.light',
                        '& .MuiChip-deleteIcon': {
                          color: 'success.contrastText',
                        }
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Benefícios"
                  error={!!errors.benefits}
                  helperText={errors.benefits}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <CardGiftcardIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  size="small"
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ mr: 2 }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          {initialData ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </Box>
    </Box>
  );
};

export default JobForm; 