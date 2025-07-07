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
    Alert,
    Paper,
    Divider
} from '@mui/material';
import { 
    Visibility, 
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon
} from '@mui/icons-material';
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

    const validatePassword = (password) => {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('A senha deve ter no mínimo 8 caracteres');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('A senha deve conter pelo menos uma letra maiúscula');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('A senha deve conter pelo menos uma letra minúscula');
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push('A senha deve conter pelo menos um número');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('A senha deve conter pelo menos um caractere especial');
        }
        
        return errors;
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

        // Validação de senha forte
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setError(passwordErrors.join('. '));
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
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 450, mx: 'auto' }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="h5" component="h1" color="primary" gutterBottom fontWeight={700}>
                        Crie sua conta no Sistema
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Preencha os dados abaixo para criar sua conta
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
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <PersonIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                    error={!!error}
                    helperText="A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos."
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
                    {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                </Button>

                <Divider sx={{ my: 2 }} />

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
            </Paper>
        </Box>
    );
};

export default Register; 