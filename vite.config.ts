import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import https from 'https';

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

  const sendFast2Sms = (apiKey: string, phone: string, message: string): Promise<any> => {
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
  };

  const sendTwilioSms = (accountSid: string, authToken: string, fromNumber: string, phone: string, message: string): Promise<any> => {
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
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
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

        // SMS Config - GET
        if (url === '/api/sms/config' && req.method === 'GET') {
          const db = readDb();
          const gateway = db.smsGateway || {};
          const fast2smsKey = gateway.fast2smsApiKey || process.env.FAST2SMS_API_KEY || '';
          const twilioConfig = gateway.twilio || {};
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({
            configured: Boolean(fast2smsKey || twilioConfig.accountSid),
            provider: fast2smsKey ? 'fast2sms' : (twilioConfig.accountSid ? 'twilio' : 'none'),
            maskedKey: fast2smsKey ? (fast2smsKey.substring(0, 4) + '••••••••' + fast2smsKey.slice(-4)) : ''
          }));
          return;
        }

        // SMS Config - POST
        if (url === '/api/sms/config' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
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
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                configured: Boolean(fast2smsKey || twilioConfig.accountSid),
                provider: fast2smsKey ? 'fast2sms' : (twilioConfig.accountSid ? 'twilio' : 'none')
              }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // Send SMS - POST
        if (url === '/api/send-sms' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const db = readDb();
              const cleanPhone = (payload.phone || '').replace(/\D/g, '').slice(-10);

              if (!cleanPhone || cleanPhone.length !== 10) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Valid 10-digit Indian phone number required' }));
                return;
              }

              const smsText = payload.message || `Successful Granted! Farm2Future Agri-Transport confirmed for vehicle ${payload.vehicleNo || 'MH-15-EG-4412'}. Driver: ${payload.driverName || 'Rameshwar'} (${payload.driverPhone || '+91 98231 44512'}). Fare: Rs ${payload.cost || 4290}.`;

              const fast2smsKey = payload.apiKey || db.smsGateway?.fast2smsApiKey || process.env.FAST2SMS_API_KEY;
              const twilioConfig = db.smsGateway?.twilio;

              let result: any = null;
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

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
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
