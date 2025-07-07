import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Link,
    Alert,
    Paper,
    Divider
} from '@mui/material';
import { 
    Visibility, 
    VisibilityOff, 
    Email as EmailIcon,
    Lock as LockIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Se já estiver autenticado, redireciona para o dashboard
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            // O redirecionamento será feito pelo AuthContext
        } catch (error) {
            console.error('Erro no login:', error);
            setError(error.response?.data?.message || 'Erro ao fazer login. Por favor, tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError(''); // Limpa o erro quando o usuário começa a digitar
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError(''); // Limpa o erro quando o usuário começa a digitar
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 450, mx: 'auto' }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h1" color="primary" gutterBottom fontWeight={700}>
                    Sistema de Gerenciamento de Vagas
                            </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Entre com suas credenciais para acessar o sistema
                    </Typography>
                        </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

                                    <TextField
                fullWidth
                                        label="E-mail"
                                        type="email"
                value={email}
                onChange={handleEmailChange}
                margin="normal"
                required
                autoComplete="email"
                                        autoFocus
                error={!!error}
                sx={{ mb: 2 }}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
            />

                                    <TextField
                fullWidth
                                        label="Senha"
                                        type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                margin="normal"
                required
                autoComplete="current-password"
                error={!!error}
                    size="small"
                                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockIcon color="action" />
                            </InputAdornment>
                        ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                        py: 1.2,
                    mb: 2,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                    textTransform: 'none',
                        borderRadius: 1,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                            backgroundColor: 'primary.dark',
                    },
                }}
                                >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
                                </Button>

                <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                            Não tem uma conta?{' '}
                    <Link
                        component={RouterLink}
                        to="/auth/register"
                        color="primary"
                        sx={{ fontWeight: 600, textDecoration: 'none' }}
                    >
                        Cadastre-se
                            </Link>
                        </Typography>
            </Box>
            </Paper>
        </Box>
    );
};

export default Login; 