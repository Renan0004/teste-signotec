import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Link,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Limpa o erro quando o usuário começa a digitar
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Validação básica
        if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
            setError('Por favor, preencha todos os campos.');
            setIsSubmitting(false);
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError('As senhas não coincidem.');
            setIsSubmitting(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('A senha deve ter no mínimo 8 caracteres.');
            setIsSubmitting(false);
            return;
        }

        try {
            await register(
                formData.name.trim(),
                formData.email.trim(),
                formData.password,
                formData.password_confirmation
            );
            // O redirecionamento será feito pelo AuthContext para a tela de login
        } catch (error) {
            console.error('Erro no registro:', error);
            if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Erro ao criar conta. Por favor, tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h1" color="primary" gutterBottom fontWeight={700}>
                    Crie sua conta no Sistema de Vagas
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Nome completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
                error={!!error}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                error={!!error}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Senha"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                error={!!error}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Confirmar senha"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleChange}
                margin="normal"
                required
                error={!!error}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 3 }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                    py: 1.5,
                    mb: 2,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                }}
            >
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Já tem uma conta?{' '}
                    <Link
                        component={RouterLink}
                        to="/auth/login"
                        color="primary"
                        sx={{ fontWeight: 600, textDecoration: 'none' }}
                    >
                        Faça login
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default Register; 