const fs = require('fs');
const path = require('path');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.xml': 'application/xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.tiff': 'image/tiff',
    '.bmp': 'image/bmp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function parseRange(rangeStr, fileSize) {
  const range = rangeStr.replace('bytes=', '');
  const parts = range.split('-');
  
  if (parts.length !== 2) {
    return null;
  }

  let start, end;

  if (parts[0] === '' && parts[1] === '') {
    start = 0;
    end = fileSize - 1;
  } else if (parts[0] === '') {
    end = parseInt(parts[1], 10);
    if (end >= fileSize) {
      start = 0;
      end = fileSize - 1;
    } else {
      start = fileSize - end - 1;
      end = fileSize - 1;
    }
  } else if (parts[1] === '') {
    start = parseInt(parts[0], 10);
    end = fileSize - 1;
  } else {
    start = parseInt(parts[0], 10);
    end = parseInt(parts[1], 10);
  }

  if (isNaN(start) || isNaN(end) || start > end || start >= fileSize) {
    return null;
  }

  return { start, end: Math.min(end, fileSize - 1) };
}

function handleFileRequest(req, res) {
  const urlPath = decodeURIComponent(req.url.substring(1));
  const filePath = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
  const mimeType = getMimeType(filePath);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    });
    res.end();
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`File not found: ${filePath} - ${err.message}`);
      return;
    }

    const fileSize = stats.size;
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const range = parseRange(rangeHeader, fileSize);
      
      if (!range) {
        res.writeHead(416, { 'Content-Type': 'text/plain' });
        res.end(`Range Not Satisfiable: ${rangeHeader}`);
        return;
      }

      const contentLength = range.end - range.start + 1;
      const stream = fs.createReadStream(filePath, { start: range.start, end: range.end });

      res.writeHead(206, {
        'Content-Type': mimeType,
        'Content-Length': contentLength,
        'Content-Range': `bytes ${range.start}-${range.end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      });

      res.on('close', () => {
        stream.destroy();
      });

      stream.pipe(res);
    } else {
      const stream = fs.createReadStream(filePath);

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      });

      res.on('close', () => {
        stream.destroy();
      });

      stream.pipe(res);
    }
  });
}

function createFileRouter() {
  return (req, res) => {
    handleFileRequest(req, res);
  };
}

module.exports = {
  createFileRouter,
  handleFileRequest,
  getMimeType,
  parseRange,
};
