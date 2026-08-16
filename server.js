const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Read API key from .env file (supports API_KEY or VITE_WEATHER_API_KEY)
function getApiKeyFromEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return '';
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/(?:VITE_WEATHER_API_KEY|API_KEY)\s*=\s*["']?([^"'\r\n]+)["']?/);
  return match ? match[1].trim() : '';
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/Index.html';

  // Dynamically serve config.js from .env
  if (reqUrl === '/config.js') {
    const apiKey = getApiKeyFromEnv();
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(`const apiKey = "${apiKey}";\n`);
    return;
  }

  const filePath = path.join(__dirname, reqUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n🚀 Weather App Server is running!`);
    console.log(`👉 Open in your browser: http://localhost:${port}\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying http://localhost:${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
