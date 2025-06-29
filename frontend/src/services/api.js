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
    if (error.response) {
      console.error('Dados da resposta de erro:', error.response.data);
      console.error('Status da resposta de erro:', error.response.status);
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
    } else {
      console.error('Erro de configuração:', error.message);
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

// Serviços de autenticação - login, registro, logout e obtenção de usuário
export const authService = {
  // Login de usuário
  login: (credentials) => {
    console.log('Fazendo login na URL:', `${api.defaults.baseURL}/api/login`);
    return api.post('/api/login', credentials);
  },
  // Registro de novo usuário
  register: (userData) => {
    console.log('Registrando na URL:', `${api.defaults.baseURL}/api/register`);
    return api.post('/api/register', userData);
  },
  // Registro simplificado (contorna problemas de CORS)
  registerSimple: (userData) => {
    console.log('Registrando na URL simplificada:', `${api.defaults.baseURL}/api/register-simple`);
    // Usar fetch diretamente em vez do axios
    return directRequest('http://localhost:8000/api/register-simple', 'POST', userData);
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
  registerPHP: (userData) => {
    console.log('Registrando usando PHP direto:', 'http://localhost:8000/register_direct.php');
    return fetch('http://localhost:8000/register_direct.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.status);
      }
      return response.json();
    });
  },
  // Logout do usuário atual
  logout: () => api.post('/api/logout'),
  // Obter dados do usuário autenticado
  getUser: () => api.get('/api/user'),
};

// Serviços de vagas - CRUD e operações específicas
export const jobService = {
  // Listar todas as vagas com paginação e filtros
  getAll: (page = 1, perPage = 20, filters = {}, sort = {}) => 
    axios.get('http://localhost:8000/jobs.php', { params: { page, perPage, ...filters, ...sort } }),
  // Obter detalhes de uma vaga específica
  get: (id) => axios.get(`http://localhost:8000/job_detail.php?id=${id}`),
  // Criar nova vaga
  create: (data) => axios.post('http://localhost:8000/job_create.php', data),
  // Atualizar uma vaga existente
  update: (id, data) => axios.post(`http://localhost:8000/job_update.php?id=${id}`, data),
  // Excluir uma vaga
  delete: (id) => axios.post(`http://localhost:8000/job_delete.php?id=${id}`),
  // Excluir múltiplas vagas de uma vez
  bulkDelete: (ids) => axios.post('http://localhost:8000/job_bulk_delete.php', { ids }),
  // Alternar status da vaga (ativa/inativa)
  toggleStatus: (id) => axios.post(`http://localhost:8000/job_toggle_status.php?id=${id}`),
};

// Serviços de candidatos - CRUD e operações específicas
export const candidateService = {
  // Listar todos os candidatos com paginação e filtros
  getAll: (page = 1, perPage = 20, filters = {}, sort = {}) => 
    axios.get('http://localhost:8000/candidates.php', { params: { page, perPage, ...filters, ...sort } }),
  // Obter detalhes de um candidato específico
  get: (id) => axios.get(`http://localhost:8000/candidate_detail.php?id=${id}`),
  // Criar novo candidato
  create: (data) => axios.post('http://localhost:8000/candidate_create.php', data),
  // Atualizar um candidato existente
  update: (id, data) => axios.post(`http://localhost:8000/candidate_update.php?id=${id}`, data),
  // Excluir um candidato
  delete: (id) => axios.post(`http://localhost:8000/candidate_delete.php?id=${id}`),
  // Excluir múltiplos candidatos de uma vez
  bulkDelete: (ids) => axios.post('http://localhost:8000/candidate_bulk_delete.php', { ids }),
  // Candidatar-se a uma vaga
  applyToJob: (candidateId, jobId) => axios.post(`http://localhost:8000/candidate_apply.php`, { candidate_id: candidateId, job_id: jobId }),
  // Remover candidatura de uma vaga
  removeFromJob: (candidateId, jobId) => axios.post(`http://localhost:8000/candidate_remove.php`, { candidate_id: candidateId, job_id: jobId }),
  // Obter vagas de um candidato
  getJobs: (candidateId) => axios.get(`http://localhost:8000/candidate_jobs.php?id=${candidateId}`),
};

export default api;