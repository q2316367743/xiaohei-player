const http = require('http');
const https = require('https');
const { URL } = require('url');

function base64Encode(data) {
  return Buffer.from(data).toString('base64');
}

function parseAuthType(type) {
  const authTypes = {
    'auto': 'auto',
    'digest': 'digest',
    'none': 'none',
    'password': 'password',
    'token': 'token',
  };
  return authTypes[type?.toLowerCase()] || 'auto';
}

function handleWebDavRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = url.searchParams;

  const targetUrl = query.get('url');
  const username = query.get('username');
  const password = query.get('password');
  const authType = parseAuthType(query.get('type'));

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing required parameter: url');
    return;
  }

  const parsedTargetUrl = new URL(targetUrl);
  const isHttps = parsedTargetUrl.protocol === 'https:';
  const httpModule = isHttps ? https : http;

  const options = {
    hostname: parsedTargetUrl.hostname,
    port: parsedTargetUrl.port || (isHttps ? 443 : 80),
    path: parsedTargetUrl.pathname + parsedTargetUrl.search,
    method: 'GET',
    headers: {},
  };

  switch (authType) {
    case 'password':
    case 'auto':
      if (username && password) {
        const credentials = `${username}:${password}`;
        const encoded = base64Encode(credentials);
        options.headers['Authorization'] = `Basic ${encoded}`;
      }
      break;
    case 'token':
      if (password) {
        options.headers['Authorization'] = `Bearer ${password}`;
      }
      break;
    case 'digest':
      if (username && password) {
        const credentials = `${username}:${password}`;
        const encoded = base64Encode(credentials);
        options.headers['Authorization'] = `Basic ${encoded}`;
      }
      break;
    case 'none':
      break;
  }

  for (const [key, value] of Object.entries(req.headers)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'range' || lowerKey === 'authorization') {
      continue;
    }
    options.headers[key] = value;
  }

  const proxyReq = httpModule.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
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
      res.end(`Failed to fetch WebDAV: ${err.message}`);
    }
  });

  res.on('close', () => {
    proxyReq.destroy();
  });

  proxyReq.end();
}

function createWebDavRouter() {
  return (req, res) => {
    handleWebDavRequest(req, res);
  };
}

module.exports = {
  createWebDavRouter,
  handleWebDavRequest,
  base64Encode,
  parseAuthType,
};
