const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (process.argv[2] ? parseInt(process.argv[2], 10) : 3000);
const ROLE_NAME = process.argv[3] || (PORT === 3001 ? 'Farmer' : 'Institutional Buyer');
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const DB_FILE = path.join(__dirname, 'data', 'farm2future_db.json');

// Ensure data folder and db file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
function getInitialDb() {
  return {
    users: [],
    listings: [],
    orders: [],
    notifications: [],
    activityHistory: [],
    adminPasskey: "Krish0386",
    lastUpdated: new Date().toISOString()
  };
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(getInitialDb(), null, 2), 'utf-8');
}

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return getInitialDb();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    if (!raw || !raw.trim()) {
      return getInitialDb();
    }
    return JSON.parse(raw);
  } catch (err) {
    return getInitialDb();
  }
}

function writeDb(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Error writing DB:', e);
      return false;
    }
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const reqPath = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // API Endpoints
  if (reqPath === '/api/db' && req.method === 'GET') {
    const db = readDb();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(db));
    return;
  }

  if (reqPath === '/api/db/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const currentDb = readDb();
        const updatedDb = {
          ...currentDb,
          ...payload,
          adminPasskey: payload.adminPasskey || currentDb.adminPasskey || 'Krish0386'
        };
        writeDb(updatedDb);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, db: updatedDb }));
      } catch (err) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (reqPath === '/api/db/history' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const logEntry = JSON.parse(body || '{}');
        const currentDb = readDb();
        if (!currentDb.activityHistory) currentDb.activityHistory = [];
        
        const fullLog = {
          id: logEntry.id || 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          userId: logEntry.userId,
          userName: logEntry.userName,
          userRole: logEntry.userRole,
          actionType: logEntry.actionType || 'navigation',
          title: logEntry.title || 'Platform Activity',
          description: logEntry.description || '',
          timestamp: logEntry.timestamp || new Date().toISOString(),
          metadata: logEntry.metadata || {}
        };

        currentDb.activityHistory.unshift(fullLog);
        // Keep last 1000 activity logs
        if (currentDb.activityHistory.length > 1000) {
          currentDb.activityHistory = currentDb.activityHistory.slice(0, 1000);
        }
        writeDb(currentDb);

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, log: fullLog }));
      } catch (err) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (reqPath === '/api/db/history' && req.method === 'GET') {
    const db = readDb();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(db.activityHistory || []));
    return;
  }

  // Static File Serving
  if (PORT === 3001 && reqPath === '/' && !parsedUrl.searchParams.has('role')) {
    res.writeHead(302, { 'Location': '/?role=farmer' });
    res.end();
    return;
  }

  let staticPath = reqPath === '/' ? '/index.html' : reqPath;
  let filePath = path.join(DIST, staticPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error: ' + err.code);
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Standalone ${ROLE_NAME} HTTP & API Server live at: http://localhost:${PORT}/`);
});
