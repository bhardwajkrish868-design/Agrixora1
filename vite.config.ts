import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function databasePlugin() {
  const DB_FILE = path.resolve(__dirname, 'data', 'farm2future_db.json');

  const ensureDb = () => {
    const dataDir = path.resolve(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        users: [],
        listings: [],
        orders: [],
        notifications: [],
        activityHistory: [],
        adminPasskey: 'Krish0386',
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    }
  };

  const readDb = () => {
    ensureDb();
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return {
        users: [],
        listings: [],
        orders: [],
        notifications: [],
        activityHistory: [],
        adminPasskey: 'Krish0386',
        lastUpdated: new Date().toISOString()
      };
    }
  };

  const writeDb = (data: any) => {
    ensureDb();
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  };

  return {
    name: 'farm2future-database-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (url === '/api/db' && req.method === 'GET') {
          const db = readDb();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(db));
          return;
        }

        if (url === '/api/db/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
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
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, db: updatedDb }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (url === '/api/db/history' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
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
              if (currentDb.activityHistory.length > 1000) {
                currentDb.activityHistory = currentDb.activityHistory.slice(0, 1000);
              }
              writeDb(currentDb);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, log: fullLog }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (url === '/api/db/history' && req.method === 'GET') {
          const db = readDb();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(db.activityHistory || []));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), databasePlugin()],
  base: './',
  server: {
    port: 5173,
    host: true
  }
});
