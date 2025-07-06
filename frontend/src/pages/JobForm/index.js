import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
  InputAdornment,
  Alert
} from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const contractTypes = [
  'CLT',
  'PJ',
  'Temporário',
  'Estágio',
  'Freelancer'
];

const statusOptions = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'fechada', label: 'Fechada' },
  { value: 'em_andamento', label: 'Em Andamento' }
];

const experienceLevels = [
  'Estágio',
  'Júnior',
  'Pleno',
  'Sênior',
  'Especialista'
];

const defaultBenefits = [
  'Vale Refeição',
  'Vale Transporte',
  'Plano de Saúde',
  'Plano Odontológico',
  'Seguro de Vida',
  'Gympass',
  'Day Off no Aniversário',
  'PLR',
  'Home Office'
];

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: [],
    contract_type: '',
    status: 'aberta',
    salary_range: '',
    experience_level: '',
    benefits: [],
    location: '',
    remote: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      setFormData(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar dados da vaga', { variant: 'error' });
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title) {
      newErrors.title = 'O título é obrigatório';
    }

    if (!formData.company) {
      newErrors.company = 'A empresa é obrigatória';
    }

    if (!formData.description || formData.description.length < 50) {
      newErrors.description = 'A descrição deve ter pelo menos 50 caracteres';
    }

    if (!formData.contract_type) {
      newErrors.contract_type = 'O tipo de contrato é obrigatório';
    }

    if (!formData.experience_level) {
      newErrors.experience_level = 'O nível de experiência é obrigatório';
    }

    if (formData.requirements.length === 0) {
      newErrors.requirements = 'Adicione pelo menos um requisito';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      enqueueSnackbar('Por favor, corrija os erros no formulário', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await api.put(`/jobs/${id}`, formData);
        enqueueSnackbar('Vaga atualizada com sucesso', { variant: 'success' });
      } else {
        await api.post('/jobs', formData);
        enqueueSnackbar('Vaga criada com sucesso', { variant: 'success' });
      }
      navigate('/jobs');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar vaga');
      enqueueSnackbar('Erro ao salvar vaga', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa o erro do campo quando ele é alterado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {id ? 'Editar Vaga' : 'Nova Vaga'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título da Vaga"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Empresa"
                name="company"
                value={formData.company}
                onChange={handleChange}
                error={!!errors.company}
                helperText={errors.company}
                disabled={loading}
                required
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
                helperText={errors.description || 'Mínimo de 50 caracteres'}
                disabled={loading}
                required
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.contract_type}>
                <InputLabel>Tipo de Contrato</InputLabel>
                <Select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  {contractTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.contract_type && (
                  <FormHelperText>{errors.contract_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Faixa Salarial"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.experience_level}>
                <InputLabel>Nível de Experiência</InputLabel>
                <Select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  {experienceLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
                {errors.experience_level && (
                  <FormHelperText>{errors.experience_level}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.requirements}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    requirements: newValue
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Requisitos"
                    error={!!errors.requirements}
                    helperText={errors.requirements}
                    placeholder="Digite e pressione Enter para adicionar"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={defaultBenefits}
                value={formData.benefits}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    benefits: newValue
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Benefícios"
                    placeholder="Selecione os benefícios"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Localização"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ex: São Paulo, SP"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/jobs')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Criar')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
};

export default JobForm; 