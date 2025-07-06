import axios from 'axios';
import config from '../config';

// Instância do axios para o Sanctum (autenticação)
export const sanctumApi = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Instância do axios para a API geral
const api = axios.create({
  baseURL: config.apiUrl,
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
    
    // Adicionar cabeçalho para método DELETE
    if (config.method === 'delete') {
      config.headers['X-HTTP-Method-Override'] = 'DELETE';
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
    return response;
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
      // Get CSRF token first
      await sanctumApi.get('/sanctum/csrf-cookie');
      
      // Then attempt login
      const response = await sanctumApi.post('/api/login', { email, password });
      return {
        token: response.data.token,
        user: response.data.user
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
      // Get CSRF token first
      await sanctumApi.get('/sanctum/csrf-cookie');
      
      const response = await sanctumApi.post('/api/register', data);
      return {
        token: response.data.token,
        user: response.data.user
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
      await sanctumApi.post('/api/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
      const response = await api.get('/api/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    const response = await sanctumApi.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password, password_confirmation) => {
    const response = await sanctumApi.post('/reset-password', {
      token,
      password,
      password_confirmation
    });
    return response.data;
  }
};

export default api;

// Jobs Service
export const jobsService = {
  list: async (params) => {
    const response = await api.get('/jobs', { params });
    return response;
  },

  get: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response;
  },

  create: async (data) => {
    const response = await api.post('/jobs', data);
    return response;
  },

  update: async (id, data) => {
    const response = await api.post(`/jobs/${id}`, {
      ...data,
      _method: 'PUT'
    });
    return response;
  },

  delete: async (id) => {
    const response = await api.post(`/jobs/${id}`, {
      _method: 'DELETE'
    });
    return response;
  }
};

// Candidates Service
export const candidatesService = {
  list: async (params) => {
    const response = await api.get('/candidates', { params });
    return response;
  },

  get: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response;
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
    return response;
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
    return response;
  },

  delete: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response;
  },

  downloadResume: async (id) => {
    const response = await api.get(`/candidates/${id}/resume`, {
      responseType: 'blob'
    });
    return response.data;
  }
}; 