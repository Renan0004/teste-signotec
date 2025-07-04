import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  FormHelperText,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  LinkedIn as LinkedInIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const CandidateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    experience: '',
    education: '',
    skills: '',
    resume: null
  });

  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/candidates/${id}`);
      const candidate = response.data;
      setFormData({
        ...candidate,
        resume: null // Não carregamos o arquivo, apenas mantemos a referência
      });
      if (candidate.resume_url) {
        setPreviewUrl(candidate.resume_url);
      }
    } catch (error) {
      enqueueSnackbar('Erro ao carregar dados do candidato', { variant: 'error' });
      navigate('/candidates');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'O nome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone) {
      newErrors.phone = 'O telefone é obrigatório';
    }

    if (formData.linkedin_url && !formData.linkedin_url.includes('linkedin.com')) {
      newErrors.linkedin_url = 'URL do LinkedIn inválida';
    }

    if (!id && !formData.resume) {
      newErrors.resume = 'O currículo é obrigatório';
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
      const data = new FormData();
      
      // Adiciona todos os campos de texto
      Object.keys(formData).forEach(key => {
        if (key !== 'resume' && formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Adiciona o arquivo se existir
      if (formData.resume) {
        data.append('resume', formData.resume);
      }

      if (id) {
        await api.post(`/candidates/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        });
        enqueueSnackbar('Candidato atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/candidates', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        });
        enqueueSnackbar('Candidato criado com sucesso', { variant: 'success' });
      }
      navigate('/candidates');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar candidato');
      enqueueSnackbar('Erro ao salvar candidato', { variant: 'error' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        enqueueSnackbar('Por favor, selecione um arquivo PDF', { variant: 'error' });
        return;
      }
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      resume: null
    }));
    setPreviewUrl('');
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {id ? 'Editar Candidato' : 'Novo Candidato'}
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
                label="Nome completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  handleChange({ target: { name: 'phone', value: formatted } });
                }}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={loading}
                required
                placeholder="(00) 00000-0000"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                error={!!errors.linkedin_url}
                helperText={errors.linkedin_url}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Experiência Profissional"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                disabled={loading}
                multiline
                rows={4}
                placeholder="Descreva suas experiências profissionais anteriores"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Formação Acadêmica"
                name="education"
                value={formData.education}
                onChange={handleChange}
                disabled={loading}
                multiline
                rows={3}
                placeholder="Descreva sua formação acadêmica"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Habilidades"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                disabled={loading}
                multiline
                rows={2}
                placeholder="Liste suas principais habilidades e competências"
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: errors.resume ? 'error.main' : 'grey.300',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <UploadIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1" component="span">
                    {previewUrl ? 'Alterar currículo' : 'Enviar currículo'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Apenas arquivos PDF
                  </Typography>
                </Box>
              </Box>
              {errors.resume && (
                <FormHelperText error>{errors.resume}</FormHelperText>
              )}
              {previewUrl && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {formData.resume?.name || 'Currículo atual'}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleRemoveFile}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" color="text.secondary">
                    Enviando: {Math.round(uploadProgress)}%
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/candidates')}
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

export default CandidateForm; 