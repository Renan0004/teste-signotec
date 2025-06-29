import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Card,
  useTheme,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
  
  const { register, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'O nome é obrigatório';
    }
    
    if (!formData.email) {
      errors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (!formData.password) {
      errors.password = 'A senha é obrigatória';
    } else if (formData.password.length < 8) {
      errors.password = 'A senha deve ter pelo menos 8 caracteres';
    }
    
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'A confirmação de senha é obrigatória';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'As senhas não coincidem';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      // Testar conexão com o backend usando o arquivo test.php simples
      console.log('Testando conexão com o backend...');
      const response = await axios.get('http://localhost:8000/test.php');
      
      console.log('Resposta do teste:', response.data);
      
      setConnectionStatus({
        success: true,
        message: `Conexão com o backend estabelecida com sucesso! Servidor: ${response.data.server}, PHP: ${response.data.php_version}`
      });
    } catch (err) {
      console.error('Erro ao testar conexão:', err);
      setConnectionStatus({
        success: false,
        message: `Erro ao testar conexão: ${err.message || 'Verifique se o servidor está em execução'}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setRegisterError('');
    try {
      console.log('Iniciando registro com dados:', formData);
      
      // Usar axios diretamente para o arquivo register_direct.php
      const response = await axios.post('http://localhost:8000/register_direct.php', formData);
      console.log('Resposta do registro direto:', response.data);
      
      if (response.data.error) {
        setRegisterError(response.data.error);
        return;
      }
      
      // Mostrar mensagem de sucesso e redirecionar para a página de login imediatamente
      setRegisterSuccess(true);
      
      // Redirecionar para a página de login após um breve delay (apenas para mostrar a mensagem)
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Erro ao registrar:', err);
      let errorMessage = 'Erro ao registrar. Verifique os dados e tente novamente.';
      
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setRegisterError(errorMessage);
    }
  };

  // Se o registro foi bem-sucedido, mostrar mensagem de sucesso
  if (registerSuccess) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ p: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
                SignoTech
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                Registro concluído com sucesso!
              </Typography>
            </Box>
            
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              Sua conta foi criada com sucesso! Redirecionando para a página de login...
            </Alert>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
              SignoTech
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Crie sua conta para começar
            </Typography>
          </Box>
          
          {/* Botão para testar conexão */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={testingConnection ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={testConnection}
              disabled={testingConnection}
              fullWidth
            >
              {testingConnection ? 'Testando conexão...' : 'Testar conexão com o servidor'}
            </Button>
          </Box>
          
          {/* Status da conexão */}
          {connectionStatus && (
            <Alert 
              severity={connectionStatus.success ? "success" : "error"} 
              sx={{ width: '100%', mb: 3 }}
            >
              {connectionStatus.message}
            </Alert>
          )}
          
          {(registerError || error) && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {registerError || error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome completo"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password_confirmation"
              label="Confirme a senha"
              type="password"
              id="password_confirmation"
              autoComplete="new-password"
              value={formData.password_confirmation}
              onChange={handleChange}
              error={!!formErrors.password_confirmation}
              helperText={formErrors.password_confirmation}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Criar conta'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Já tem uma conta?{' '}
                <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>
                  Fazer login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Register; 