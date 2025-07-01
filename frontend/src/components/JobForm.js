import React, { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Typography,
  Divider,
  Chip,
  Autocomplete,
  FormHelperText
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Circle as CircleIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon,
  List as ListIcon
} from '@mui/icons-material';

const JobForm = ({ onSubmit, initialData = null, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    contract_type: initialData?.contract_type || '',
    is_active: initialData?.is_active ?? true,
    salary_range: initialData?.salary_range || '',
    experience_level: initialData?.experience_level || '',
    requirements: initialData?.requirements || [],
    benefits: initialData?.benefits || ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const steps = ['Informações Básicas', 'Requisitos e Benefícios', 'Detalhes do Contrato'];

  const experienceLevels = [
    'Estágio',
    'Júnior',
    'Pleno',
    'Sênior',
    'Especialista',
    'Gerente'
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
    'Docker'
  ];

  const validateStep = () => {
    const errors = {};
    
    if (activeStep === 0) {
      if (!formData.title) errors.title = 'Título é obrigatório';
      if (!formData.company) errors.company = 'Empresa é obrigatória';
      if (!formData.description) errors.description = 'Descrição é obrigatória';
      else if (formData.description.length < 50) errors.description = 'A descrição deve ter pelo menos 50 caracteres';
      if (!formData.location) errors.location = 'Localização é obrigatória';
    } else if (activeStep === 1) {
      if (!formData.requirements || formData.requirements.length === 0) {
        errors.requirements = 'Adicione pelo menos um requisito';
      }
      if (!formData.benefits) errors.benefits = 'Descreva os benefícios oferecidos';
      if (!formData.experience_level) errors.experience_level = 'Nível de experiência é obrigatório';
    } else if (activeStep === 2) {
      if (!formData.contract_type) errors.contract_type = 'Tipo de contrato é obrigatório';
      if (!formData.salary_range) errors.salary_range = 'Faixa salarial é obrigatória';
      if (formData.is_active === null || formData.is_active === undefined) {
        errors.is_active = 'Status é obrigatório';
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      setError('Erro ao salvar a vaga. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Título da Vaga"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.title}
                helperText={validationErrors.title || 'Digite o título da vaga, ex: Desenvolvedor Full Stack'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="primary" />
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
                error={!!validationErrors.description}
                helperText={validationErrors.description || 'Descreva detalhadamente os requisitos e responsabilidades da vaga (mínimo 50 caracteres)'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="textSecondary">
                {formData.description.length}/50 caracteres mínimos
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="company"
                label="Empresa"
                value={formData.company}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.company}
                helperText={validationErrors.company || 'Nome da empresa contratante'}
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
                error={!!validationErrors.location}
                helperText={validationErrors.location || 'Cidade/Estado ou Remoto'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!validationErrors.experience_level}>
                <InputLabel>Nível de Experiência</InputLabel>
                <Select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  label="Nível de Experiência"
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <SchoolIcon color="primary" />
                    </InputAdornment>
                  }
                >
                  {experienceLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.experience_level && (
                  <FormHelperText>{validationErrors.experience_level}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={commonRequirements}
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
                    placeholder="Adicione os requisitos"
                    error={!!validationErrors.requirements}
                    helperText={validationErrors.requirements}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <ListIcon color="primary" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="benefits"
                label="Benefícios"
                value={formData.benefits}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={3}
                error={!!validationErrors.benefits}
                helperText={validationErrors.benefits || 'Liste os benefícios oferecidos'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ListIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.contract_type}>
                <InputLabel>Tipo de Contrato</InputLabel>
                <Select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  label="Tipo de Contrato"
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <AssignmentIcon color="primary" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Selecione um tipo</MenuItem>
                  <MenuItem value="CLT">CLT</MenuItem>
                  <MenuItem value="PJ">PJ</MenuItem>
                  <MenuItem value="FREELANCER">Freelancer</MenuItem>
                </Select>
                {validationErrors.contract_type && (
                  <FormHelperText>{validationErrors.contract_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="salary_range"
                label="Faixa Salarial"
                value={formData.salary_range}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.salary_range}
                helperText={validationErrors.salary_range || 'Ex: R$ 5.000 - R$ 7.000'}
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
              <FormControl fullWidth error={!!validationErrors.is_active}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                  label="Status"
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <CircleIcon color={formData.is_active ? "success" : "error"} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value={true}>Ativa</MenuItem>
                  <MenuItem value={false}>Inativa</MenuItem>
                </Select>
                {validationErrors.is_active && (
                  <FormHelperText>{validationErrors.is_active}</FormHelperText>
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

export default JobForm; 