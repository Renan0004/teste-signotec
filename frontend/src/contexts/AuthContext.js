import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sanctumApi } from '../services/sanctumApi';
import { useSnackbar } from 'notistack';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await sanctumApi.get('/api/user');
                setUser(response.data);
                if (window.location.pathname.includes('/auth/')) {
                    window.location.href = '/dashboard';
                }
            } else {
                setUser(null);
                if (window.location.pathname.includes('/dashboard')) {
                    window.location.href = '/auth/login';
                }
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            localStorage.removeItem('token');
            setUser(null);
            if (window.location.pathname.includes('/dashboard')) {
                window.location.href = '/auth/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            // Get CSRF token
            await sanctumApi.get('/sanctum/csrf-cookie');
            
            // Attempt login
            const response = await sanctumApi.post('/api/login', { email, password });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                
                window.location.href = '/dashboard';
                
                enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' });
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            let errorMessage = 'Erro ao fazer login. Por favor, tente novamente.';
            
            if (error.response) {
                if (error.response.status === 422) {
                    errorMessage = 'Email ou senha inválidos.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            
            enqueueSnackbar(errorMessage, { variant: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            setLoading(true);
            await sanctumApi.get('/sanctum/csrf-cookie');
            const response = await sanctumApi.post('/api/register', {
                name,
                email,
                password,
                password_confirmation
            });
            
            if (response.data) {
                // Não salva o token nem faz login automático
                enqueueSnackbar('Registro realizado com sucesso! Por favor, faça login.', { 
                    variant: 'success',
                    autoHideDuration: 3000
                });
                // Redireciona para a tela de login
                window.location.href = '/auth/login';
            }
        } catch (error) {
            console.error('Erro ao registrar:', error);
            let errorMessage = 'Erro ao registrar. Por favor, tente novamente.';
            
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            
            enqueueSnackbar(errorMessage, { variant: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await sanctumApi.post('/api/logout');
            localStorage.removeItem('token');
            setUser(null);
            enqueueSnackbar('Logout realizado com sucesso!', { variant: 'success' });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            enqueueSnackbar('Erro ao fazer logout. Por favor, tente novamente.', { variant: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                loading,
                login,
                logout,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export default AuthContext; 