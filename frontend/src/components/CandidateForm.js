import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';

// Componente para criar e editar candidatos
const CandidateForm = ({ candidateToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobs: []
  });

  // Estado para armazenar as vagas disponíveis
  const [availableJobs, setAvailableJobs] = useState([]);

  // Efeito para buscar as vagas disponíveis e preencher o formulário com os dados do candidato a ser editado
  useEffect(() => {
    fetchJobs();
    if (candidateToEdit) {
      setFormData(candidateToEdit);
    }
  }, [candidateToEdit]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAvailableJobs(data);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = candidateToEdit
      ? `http://localhost:8000/api/candidates/${candidateToEdit.id}`
      : 'http://localhost:8000/api/candidates';
    
    const method = candidateToEdit ? 'PUT' : 'POST';

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
          name: '',
          email: '',
          phone: '',
          jobs: []
        });
      }
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {candidateToEdit ? 'Editar Candidato' : 'Novo Candidato'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Telefone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Vagas de Interesse</InputLabel>
            <Select
              multiple
              name="jobs"
              value={formData.jobs}
              onChange={handleChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((job) => (
                    <Chip key={job.id} label={job.title} />
                  ))}
                </Box>
              )}
            >
              {availableJobs.map((job) => (
                <MenuItem key={job.id} value={job}>
                  {job.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              {candidateToEdit ? 'Atualizar' : 'Criar'}
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

export default CandidateForm; 