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
      // Obter o token antes de fazer o logout
      const token = localStorage.getItem('token');
      
      // Verificar se há um token antes de tentar fazer logout no servidor
      if (token) {
        // Usar a instância api que já tem o interceptor para adicionar o token
        await api.post('/logout');
      }
      
      // Limpar dados locais independentemente do resultado da requisição
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
      // Corrigido para usar a URL correta sem duplicar o prefixo 'api'
      const response = await api.get('/user');
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
    try {
      console.log('CandidatesService.create - Dados recebidos:', data);
      
      // Preparar dados para envio
      const formData = new FormData();
      
      // Adicionar campos básicos
      formData.append('name', data.name || '');
      formData.append('email', data.email || '');
      formData.append('phone', data.phone || '');
      
      if (data.linkedin) {
        formData.append('linkedin_url', data.linkedin);
      }
      
      if (data.description) {
        formData.append('bio', data.description);
      }
      
      // Adicionar experiências como JSON
      if (data.experiences) {
        // Se já for uma string JSON, use-a diretamente
        if (typeof data.experiences === 'string') {
          try {
            // Verifica se é um JSON válido
            JSON.parse(data.experiences);
            formData.append('experiences', data.experiences);
            console.log('Experiências enviadas como string JSON:', data.experiences);
          } catch (e) {
            console.error('String de experiências inválida:', e);
            formData.append('experiences', '[]');
          }
        } else if (Array.isArray(data.experiences) && data.experiences.length > 0) {
          // Se for um array, converta para string JSON
          const validExperiences = data.experiences.filter(exp => 
            exp.company || exp.position || exp.description || exp.period
          );
          
          if (validExperiences.length > 0) {
            // Garantir que todos os campos sejam strings para evitar problemas
            const sanitizedExperiences = validExperiences.map(exp => ({
              company: String(exp.company || ''),
              position: String(exp.position || ''),
              description: String(exp.description || ''),
              period: String(exp.period || '')
            }));
            
            // Garantir que seja uma string JSON válida
            formData.append('experiences', JSON.stringify(sanitizedExperiences));
            console.log('Experiências enviadas:', JSON.stringify(sanitizedExperiences));
          } else {
            formData.append('experiences', '[]');
          }
        } else {
          formData.append('experiences', '[]');
        }
      } else {
        formData.append('experiences', '[]');
      }
      
      // Adicionar vagas selecionadas
      if (data.job_ids && data.job_ids.length > 0) {
        data.job_ids.forEach(jobId => {
          formData.append('job_ids[]', jobId);
        });
      }
      
      // Adicionar currículo se fornecido
      if (data.resume && data.resume instanceof File) {
        formData.append('resume', data.resume);
      }
      
      // Log para debug
      console.log('Enviando dados para a API:', {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        experiences: formData.get('experiences'),
        job_ids: formData.getAll('job_ids[]')
      });
      
      const response = await api.post('/candidates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response;
    } catch (error) {
      console.error('Erro na requisição create:', error);
      console.error('Detalhes do erro:', error.response?.data);
      
      // Se for erro de validação, formata a resposta para ser mais útil
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        error.validationErrors = validationErrors;
      }
      
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log('CandidatesService.update - Dados recebidos:', data);
      console.log('Atualizando candidato ID:', id);
      
      // Preparar dados para envio
      const formData = new FormData();
      
      // Adicionar método PUT
      formData.append('_method', 'PUT');
      
      // Adicionar campos básicos
      formData.append('name', data.name || '');
      formData.append('email', data.email || '');
      formData.append('phone', data.phone || '');
      
      if (data.linkedin) {
        formData.append('linkedin_url', data.linkedin);
      }
      
      if (data.description) {
        formData.append('bio', data.description);
      }
      
      // Adicionar experiências como JSON
      if (data.experiences) {
        // Se já for uma string JSON, use-a diretamente
        if (typeof data.experiences === 'string') {
          try {
            // Verifica se é um JSON válido
            JSON.parse(data.experiences);
            formData.append('experiences', data.experiences);
            console.log('Experiências enviadas como string JSON:', data.experiences);
          } catch (e) {
            console.error('String de experiências inválida:', e);
            formData.append('experiences', '[]');
          }
        } else if (Array.isArray(data.experiences) && data.experiences.length > 0) {
          // Se for um array, filtra e converte para string JSON
          const validExperiences = data.experiences.filter(exp => 
            exp.company || exp.position || exp.description || exp.period
          );
          
          if (validExperiences.length > 0) {
            // Garantir que todos os campos sejam strings para evitar problemas
            const sanitizedExperiences = validExperiences.map(exp => ({
              company: String(exp.company || ''),
              position: String(exp.position || ''),
              description: String(exp.description || ''),
              period: String(exp.period || '')
            }));
            
            // Garantir que seja uma string JSON válida
            formData.append('experiences', JSON.stringify(sanitizedExperiences));
            console.log('Experiências enviadas:', JSON.stringify(sanitizedExperiences));
          } else {
            formData.append('experiences', '[]');
          }
        } else {
          formData.append('experiences', '[]');
        }
      } else {
        formData.append('experiences', '[]');
      }
      
      // Adicionar vagas selecionadas
      if (data.job_ids && data.job_ids.length > 0) {
        data.job_ids.forEach(jobId => {
          formData.append('job_ids[]', jobId);
        });
      } else {
        // Adicionar pelo menos uma vaga (a primeira disponível) para passar a validação
        formData.append('job_ids[]', 1);
      }
      
      console.log('Enviando dados para atualização');
      
      const response = await api.post(`/candidates/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Resposta da API:', response);
      return response;
    } catch (error) {
      console.error('Erro na requisição update:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log('CandidatesService.delete - Excluindo candidato ID:', id);
      
      // Usar POST com _method: 'DELETE' para evitar problemas de CORS
      const response = await api.post(`/candidates/${id}`, {
        _method: 'DELETE'
      });
      
      console.log('Resposta da API após exclusão:', response);
      return response;
    } catch (error) {
      console.error('Erro na requisição delete:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      throw error;
    }
  },

  downloadResume: async (id) => {
    const response = await api.get(`/candidates/${id}/resume`, {
      responseType: 'blob'
    });
    return response.data;
  }
}; 