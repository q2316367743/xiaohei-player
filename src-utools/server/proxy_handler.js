const http = require('http');
const https = require('https');
const { URL } = require('url');

function handleProxyRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = url.pathname.substring(1);
  
  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing target URL');
    return;
  }

  const parsedTargetUrl = new URL(targetUrl);
  const isHttps = parsedTargetUrl.protocol === 'https:';
  const httpModule = isHttps ? https : http;

  const options = {
    hostname: parsedTargetUrl.hostname,
    port: parsedTargetUrl.port || (isHttps ? 443 : 80),
    path: parsedTargetUrl.pathname + parsedTargetUrl.search,
    method: req.method,
    headers: {},
  };

  for (const [key, value] of Object.entries(req.headers)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'host' || lowerKey === 'content-length') {
      continue;
    }
    options.headers[key] = value;
  }

  for (const [key, value] of url.searchParams.entries()) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'host' || lowerKey === 'content-length') {
      continue;
    }
    if (!options.headers[key]) {
      options.headers[key] = value;
    }
  }

  const proxyReq = httpModule.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Range, Content-Type, Authorization';
    headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range, Accept-Ranges';

    res.writeHead(proxyRes.statusCode, headers);

    proxyRes.pipe(res);

    res.on('close', () => {
      proxyReq.destroy();
      proxyRes.destroy();
    });
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`Failed to proxy request: ${err.message}`);
    }
  });

  res.on('close', () => {
    proxyReq.destroy();
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

function createProxyRouter() {
  return (req, res) => {
    handleProxyRequest(req, res);
  };
}

module.exports = {
  createProxyRouter,
  handleProxyRequest,
};
