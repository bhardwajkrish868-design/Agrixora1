const http = require('http');
const https = require('https');
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

function sendFast2Sms(apiKey, phone, message) {
  return new Promise((resolve) => {
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const postData = JSON.stringify({
      route: 'q',
      message: message,
      language: 'english',
      flash: 0,
      numbers: cleanPhone
    });

    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.return === true) {
            resolve({ success: true, provider: 'fast2sms', data: parsed });
          } else {
            resolve({ success: false, provider: 'fast2sms', error: parsed.message || (parsed.detail ? JSON.stringify(parsed.detail) : 'Fast2SMS returned error'), data: parsed });
          }
        } catch (e) {
          resolve({ success: false, provider: 'fast2sms', error: 'Invalid response from Fast2SMS: ' + data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, provider: 'fast2sms', error: e.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false, provider: 'fast2sms', error: 'Fast2SMS connection timed out' });
    });

    req.write(postData);
    req.end();
  });
}

function sendTwilioSms(accountSid, authToken, fromNumber, phone, message) {
  return new Promise((resolve) => {
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const toNumber = '+91' + cleanPhone;
    const postData = new URLSearchParams({
      To: toNumber,
      From: fromNumber,
      Body: message
    }).toString();

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, provider: 'twilio', data: parsed });
          } else {
            resolve({ success: false, provider: 'twilio', error: parsed.message || 'Twilio error', data: parsed });
          }
        } catch (e) {
          resolve({ success: false, provider: 'twilio', error: 'Invalid response from Twilio: ' + data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, provider: 'twilio', error: e.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false, provider: 'twilio', error: 'Twilio connection timed out' });
    });

    req.write(postData);
    req.end();
  });
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

  // SMS Gateway Config - GET
  if (reqPath === '/api/sms/config' && req.method === 'GET') {
    const db = readDb();
    const gateway = db.smsGateway || {};
    const fast2smsKey = gateway.fast2smsApiKey || process.env.FAST2SMS_API_KEY || '';
    const twilioConfig = gateway.twilio || {};
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      configured: Boolean(fast2smsKey || twilioConfig.accountSid),
      provider: fast2smsKey ? 'fast2sms' : (twilioConfig.accountSid ? 'twilio' : 'none'),
      maskedKey: fast2smsKey ? (fast2smsKey.substring(0, 4) + '••••••••' + fast2smsKey.slice(-4)) : ''
    }));
    return;
  }

  // SMS Gateway Config - POST
  if (reqPath === '/api/sms/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const db = readDb();
        if (!db.smsGateway) db.smsGateway = {};
        if (payload.fast2smsApiKey !== undefined) {
          db.smsGateway.fast2smsApiKey = (payload.fast2smsApiKey || '').trim();
        }
        if (payload.twilio !== undefined) {
          db.smsGateway.twilio = payload.twilio;
        }
        writeDb(db);
        const fast2smsKey = db.smsGateway.fast2smsApiKey || process.env.FAST2SMS_API_KEY;
        const twilioConfig = db.smsGateway.twilio || {};
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          success: true,
          configured: Boolean(fast2smsKey || twilioConfig.accountSid),
          provider: fast2smsKey ? 'fast2sms' : (twilioConfig.accountSid ? 'twilio' : 'none')
        }));
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

  // Send SMS Endpoint - POST
  if (reqPath === '/api/send-sms' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const db = readDb();
        const cleanPhone = (payload.phone || '').replace(/\D/g, '').slice(-10);

        if (!cleanPhone || cleanPhone.length !== 10) {
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: false, error: 'Valid 10-digit Indian phone number required' }));
          return;
        }

        const smsText = payload.message || `Successful Granted! Farm2Future Agri-Transport confirmed for vehicle ${payload.vehicleNo || 'MH-15-EG-4412'}. Driver: ${payload.driverName || 'Rameshwar'} (${payload.driverPhone || '+91 98231 44512'}). Fare: Rs ${payload.cost || 4290}.`;

        const fast2smsKey = payload.apiKey || db.smsGateway?.fast2smsApiKey || process.env.FAST2SMS_API_KEY;
        const twilioConfig = db.smsGateway?.twilio;

        let result = null;
        if (fast2smsKey) {
          result = await sendFast2Sms(fast2smsKey, cleanPhone, smsText);
        } else if (twilioConfig && twilioConfig.accountSid && twilioConfig.authToken) {
          result = await sendTwilioSms(twilioConfig.accountSid, twilioConfig.authToken, twilioConfig.fromNumber, cleanPhone, smsText);
        } else {
          result = {
            success: true,
            simulated: true,
            provider: 'simulation',
            message: 'Simulated SMS recorded. For real cellular delivery, provide a Fast2SMS API key or use 1-Click WhatsApp/SMS link.'
          };
        }

        // Record SMS in activity history
        if (!db.activityHistory) db.activityHistory = [];
        db.activityHistory.unshift({
          id: 'sms_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userName: payload.userName || 'SMS Dispatcher',
          userRole: 'system',
          actionType: 'sms_dispatch',
          title: result.simulated ? `Simulated SMS Sent to +91 ${cleanPhone}` : (result.success ? `Real SMS Delivered to +91 ${cleanPhone}` : `SMS Delivery Failed (+91 ${cleanPhone})`),
          description: smsText,
          timestamp: new Date().toISOString(),
          metadata: {
            phone: cleanPhone,
            provider: result.provider,
            simulated: Boolean(result.simulated),
            success: Boolean(result.success),
            vehicleNo: payload.vehicleNo,
            driverName: payload.driverName,
            driverPhone: payload.driverPhone,
            error: result.error || null
          }
        });
        if (db.activityHistory.length > 1000) db.activityHistory = db.activityHistory.slice(0, 1000);
        writeDb(db);

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
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
