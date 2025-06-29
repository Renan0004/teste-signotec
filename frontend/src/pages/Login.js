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
  InputAdornment
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon 
} from '@mui/icons-material';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter a página para onde redirecionar após o login
  const from = location.state?.from?.pathname || '/';
  
  const { login, isAuthenticated, loading } = useAuth();

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
    
    if (!formData.email) {
      errors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (!formData.password) {
      errors.password = 'A senha é obrigatória';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoginError('');
    try {
      console.log('Tentando fazer login com:', formData);
      
      // Usar axios diretamente para o arquivo login_direct.php
      const response = await axios.post('http://localhost:8000/login_direct.php', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Resposta do login direto:', response.data);
      
      if (response.data.error) {
        setLoginError(response.data.error);
        return;
      }
      
      // Salvar o token e definir o usuário no contexto de autenticação
      localStorage.setItem('token', response.data.token);
      
      // Atualizar o contexto de autenticação
      login(formData);
      
      // Redirecionar para a página que o usuário tentou acessar
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      let errorMessage = 'E-mail ou senha incorretos';
      
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setLoginError(errorMessage);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
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
              Conecte-se para continuar
            </Typography>
          </Box>
          
          {loginError && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {loginError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{' '}
                <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>
                  Registre-se
                </Link>
              </Typography>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Login; 