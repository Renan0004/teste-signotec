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
      if (!formData.curriculum && !candidate?.curriculum_url) {
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
      let phoneNumber = value.replace(/\D/g, '');
      phoneNumber = phoneNumber.slice(0, 11);
      
      if (phoneNumber.length >= 2) {
        phoneNumber = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
      }
      if (phoneNumber.length >= 10) {
        phoneNumber = `${phoneNumber.slice(0, 10)}-${phoneNumber.slice(10)}`;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: phoneNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
    if (!validateStep()) return;
    
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'selectedJobs') {
        formData[key].forEach(id => {
          data.append('job_ids[]', id);
        });
      } else if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

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
      if (error.response?.data?.errors) {
        setError(error.response.data.errors);
      } else {
        enqueueSnackbar('Ocorreu um erro ao salvar o candidato.', { 
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

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nome Completo"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Telefone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                placeholder="(99) 99999-9999"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="linkedin"
                label="LinkedIn"
                value={formData.linkedin}
                onChange={handleChange}
                fullWidth
                error={!!validationErrors.linkedin}
                helperText={validationErrors.linkedin || 'URL do seu perfil no LinkedIn (opcional)'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <List>
              {formData.experiences.map((experience, index) => (
                <Box key={index}>
                  <ListItem>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Experiência {index + 1}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Empresa"
                          value={experience.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          error={!!validationErrors.experiences?.[index]?.company}
                          helperText={validationErrors.experiences?.[index]?.company}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Cargo"
                          value={experience.position}
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          error={!!validationErrors.experiences?.[index]?.position}
                          helperText={validationErrors.experiences?.[index]?.position}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Período"
                          value={experience.period}
                          onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
                          error={!!validationErrors.experiences?.[index]?.period}
                          helperText={validationErrors.experiences?.[index]?.period || 'Ex: Jan/2020 - Atual'}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Descrição das Atividades"
                          value={experience.description}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          multiline
                          rows={3}
                        />
                      </Grid>
                    </Grid>
                    {formData.experiences.length > 1 && (
                      <IconButton
                        edge="end"
                        onClick={() => removeExperience(index)}
                        sx={{ position: 'absolute', right: 0, top: 0 }}
                      >
                        <RemoveCircleIcon color="error" />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < formData.experiences.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </List>
            <Button
              startIcon={<AddIcon />}
              onClick={addExperience}
              sx={{ mt: 2 }}
            >
              Adicionar Experiência
            </Button>
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: validationErrors.curriculum ? 'error.main' : 'primary.main',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {formData.curriculum ? formData.curriculum.name : 'Arraste seu currículo ou clique para selecionar'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  PDF ou Word (máx. 5MB)
                </Typography>
                {validationErrors.curriculum && (
                  <Typography color="error" variant="caption" display="block">
                    {validationErrors.curriculum}
                  </Typography>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}
                {previewUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      href={previewUrl}
                      target="_blank"
                      startIcon={<DescriptionIcon />}
                    >
                      Visualizar PDF
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!validationErrors.selectedJobs}>
                <InputLabel>Vagas de Interesse</InputLabel>
                <Select
                  multiple
                  value={formData.selectedJobs}
                  onChange={handleChange}
                  input={<OutlinedInput label="Vagas de Interesse" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((jobId) => {
                        const job = availableJobs.find(j => j.id === jobId);
                        return job ? (
                          <Chip
                            key={jobId}
                            label={job.title}
                            size="small"
                            icon={<WorkIcon />}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {availableJobs.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      <Box>
                        <Typography variant="subtitle2">{job.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {job.company} - {job.location}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.selectedJobs && (
                  <FormHelperText>{validationErrors.selectedJobs}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Voltar
          </Button>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={loading}
            >
              {activeStep === steps.length - 1 ? 'Salvar' : 'Próximo'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default CandidateForm; 