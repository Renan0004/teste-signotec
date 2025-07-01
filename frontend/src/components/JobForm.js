import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper
} from '@mui/material';

const JobForm = ({ jobToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData(jobToEdit);
    }
  }, [jobToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = jobToEdit
      ? `http://localhost:8000/api/jobs/${jobToEdit.id}`
      : 'http://localhost:8000/api/jobs';
    
    const method = jobToEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave();
        setFormData({
          title: '',
          description: '',
          company: '',
          location: '',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {jobToEdit ? 'Editar Vaga' : 'Nova Vaga'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            label="Empresa"
            name="company"
            value={formData.company}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Localização"
            name="location"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              {jobToEdit ? 'Atualizar' : 'Criar'}
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default JobForm; 