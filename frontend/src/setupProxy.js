const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: function(proxyReq, req, res) {
        // Log para depuração
        console.log('Proxy request:', req.method, req.path);
      },
      onProxyRes: function(proxyRes, req, res) {
        // Não modificamos os cabeçalhos CORS aqui, pois o backend já está configurado
      }
    })
  );
};