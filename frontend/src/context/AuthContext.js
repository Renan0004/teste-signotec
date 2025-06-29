import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    console.log('AuthContext inicializado, token existe?', !!token);
    
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      console.log('Carregando informações do usuário...');
      
      // Verificar se o token existe
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      // Fazer requisição para obter informações do usuário
      const response = await axios.post('http://localhost:8000/get_user.php', { token }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Informações do usuário carregadas com sucesso:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      setError('Falha ao carregar informações do usuário');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Tentando fazer login com:', credentials);
      
      // Usar axios diretamente para o arquivo login_direct.php
      const response = await axios.post('http://localhost:8000/login_direct.php', credentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Resposta do login direto:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Salvar o token e definir o usuário
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return true;
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Falha na autenticação';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Enviando dados de registro:', userData);
      
      // Usar axios diretamente em vez de fetch
      console.log('Tentando registro com axios');
      const response = await axios.post('http://localhost:8000/register_direct.php', userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Resposta do registro:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Não salvar o token e não definir o usuário após o registro
      // localStorage.setItem('token', response.data.token);
      // setUser(response.data.user);
      
      return true;
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError(err.message || 'Falha ao registrar. Verifique sua conexão.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('Fazendo logout...');
      
      // Remover o token do localStorage
      localStorage.removeItem('token');
      setUser(null);
      
      console.log('Logout realizado com sucesso');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;