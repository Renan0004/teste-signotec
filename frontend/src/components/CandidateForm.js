import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  InputAdornment,
  CircularProgress,
  Input,
  FormHelperText,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Work as WorkIcon,
  CloudUpload as CloudUploadIcon,
  LinkedIn as LinkedInIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  RemoveCircle as RemoveCircleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../services/api';
import { useSnackbar } from 'notistack';

// Componente para criar e editar candidatos
const CandidateForm = ({ candidate, onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: candidate ? candidate.name : '',
    email: candidate ? candidate.email : '',
    phone: candidate ? candidate.phone : '',
    linkedin: candidate ? candidate.linkedin : '',
    curriculum: candidate ? candidate.curriculum : null,
    selectedJobs: candidate ? candidate.jobs?.map(job => job.id) || [] : [],
    experiences: candidate ? candidate.experiences || [
      { company: '', position: '', period: '', description: '' }
    ] : [
      { company: '', position: '', period: '', description: '' }
    ]
  });

  const [availableJobs, setAvailableJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const steps = ['Informações Pessoais', 'Experiência Profissional', 'Currículo e Vagas'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs', {
        params: {
          is_active: true,
          per_page: 100
        }
      });
      setAvailableJobs(response.data.data || []);
    } catch (error) {
      enqueueSnackbar('Não foi possível carregar as vagas disponíveis.', { 
        variant: 'error',
      });
    }
  };

  const validateStep = () => {
    const errors = {};
    
    if (activeStep === 0) {
      if (!formData.name) errors.name = 'Nome é obrigatório';
      if (!formData.email) errors.email = 'Email é obrigatório';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';
      if (!formData.phone) errors.phone = 'Telefone é obrigatório';
      else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone)) errors.phone = 'Formato inválido';
      if (formData.linkedin && !/^https?:\/\/[a-zA-Z0-9-]+\.linkedin\.com\/.*$/.test(formData.linkedin)) {
        errors.linkedin = 'URL do LinkedIn inválida';
      }
    } else if (activeStep === 1) {
      const experienceErrors = formData.experiences.map(exp => {
        const expError = {};
        if (!exp.company) expError.company = 'Empresa é obrigatória';
        if (!exp.position) expError.position = 'Cargo é obrigatório';
        if (!exp.period) expError.period = 'Período é obrigatório';
        return expError;
      });
      if (experienceErrors.some(err => Object.keys(err).length > 0)) {
        errors.experiences = experienceErrors;
      }
    } else if (activeStep === 2) {
      if (!formData.curriculum && !candidate?.resume_url) {
        errors.curriculum = 'Currículo é obrigatório';
      }
      if (!formData.selectedJobs || formData.selectedJobs.length === 0) {
        errors.selectedJobs = 'Selecione pelo menos uma vaga';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'checkbox') {
      const jobId = parseInt(value);
      setFormData(prev => ({
        ...prev,
        selectedJobs: checked
          ? [...prev.selectedJobs, jobId]
          : prev.selectedJobs.filter(id => id !== jobId)
      }));
    } else if (name === 'phone') {
      // Formatação de telefone
      const digits = value.replace(/\D/g, '');
      const limitedDigits = digits.substring(0, 11);
      
      let formattedPhone = '';
      if (limitedDigits.length <= 2) {
        formattedPhone = limitedDigits.length === 0 ? '' : `(${limitedDigits}`;
      } else if (limitedDigits.length <= 7) {
        formattedPhone = `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2)}`;
      } else {
        formattedPhone = `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2, 7)}-${limitedDigits.substring(7)}`;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      // Para todos os outros campos, simplesmente atualize o valor
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpar erro de validação quando o campo é alterado
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      experiences: newExperiences
    }));

    if (validationErrors.experiences?.[index]?.[field]) {
      const newErrors = { ...validationErrors };
      if (newErrors.experiences) {
        newErrors.experiences[index] = {
          ...newErrors.experiences[index],
          [field]: undefined
        };
      }
      setValidationErrors(newErrors);
    }
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { company: '', position: '', period: '', description: '' }
      ]
    }));
  };

  const removeExperience = (index) => {
    if (formData.experiences.length > 1) {
      setFormData(prev => ({
        ...prev,
        experiences: prev.experiences.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          curriculum: 'O arquivo deve ter no máximo 5MB'
        }));
        return;
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors(prev => ({
          ...prev,
          curriculum: 'Apenas arquivos PDF ou Word são permitidos'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        curriculum: file
      }));

      // Criar preview URL para PDF
      if (file.type === 'application/pdf') {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }

      setValidationErrors(prev => ({
        ...prev,
        curriculum: undefined
      }));

      // Simular progresso de upload
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulário submetido", formData);
    
    if (!validateStep()) {
      console.log("Validação falhou", validationErrors);
      enqueueSnackbar('Por favor, corrija os erros no formulário', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    setError(null);

    const data = new FormData();
    
    // Adicionar campos básicos
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    
    if (formData.linkedin) {
      data.append('linkedin_url', formData.linkedin);
    }
    
    // Adicionar experiências como JSON
    if (formData.experiences && formData.experiences.length > 0) {
      data.append('experiences', JSON.stringify(formData.experiences));
    }
    
    // Adicionar currículo se houver
    if (formData.curriculum instanceof File) {
      data.append('resume', formData.curriculum);
    }
    
    // Adicionar vagas selecionadas
    if (formData.selectedJobs && formData.selectedJobs.length > 0) {
      formData.selectedJobs.forEach(jobId => {
        data.append('job_ids[]', jobId);
      });
    }

    console.log("Dados a serem enviados:", Array.from(data.entries()));

    try {
      if (candidate) {
        await api.post(`/candidates/${candidate.id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        enqueueSnackbar('O candidato foi atualizado com sucesso.', { 
          variant: 'success',
        });
      } else {
        await api.post('/candidates', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        enqueueSnackbar('O candidato foi criado com sucesso.', { 
          variant: 'success',
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar candidato:", error.response || error);
      
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        console.log("Erros do backend:", backendErrors);
        
        // Mapear erros do backend para o formato de validação do frontend
        const mappedErrors = {};
        Object.keys(backendErrors).forEach(key => {
          mappedErrors[key] = backendErrors[key][0];
        });
        
        setValidationErrors(prev => ({
          ...prev,
          ...mappedErrors
        }));
        
        enqueueSnackbar('Por favor, corrija os erros no formulário.', { 
          variant: 'error',
        });
      } else {
        enqueueSnackbar('Ocorreu um erro ao salvar o candidato. Tente novamente.', { 
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)'
    }
  }));

  const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 48,
    height: 48,
    backgroundColor: theme.palette.primary.main,
    marginBottom: theme.spacing(2)
  }));

  const StyledStepper = styled(Stepper)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    '& .MuiStepLabel-root .Mui-completed': {
      color: theme.palette.success.main
    },
    '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
      color: theme.palette.success.main
    },
    '& .MuiStepLabel-root .Mui-active': {
      color: theme.palette.primary.main
    }
  }));

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <StyledPaper elevation={0}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <StyledAvatar>
                <PersonIcon />
              </StyledAvatar>
              <Typography variant="h5" gutterBottom>
                Informações Pessoais
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preencha seus dados básicos de contato
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone || 'Formato: (00) 00000-0000'}
                  placeholder="(00) 00000-0000"
                  inputProps={{
                    inputMode: 'tel',
                    maxLength: 15
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
                  label="LinkedIn (opcional)"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  error={!!validationErrors.linkedin}
                  helperText={validationErrors.linkedin}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedInIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </StyledPaper>
        );

      case 1:
        return (
          <StyledPaper elevation={0}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <StyledAvatar>
                <WorkIcon />
              </StyledAvatar>
              <Typography variant="h5" gutterBottom>
                Experiência Profissional
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conte-nos sobre sua trajetória profissional
              </Typography>
            </Box>

            {formData.experiences.map((experience, index) => (
              <Box key={index} sx={{ mb: 4, position: 'relative' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  Experiência {index + 1}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Empresa"
                      value={experience.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      error={validationErrors.experiences?.[index]?.company}
                      helperText={validationErrors.experiences?.[index]?.company}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      value={experience.position}
                      onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                      error={validationErrors.experiences?.[index]?.position}
                      helperText={validationErrors.experiences?.[index]?.position}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Período"
                      value={experience.period}
                      onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
                      error={validationErrors.experiences?.[index]?.period}
                      helperText={validationErrors.experiences?.[index]?.period}
                      placeholder="Ex: Jan 2020 - Atual"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Descrição das Atividades"
                      value={experience.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      placeholder="Descreva suas principais responsabilidades e conquistas..."
                    />
                  </Grid>
                </Grid>

                {index > 0 && (
                  <IconButton
                    onClick={() => removeExperience(index)}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      color: 'error.main'
                    }}
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={addExperience}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Adicionar Experiência
              </Button>
            </Box>
          </StyledPaper>
        );

      case 2:
        return (
          <StyledPaper elevation={0}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <StyledAvatar>
                <DescriptionIcon />
              </StyledAvatar>
              <Typography variant="h5" gutterBottom>
                Currículo e Vagas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Anexe seu currículo e escolha as vagas de interesse
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: validationErrors.curriculum ? 'error.main' : 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <CloudUploadIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    {formData.curriculum
                      ? `Arquivo selecionado: ${formData.curriculum.name}`
                      : 'Arraste seu currículo aqui ou clique para selecionar'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Formatos aceitos: PDF, DOC, DOCX
                  </Typography>
                  {validationErrors.curriculum && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {validationErrors.curriculum}
                    </Typography>
                  )}
                  {uploadProgress > 0 && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Vagas de Interesse
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selecione as vagas que mais combinam com seu perfil
                </Typography>
                
                {validationErrors.selectedJobs && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {validationErrors.selectedJobs}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  {availableJobs.map((job) => (
                    <Grid item xs={12} sm={6} md={4} key={job.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: formData.selectedJobs.includes(job.id)
                            ? 'primary.main'
                            : 'divider',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => {
                          const isSelected = formData.selectedJobs.includes(job.id);
                          handleChange({
                            target: {
                              type: 'checkbox',
                              name: 'selectedJobs',
                              value: job.id,
                              checked: !isSelected
                            }
                          });
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Checkbox
                            checked={formData.selectedJobs.includes(job.id)}
                            color="primary"
                            sx={{ p: 0, mr: 1 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {job.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {job.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </StyledPaper>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <StyledStepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </StyledStepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
            sx={{ 
              minWidth: 100,
              visibility: activeStep === 0 ? 'hidden' : 'visible'
            }}
          >
            Voltar
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Finalizar'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ minWidth: 100 }}
            >
              Próximo
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default CandidateForm; 