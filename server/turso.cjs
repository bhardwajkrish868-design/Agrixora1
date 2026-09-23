const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

let client = null;
let isConnected = false;
let currentUrl = process.env.TURSO_DATABASE_URL || '';
let currentToken = process.env.TURSO_AUTH_TOKEN || '';

async function initTables(c) {
  await c.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      role TEXT NOT NULL,
      location TEXT,
      district TEXT,
      state TEXT,
      aadhaar_number TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      farmer_name TEXT,
      crop_name TEXT NOT NULL,
      category TEXT,
      quantity REAL,
      unit TEXT,
      price_per_unit REAL,
      status TEXT DEFAULT 'Active',
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      crop_name TEXT,
      quantity REAL,
      total_amount REAL,
      buyer_id TEXT,
      farmer_id TEXT,
      current_stage TEXT,
      escrow_status TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action_type TEXT,
      title TEXT,
      description TEXT,
      timestamp TEXT,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT,
      message TEXT,
      type TEXT,
      is_read INTEGER DEFAULT 0,
      timestamp TEXT,
      role TEXT,
      data TEXT
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vehicle_number TEXT,
      driver_name TEXT,
      driver_phone TEXT,
      data TEXT
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

async function autoMigrateFromJsonIfEmpty(c) {
  try {
    const jsonPath = path.join(__dirname, '..', 'data', 'farm2future_db.json');
    if (!fs.existsSync(jsonPath)) return;

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const localData = JSON.parse(raw || '{}');

    // Check users
    const userRes = await c.execute('SELECT COUNT(*) as count FROM users');
    const userCount = Number(userRes.rows[0]?.count || 0);

    if (userCount === 0 && Array.isArray(localData.users) && localData.users.length > 0) {
      console.log(`📦 Auto-migrating ${localData.users.length} users to Turso Cloud (9 GB)...`);
      for (const u of localData.users) {
        await c.execute({
          sql: `INSERT OR REPLACE INTO users (id, name, phone, email, role, location, district, state, aadhaar_number, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            u.id,
            u.name || '',
            u.phone || '',
            u.email || '',
            u.role || 'farmer',
            u.location || '',
            u.district || '',
            u.state || '',
            u.aadhaarNumber || '',
            JSON.stringify(u)
          ]
        });
      }
    }

    // Check listings
    const listingRes = await c.execute('SELECT COUNT(*) as count FROM listings');
    const listingCount = Number(listingRes.rows[0]?.count || 0);

    if (listingCount === 0 && Array.isArray(localData.listings) && localData.listings.length > 0) {
      console.log(`📦 Auto-migrating ${localData.listings.length} listings to Turso Cloud...`);
      for (const l of localData.listings) {
        await c.execute({
          sql: `INSERT OR REPLACE INTO listings (id, farmer_id, farmer_name, crop_name, category, quantity, unit, price_per_unit, status, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            l.id,
            l.farmerId || '',
            l.farmerName || '',
            l.cropName || '',
            l.category || '',
            Number(l.quantity) || 0,
            l.unit || 'Quintals',
            Number(l.pricePerUnit) || 0,
            l.status || 'Active',
            JSON.stringify(l)
          ]
        });
      }
    }

    // Check orders
    const orderRes = await c.execute('SELECT COUNT(*) as count FROM orders');
    const orderCount = Number(orderRes.rows[0]?.count || 0);

    if (orderCount === 0 && Array.isArray(localData.orders) && localData.orders.length > 0) {
      console.log(`📦 Auto-migrating ${localData.orders.length} orders to Turso Cloud...`);
      for (const o of localData.orders) {
        await c.execute({
          sql: `INSERT OR REPLACE INTO orders (id, order_number, crop_name, quantity, total_amount, buyer_id, farmer_id, current_stage, escrow_status, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            o.id,
            o.orderNumber || o.id,
            o.cropName || '',
            Number(o.quantity) || 0,
            Number(o.totalAmount) || 0,
            o.buyerId || '',
            o.farmerId || '',
            o.currentStage || 'order_placed',
            o.escrowStatus || 'Funded & Locked',
            JSON.stringify(o)
          ]
        });
      }
    }

    // Check activities
    const actRes = await c.execute('SELECT COUNT(*) as count FROM activities');
    const actCount = Number(actRes.rows[0]?.count || 0);

    if (actCount === 0 && Array.isArray(localData.activityHistory) && localData.activityHistory.length > 0) {
      console.log(`📦 Auto-migrating activities to Turso Cloud...`);
      for (const a of localData.activityHistory.slice(0, 500)) {
        await c.execute({
          sql: `INSERT OR REPLACE INTO activities (id, user_id, user_name, action_type, title, description, timestamp, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            a.id,
            a.userId || '',
            a.userName || '',
            a.actionType || '',
            a.title || '',
            a.description || '',
            a.timestamp || new Date().toISOString(),
            JSON.stringify(a)
          ]
        });
      }
    }

    console.log('🎉 Initial migration to Turso Cloud (9 GB) complete!');
  } catch (err) {
    console.warn('⚠️ Turso auto-migration notice:', err.message);
  }
}

async function connectTurso(customUrl, customToken) {
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });
  } catch (_) {}
  const url = customUrl || process.env.TURSO_DATABASE_URL || currentUrl;
  const authToken = customToken || process.env.TURSO_AUTH_TOKEN || currentToken;

  if (!url) {
    return { success: false, message: 'No Turso Database URL configured.' };
  }

  try {
    console.log('🔄 Connecting to Turso Cloud Database (9 GB LibSQL)...');
    const newClient = createClient({
      url,
      authToken: authToken || undefined
    });

    await initTables(newClient);
    await autoMigrateFromJsonIfEmpty(newClient);

    client = newClient;
    isConnected = true;
    currentUrl = url;
    currentToken = authToken;

    console.log('✅ Connected to Turso Cloud Database successfully!');
    return {
      success: true,
      message: 'Connected to Turso Cloud Database (9 GB) successfully!',
      url: url.replace(/:\/\/([^@]+)@/, '://****@'),
      provider: 'turso_cloud'
    };
  } catch (err) {
    isConnected = false;
    console.error('❌ Turso Cloud Connection Error:', err.message);
    return { success: false, error: err.message };
  }
}

