import axios from 'axios';

// Configuração base da API com URL do backend e headers padrão
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 10000
});

console.log('API configurada com baseURL:', api.defaults.baseURL);

// Interceptor para requisições
api.interceptors.request.use(
  config => {
    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Erro na resposta:', error);
    
    // Tratamento específico para diferentes códigos de erro HTTP
    if (error.response) {
      const { status, data } = error.response;
      
      console.error('Dados da resposta de erro:', data);
      console.error('Status da resposta de erro:', status);
      
      // Tratamento para erros de autenticação
      if (status === 401) {
        // Token expirado ou inválido - fazer logout
        localStorage.removeItem('token');
        window.location.href = '/login?session_expired=true';
        return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
      }
      
      // Tratamento para erros de permissão
      if (status === 403) {
        return Promise.reject(new Error('Você não tem permissão para realizar esta ação.'));
      }
      
      // Tratamento para erros de validação
      if (status === 422) {
        const validationErrors = data.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        return Promise.reject(new Error(errorMessages.join(', ')));
      }
      
      // Tratamento para recurso não encontrado
      if (status === 404) {
        return Promise.reject(new Error('O recurso solicitado não foi encontrado.'));
      }
      
      // Erro do servidor
      if (status >= 500) {
        return Promise.reject(new Error('Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.'));
      }
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
      return Promise.reject(new Error('Não foi possível conectar ao servidor. Verifique sua conexão de internet.'));
    } else {
      console.error('Erro de configuração:', error.message);
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Função para fazer requisições diretas sem usar axios
const directRequest = async (url, method, data) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      mode: 'cors'
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const token = localStorage.getItem('token');
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição direta:', error);
    throw error;
  }
};

// Função para lidar com erros de requisição
const handleRequestError = (error) => {
  let errorMessage = 'Ocorreu um erro na requisição.';
  
  if (error.response && error.response.data) {
    if (error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.response.data.error) {
      errorMessage = error.response.data.error;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  console.error('Erro tratado:', errorMessage);
  throw new Error(errorMessage);
};

// Serviços de autenticação - login, registro, logout e obtenção de usuário
export const authService = {
  // Login de usuário
  login: async (credentials) => {
    try {
      console.log('Fazendo login na URL:', `${api.defaults.baseURL}/api/login`);
      return await api.post('/api/login', credentials);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Registro de novo usuário
  register: async (userData) => {
    try {
      console.log('Registrando na URL:', `${api.defaults.baseURL}/api/register`);
      return await api.post('/api/register', userData);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Registro simplificado (contorna problemas de CORS)
  registerSimple: async (userData) => {
    try {
      console.log('Registrando na URL simplificada:', `${api.defaults.baseURL}/api/register-simple`);
      return await directRequest('http://localhost:8000/api/register-simple', 'POST', userData);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Registro direto (sem CSRF e sem validação complexa)
  registerDirect: (userData) => {
    console.log('Registrando na URL direta:', `${api.defaults.baseURL}/api/register-direct`);
    // Usar fetch diretamente com XMLHttpRequest para evitar problemas de CORS
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:8000/api/register-direct', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Erro ao processar resposta do servidor'));
          }
        } else {
          reject(new Error('Erro na requisição: ' + xhr.status));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Erro de rede'));
      };
      
      xhr.send(JSON.stringify(userData));
    });
  },
  
  // Registro usando PHP direto (sem passar pelo Laravel)
  registerPHP: async (userData) => {
    try {
      console.log('Registrando usando PHP direto:', 'http://localhost:8000/register_direct.php');
      const response = await fetch('http://localhost:8000/register_direct.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Logout do usuário atual
  logout: async () => {
    try {
      return await api.post('/api/logout');
    } catch (error) {
      // Mesmo em caso de erro, limpar o token local
      localStorage.removeItem('token');
      return handleRequestError(error);
    }
  },
  
  // Obter dados do usuário autenticado
  getUser: async () => {
    try {
      return await api.get('/api/user');
    } catch (error) {
      return handleRequestError(error);
    }
  },
};

// Serviços de vagas - CRUD e operações específicas
export const jobService = {
  // Listar todas as vagas com paginação e filtros
  getAll: async (page = 1, perPage = 20, filters = {}, sort = {}) => {
    try {
      return await axios.get('http://localhost:8000/jobs.php', { 
        params: { page, perPage, ...filters, ...sort } 
      });
    } catch (error) {
      // Se houver erro, retornar dados simulados para desenvolvimento
      console.error('Erro ao buscar vagas, usando dados simulados:', error);
      
      // Dados simulados para desenvolvimento
      const mockJobs = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Vaga de Teste ${i + 1}`,
        description: 'Descrição da vaga de teste',
        type: ['CLT', 'PJ', 'Freelancer'][Math.floor(Math.random() * 3)],
        requirements: 'Requisitos da vaga de teste',
        active: Math.random() > 0.3,
        created_at: new Date().toISOString(),
        candidates_count: Math.floor(Math.random() * 10)
      }));
      
      return {
        data: {
          data: mockJobs,
          meta: {
            total: 100,
            per_page: perPage,
            current_page: page
          }
        }
      };
    }
  },
  
  // Obter detalhes de uma vaga específica
  get: async (id) => {
    try {
      return await axios.get(`http://localhost:8000/job_detail.php?id=${id}`);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Criar nova vaga
  create: async (data) => {
    try {
      return await axios.post('http://localhost:8000/job_create.php', data);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Atualizar uma vaga existente
  update: async (id, data) => {
    try {
      return await axios.post(`http://localhost:8000/job_update.php?id=${id}`, data);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Excluir uma vaga
  delete: async (id) => {
    try {
      return await axios.post(`http://localhost:8000/job_delete.php?id=${id}`);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Excluir múltiplas vagas de uma vez
  bulkDelete: async (ids) => {
    try {
      return await axios.post('http://localhost:8000/job_bulk_delete.php', { ids });
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Alternar status da vaga (ativa/inativa)
  toggleStatus: async (id) => {
    try {
      return await axios.post(`http://localhost:8000/job_toggle_status.php?id=${id}`);
    } catch (error) {
      return handleRequestError(error);
    }
  },
};

// Serviços de candidatos - CRUD e operações específicas
export const candidateService = {
  // Listar todos os candidatos com paginação e filtros
  getAll: async (page = 1, perPage = 20, filters = {}, sort = {}) => {
    try {
      return await axios.get('http://localhost:8000/candidates.php', { 
        params: { page, perPage, ...filters, ...sort } 
      });
    } catch (error) {
      // Se houver erro, retornar dados simulados para desenvolvimento
      console.error('Erro ao buscar candidatos, usando dados simulados:', error);
      
      // Dados simulados para desenvolvimento
      const mockCandidates = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Candidato Teste ${i + 1}`,
        email: `candidato${i + 1}@teste.com`,
        phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
        resume: 'Resumo do candidato de teste',
        created_at: new Date().toISOString(),
        jobs_count: Math.floor(Math.random() * 5)
      }));
      
      return {
        data: {
          data: mockCandidates,
          meta: {
            total: 100,
            per_page: perPage,
            current_page: page
          }
        }
      };
    }
  },
  
  // Obter detalhes de um candidato específico
  get: async (id) => {
    try {
      return await axios.get(`http://localhost:8000/candidate_detail.php?id=${id}`);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Criar novo candidato
  create: async (data) => {
    try {
      return await axios.post('http://localhost:8000/candidate_create.php', data);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Atualizar um candidato existente
  update: async (id, data) => {
    try {
      return await axios.post(`http://localhost:8000/candidate_update.php?id=${id}`, data);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Excluir um candidato
  delete: async (id) => {
    try {
      return await axios.post(`http://localhost:8000/candidate_delete.php?id=${id}`);
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Excluir múltiplos candidatos de uma vez
  bulkDelete: async (ids) => {
    try {
      return await axios.post('http://localhost:8000/candidate_bulk_delete.php', { ids });
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Candidatar-se a uma vaga
  applyToJob: async (candidateId, jobId) => {
    try {
      return await axios.post(`http://localhost:8000/candidate_apply.php`, { candidate_id: candidateId, job_id: jobId });
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Remover candidatura de uma vaga
  removeFromJob: async (candidateId, jobId) => {
    try {
      return await axios.post(`http://localhost:8000/candidate_remove.php`, { candidate_id: candidateId, job_id: jobId });
    } catch (error) {
      return handleRequestError(error);
    }
  },
  
  // Obter vagas de um candidato
  getJobs: async (candidateId) => {
    try {
      const response = await axios.get(`http://localhost:8000/candidate_jobs.php?id=${candidateId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar vagas do candidato, retornando array vazio:', error);
      return { data: [] };
    }
  },
};

export default api;