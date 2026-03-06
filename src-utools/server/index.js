const http = require('http');
const { createFileRouter } = require('./file_handler');
const { createWebDavRouter } = require('./webdav_handler');
const { createProxyRouter } = require('./proxy_handler');

let serverPort = 0;
let server = null;

function setupServer() {
  if (server) {
    return serverPort;
  }

  const fileRouter = createFileRouter();
  const webDavRouter = createWebDavRouter();
  const proxyRouter = createProxyRouter();

  server = http.createServer((req, res) => {
    const url = req.url;
    
    if (url.startsWith('/file/')) {
      req.url = url.substring(5);
      fileRouter(req, res);
    } else if (url.startsWith('/webdav/')) {
      req.url = url.substring(7);
      webDavRouter(req, res);
    } else if (url.startsWith('/proxy/')) {
      req.url = url.substring(6);
      proxyRouter(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    serverPort = address.port;
    console.log(`HTTP server started on port ${serverPort}`);
  });

  return serverPort;
}

function getServerPort() {
  return serverPort;
}

function stopServer() {
  if (server) {
    server.close(() => {
      server = null;
      serverPort = 0;
      console.log('HTTP server stopped');
    });
  }
}

module.exports = {
  setupServer,
  getServerPort,
  stopServer,
};