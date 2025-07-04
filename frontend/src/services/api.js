import axios from 'axios';
import config from '../config';

// Criando uma instância do axios para o backend
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Criando uma instância do axios específica para o Sanctum
const sanctumApi = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Se o erro for de autenticação e não estivermos na página de login/registro
    if (error.response?.status === 401 && 
        !window.location.pathname.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }

    // Se for erro de validação (422), formata a mensagem de erro
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      if (errors) {
        // Se houver mensagens de erro específicas, use-as
        const messages = Object.values(errors).flat();
        error.message = messages[0] || 'Email ou senha inválidos';
      } else {
        error.message = error.response.data.message || 'Email ou senha inválidos';
      }
    }

    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      return {
        token: response.access_token,
        user: response.user
      };
    } catch (error) {
      if (error.response?.status === 422) {
        throw new Error(error.message || 'Email ou senha inválidos');
      }
      throw error;
    }
  },

  register: async (data) => {
    try {
      const response = await api.post('/register', data);
      return {
        token: response.access_token,
        user: response.user
      };
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      return await api.post('/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro no logout, vamos limpar os dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  me: async () => {
    try {
      return await api.get('/user');
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password, password_confirmation) => {
    const response = await api.post('/reset-password', {
      token,
      password,
      password_confirmation
    });
    return response.data;
  }
};

export default api;

export const jobsService = {
  list: async (params) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  }
};

// Candidates Service
export const candidatesService = {
  list: async (params) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  create: async (data) => {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const response = await api.post('/candidates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  update: async (id, data) => {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const response = await api.post(`/candidates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },

  downloadResume: async (id) => {
    const response = await api.get(`/candidates/${id}/resume`, {
      responseType: 'blob'
    });
    return response.data;
  }
}; 