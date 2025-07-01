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
  Alert
} from '@mui/material';

const JobForm = ({ onSubmit, initialData = null, onClose }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    contract_type: initialData?.contract_type || 'CLT',
    is_active: initialData?.is_active ?? true
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError('Erro ao salvar a vaga. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="title"
            label="Título da Vaga"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
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
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Contrato</InputLabel>
            <Select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
              label="Tipo de Contrato"
              required
            >
              <MenuItem value="CLT">CLT</MenuItem>
              <MenuItem value="PJ">PJ</MenuItem>
              <MenuItem value="FREELANCER">Freelancer</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="is_active"
              value={formData.is_active}
              onChange={handleChange}
              label="Status"
              required
            >
              <MenuItem value={true}>Ativa</MenuItem>
              <MenuItem value={false}>Inativa</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobForm; 