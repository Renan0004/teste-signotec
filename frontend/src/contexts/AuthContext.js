import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useSnackbar } from 'notistack';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          const response = await authService.me();
          setUser(response);
          localStorage.setItem('user', JSON.stringify(response));
          
          if (window.location.pathname.includes('/auth/')) {
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Erro ao verificar usuário:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          if (!window.location.pathname.includes('/auth/')) {
            navigate('/auth/login', { replace: true });
          }
        }
      } else if (savedUser && !token) {
        // Se tiver usuário salvo mas não tiver token, limpa tudo
        localStorage.removeItem('user');
        setUser(null);
        if (!window.location.pathname.includes('/auth/')) {
          navigate('/auth/login', { replace: true });
        }
      } else {
        setUser(null);
        if (!window.location.pathname.includes('/auth/')) {
          navigate('/auth/login', { replace: true });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      if (!window.location.pathname.includes('/auth/')) {
        navigate('/auth/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { token, user } = await authService.login(email, password);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      navigate('/dashboard', { replace: true });
      enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' });
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
      await authService.register({
        name,
        email,
        password,
        password_confirmation
      });
      
      enqueueSnackbar('Registro realizado com sucesso! Por favor, faça login.', { 
        variant: 'success',
        autoHideDuration: 3000
      });
      navigate('/auth/login', { replace: true });
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
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth/login', { replace: true });
      enqueueSnackbar('Logout realizado com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpa os dados locais
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth/login', { replace: true });
      enqueueSnackbar('Erro ao fazer logout, mas você foi desconectado.', { variant: 'warning' });
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