async function getAllTursoData() {
  if (!isConnected || !client) return null;

  try {
    const [userRes, listingRes, orderRes, actRes, notifRes, vehRes, settingRes] = await Promise.all([
      client.execute('SELECT data FROM users ORDER BY updated_at DESC'),
      client.execute('SELECT data FROM listings ORDER BY updated_at DESC'),
      client.execute('SELECT data FROM orders ORDER BY updated_at DESC'),
      client.execute('SELECT data FROM activities ORDER BY created_at DESC LIMIT 500'),
      client.execute('SELECT data FROM notifications ORDER BY timestamp DESC LIMIT 100'),
      client.execute('SELECT data FROM vehicles'),
      client.execute("SELECT value FROM settings WHERE key = 'adminPasskey'")
    ]);

    const users = userRes.rows.map(r => JSON.parse(r.data));
    const listings = listingRes.rows.map(r => JSON.parse(r.data));
    const orders = orderRes.rows.map(r => JSON.parse(r.data));
    const activityHistory = actRes.rows.map(r => JSON.parse(r.data));
    const notifications = notifRes.rows.map(r => JSON.parse(r.data));
    const vehicles = vehRes.rows.map(r => JSON.parse(r.data));
    const adminPasskey = settingRes.rows[0]?.value || 'Krish0386';

    return {
      users,
      listings,
      orders,
      activityHistory,
      notifications,
      vehicles,
      adminPasskey,
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error fetching data from Turso:', err.message);
    return null;
  }
}

async function saveTursoOrder(order) {
  if (!isConnected || !client) return null;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO orders (id, order_number, crop_name, quantity, total_amount, buyer_id, farmer_id, current_stage, escrow_status, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        order.id,
        order.orderNumber || order.id,
        order.cropName || '',
        Number(order.quantity) || 0,
        Number(order.totalAmount) || 0,
        order.buyerId || '',
        order.farmerId || '',
        order.currentStage || 'order_placed',
        order.escrowStatus || 'Funded & Locked',
        JSON.stringify(order)
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving order to Turso:', err.message);
    return false;
  }
}

async function updateTursoOrder(orderId, updates) {
  if (!isConnected || !client) return null;
  try {
    // Fetch existing
    const res = await client.execute({
      sql: 'SELECT data FROM orders WHERE id = ? OR order_number = ? LIMIT 1',
      args: [orderId, orderId]
    });
    if (res.rows.length === 0) return false;

    const existing = JSON.parse(res.rows[0].data);
    const updated = { ...existing, ...updates };

    await client.execute({
      sql: `UPDATE orders SET current_stage = ?, escrow_status = ?, data = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? OR order_number = ?`,
      args: [
        updated.currentStage || existing.currentStage,
        updated.escrowStatus || existing.escrowStatus,
        JSON.stringify(updated),
        orderId,
        orderId
      ]
    });
    return true;
  } catch (err) {
    console.error('Error updating order in Turso:', err.message);
    return false;
  }
}

async function saveTursoUser(user) {
  if (!isConnected || !client) return null;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO users (id, name, phone, email, role, location, district, state, aadhaar_number, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.id,
        user.name || '',
        user.phone || '',
        user.email || '',
        user.role || 'farmer',
        user.location || '',
        user.district || '',
        user.state || '',
        user.aadhaarNumber || '',
        JSON.stringify(user)
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving user to Turso:', err.message);
    return false;
  }
}

async function saveTursoListing(listing) {
  if (!isConnected || !client) return null;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO listings (id, farmer_id, farmer_name, crop_name, category, quantity, unit, price_per_unit, status, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        listing.id,
        listing.farmerId || '',
        listing.farmerName || '',
        listing.cropName || '',
        listing.category || '',
        Number(listing.quantity) || 0,
        listing.unit || 'Quintals',
        Number(listing.pricePerUnit) || 0,
        listing.status || 'Active',
        JSON.stringify(listing)
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving listing to Turso:', err.message);
    return false;
  }
}

module.exports = {
  connectTurso,
  getIsConnected: () => isConnected,
  getTursoUrl: () => currentUrl ? currentUrl.replace(/:\/\/([^@]+)@/, '://****@') : '',
  getAllTursoData,
  saveTursoOrder,
  updateTursoOrder,
  saveTursoUser,
  saveTursoListing
};
