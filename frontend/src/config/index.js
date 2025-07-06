const config = {
  // API
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  baseUrl: process.env.REACT_APP_BASE_URL || 'http://localhost:8000',
  
  // Auth
  authTokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  
  // App
  appName: 'Sistema de Gerenciamento de Vagas',
  appDescription: 'Gerenciamento de vagas e candidatos',
  appVersion: '1.0.0',
  company: 'SignoTech',
  
  // Pagination
  defaultPerPage: 20,
  perPageOptions: [5, 10, 20, 50],
  
  // File Upload
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['application/pdf'],
  
  // Date Format
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  
  // Notifications
  notificationDuration: 5000, // 5 seconds
  
  // Routes
  routes: {
    auth: {
      login: '/login',
      register: '/register',
      forgotPassword: '/forgot-password',
      resetPassword: '/reset-password'
    },
    jobs: {
      list: '/jobs',
      new: '/jobs/new',
      edit: (id) => `/jobs/${id}/edit`,
      view: (id) => `/jobs/${id}`
    },
    candidates: {
      list: '/candidates',
      new: '/candidates/new',
      edit: (id) => `/candidates/${id}/edit`,
      view: (id) => `/candidates/${id}`
    }
  },

  perPage: 20,

  apiTimeout: 30000, // 30 segundos
};

export default config; 