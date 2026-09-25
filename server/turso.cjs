const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DEFAULT_TURSO_URL = 'libsql://farm2future-krish-x97.aws-ap-south-1.turso.io';
const DEFAULT_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAxOTA4NjcsImlkIjoiMDFhMGNmYWYtZTgwMS03ZDUzLThhZTctMTlhNTMyMTA5NmU1Iiwia2lkIjoiNGkwXzg1Sy1TeVJ0Qkd2N0JwdlAwYnVJbExxd1NMZnBsQm4tbVpVUjdrVSIsInJpZCI6IjM0OTkwMzRhLWZjM2YtNGQ4Mi04MGQ5LTgyMGI4YmZkN2I2MSJ9.wDlnSuNtURvzEU7yCCADNul-QQiM2SxiCABaEig0EDrY6R9yQmWMNYcr56295_O1KE-mic8WvR3a4gMpjYVwBw';

let client = null;
let isConnected = false;
let currentUrl = process.env.TURSO_DATABASE_URL || DEFAULT_TURSO_URL;
let currentToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;

const deletedItemIds = new Set();

async function initTables(c) {
  await c.execute(`
    CREATE TABLE IF NOT EXISTS deleted_items (
      id TEXT PRIMARY KEY,
      type TEXT,
      deleted_at TEXT
    );
  `);
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

  await c.execute(`
    CREATE TABLE IF NOT EXISTS bulk_demands (
      id TEXT PRIMARY KEY,
      demand_number TEXT,
      buyer_id TEXT,
      crop_name TEXT,
      target_quantity_tons REAL,
      committed_quantity_tons REAL,
      price_per_ton REAL,
      status TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    // Check bulkDemands
    const bulkRes = await c.execute('SELECT COUNT(*) as count FROM bulk_demands');
    const bulkCount = Number(bulkRes.rows[0]?.count || 0);

    if (bulkCount === 0 && Array.isArray(localData.bulkDemands) && localData.bulkDemands.length > 0) {
      console.log(`📦 Auto-migrating ${localData.bulkDemands.length} bulk demands to Turso Cloud...`);
      for (const b of localData.bulkDemands) {
        await c.execute({
          sql: `INSERT OR REPLACE INTO bulk_demands (id, demand_number, buyer_id, crop_name, target_quantity_tons, committed_quantity_tons, price_per_ton, status, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            b.id,
            b.demandNumber || '',
            b.buyerId || '',
            b.cropName || '',
            Number(b.targetQuantityTons) || 0,
            Number(b.committedQuantityTons) || 0,
            Number(b.pricePerTon) || 0,
            b.status || 'Open for Contributions',
            JSON.stringify(b)
          ]
        });
      }
    }

    // Check vehicles
    const vehRes = await c.execute('SELECT COUNT(*) as count FROM vehicles');
    const vehCount = Number(vehRes.rows[0]?.count || 0);

    if (vehCount === 0 && Array.isArray(localData.vehicles) && localData.vehicles.length > 0) {
      console.log(`📦 Auto-migrating ${localData.vehicles.length} vehicles to Turso Cloud...`);
      for (const v of localData.vehicles) {
        await c.execute({
          sql: `INSERT OR REPLACE INTO vehicles (id, vehicle_number, driver_name, driver_phone, data)
                VALUES (?, ?, ?, ?, ?)`,
          args: [
            v.id || v.vehicleNo,
            v.vehicleNo || v.vehicle_number || '',
            v.driverName || '',
            v.driverPhone || '',
            JSON.stringify(v)
          ]
        });
      }
    }

    // Check notifications
    const notifRes = await c.execute('SELECT COUNT(*) as count FROM notifications');
    const notifCount = Number(notifRes.rows[0]?.count || 0);

    if (notifCount === 0 && Array.isArray(localData.notifications) && localData.notifications.length > 0) {
      console.log(`📦 Auto-migrating ${localData.notifications.length} notifications to Turso Cloud...`);
      for (const n of localData.notifications.slice(0, 100)) {
        await c.execute({
          sql: `INSERT OR REPLACE INTO notifications (id, title, message, type, is_read, timestamp, role, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            n.id,
            n.title || '',
            n.message || '',
            n.type || 'info',
            n.read ? 1 : 0,
            n.timestamp || new Date().toISOString(),
            n.recipientRole || n.role || 'all',
            JSON.stringify(n)
          ]
        });
      }
    }

    // Check adminPasskey
    if (localData.adminPasskey) {
      await c.execute({
        sql: `INSERT OR REPLACE INTO settings (key, value) VALUES ('adminPasskey', ?)`,
        args: [String(localData.adminPasskey)]
      });
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
  const url = customUrl || process.env.TURSO_DATABASE_URL || currentUrl || DEFAULT_TURSO_URL;
  const authToken = customToken || process.env.TURSO_AUTH_TOKEN || currentToken || DEFAULT_TURSO_TOKEN;

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

    try {
      const delRes = await newClient.execute('SELECT id FROM deleted_items');
      deletedItemIds.clear();
      delRes.rows.forEach(r => deletedItemIds.add(String(r.id)));
      console.log(`🛡️ Loaded ${deletedItemIds.size} deleted tombstones from Turso Cloud.`);
    } catch (_) {}

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
    const [userRes, listingRes, orderRes, actRes, notifRes, vehRes, settingRes, bulkRes] = await Promise.all([
      client.execute('SELECT data FROM users ORDER BY updated_at DESC'),
      client.execute('SELECT data FROM listings ORDER BY updated_at DESC'),
      client.execute('SELECT data FROM orders ORDER BY updated_at DESC'),
      client.execute('SELECT data FROM activities ORDER BY created_at DESC LIMIT 500'),
      client.execute('SELECT data FROM notifications ORDER BY timestamp DESC LIMIT 100'),
      client.execute('SELECT data FROM vehicles'),
      client.execute("SELECT value FROM settings WHERE key = 'adminPasskey'"),
      client.execute('SELECT data FROM bulk_demands ORDER BY updated_at DESC')
    ]);

    const users = userRes.rows.map(r => JSON.parse(r.data));
    const listings = listingRes.rows.map(r => JSON.parse(r.data)).filter(l => !deletedItemIds.has(l.id));
    const orders = orderRes.rows.map(r => JSON.parse(r.data)).filter(o => !deletedItemIds.has(o.id));
    const activityHistory = actRes.rows.map(r => JSON.parse(r.data));
    const notifications = notifRes.rows.map(r => JSON.parse(r.data));
    const vehicles = vehRes.rows.map(r => JSON.parse(r.data));
    const adminPasskey = settingRes.rows[0]?.value || 'Krish0386';
    const bulkDemands = (bulkRes?.rows || []).map(r => JSON.parse(r.data)).filter(b => !deletedItemIds.has(b.id));

    return {
      users,
      listings,
      orders,
      activityHistory,
      notifications,
      vehicles,
      adminPasskey,
      bulkDemands,
      deletedIds: Array.from(deletedItemIds),
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error fetching data from Turso:', err.message);
    return null;
  }
}

async function saveTursoOrder(order) {
  if (!order || deletedItemIds.has(order.id)) return false;
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
  if (!listing || deletedItemIds.has(listing.id)) return false;
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

async function clearTursoOrders() {
  if (!isConnected || !client) return false;
  try {
    await client.execute('DELETE FROM orders');
    console.log('🗑️ All orders deleted from Turso Cloud Database.');
    return true;
  } catch (err) {
    console.error('Error clearing orders from Turso:', err.message);
    return false;
  }
}

async function clearTursoListings() {
  if (!isConnected || !client) return false;
  try {
    await client.execute('DELETE FROM listings');
    console.log('🗑️ All listings deleted from Turso Cloud Database.');
    return true;
  } catch (err) {
    console.error('Error clearing listings from Turso:', err.message);
    return false;
  }
}

async function deleteTursoUsersByRole(roles) {
  if (!isConnected || !client) return false;
  try {
    const placeholders = roles.map(() => '?').join(',');
    await client.execute({
      sql: `DELETE FROM users WHERE role IN (${placeholders})`,
      args: roles
    });
    console.log(`🗑️ Deleted users with roles [${roles.join(', ')}] from Turso Cloud Database.`);
    return true;
  } catch (err) {
    console.error('Error deleting users by role from Turso:', err.message);
    return false;
  }
}

async function deleteTursoUser(userId) {
  if (!isConnected || !client) return false;
  try {
    await client.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [userId]
    });
    return true;
  } catch (err) {
    console.error('Error deleting user from Turso:', err.message);
    return false;
  }
}

async function saveTursoBulkDemand(demand) {
  if (!demand || deletedItemIds.has(demand.id)) return false;
  if (!isConnected || !client) return null;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO bulk_demands (id, demand_number, buyer_id, crop_name, target_quantity_tons, committed_quantity_tons, price_per_ton, status, data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        demand.id,
        demand.demandNumber || '',
        demand.buyerId || '',
        demand.cropName || '',
        Number(demand.targetQuantityTons) || 0,
        Number(demand.committedQuantityTons) || 0,
        Number(demand.pricePerTon) || 0,
        demand.status || 'Open for Contributions',
        JSON.stringify(demand)
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving bulk demand to Turso:', err.message);
    return false;
  }
}

async function deleteTursoBulkDemand(id) {
  deletedItemIds.add(id);
  if (!isConnected || !client) return false;
  try {
    await client.execute({
      sql: 'DELETE FROM bulk_demands WHERE id = ?',
      args: [id]
    });
    try {
      await client.execute({
        sql: 'INSERT OR REPLACE INTO deleted_items (id, type, deleted_at) VALUES (?, ?, ?)',
        args: [id, 'bulk_demand', new Date().toISOString()]
      });
    } catch (_) {}
    return true;
  } catch (err) {
    console.error('Error deleting bulk demand from Turso:', err.message);
    return false;
  }
}

async function clearTursoBulkDemands() {
  if (!isConnected || !client) return false;
  try {
    await client.execute('DELETE FROM bulk_demands');
    console.log('🗑️ All bulk demands deleted from Turso Cloud Database.');
    return true;
  } catch (err) {
    console.error('Error clearing bulk demands from Turso:', err.message);
    return false;
  }
}

async function saveTursoVehicle(vehicle) {
  if (!isConnected || !client) return null;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO vehicles (id, vehicle_number, driver_name, driver_phone, data)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        vehicle.id || vehicle.vehicleNo,
        vehicle.vehicleNo || vehicle.vehicle_number || '',
        vehicle.driverName || '',
        vehicle.driverPhone || '',
        JSON.stringify(vehicle)
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving vehicle to Turso:', err.message);
    return false;
  }
}

async function deleteTursoVehicle(id) {
  if (!isConnected || !client) return false;
  try {
    await client.execute({
      sql: 'DELETE FROM vehicles WHERE id = ? OR vehicle_number = ?',
      args: [id, id]
    });
    return true;
  } catch (err) {
    console.error('Error deleting vehicle from Turso:', err.message);
    return false;
  }
}

async function clearTursoVehicles() {
  if (!isConnected || !client) return false;
  try {
    await client.execute('DELETE FROM vehicles');
    return true;
  } catch (err) {
    console.error('Error clearing vehicles from Turso:', err.message);
    return false;
  }
}

async function saveTursoNotification(n) {
  if (!isConnected || !client) return null;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO notifications (id, title, message, type, is_read, timestamp, role, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        n.id,
        n.title || '',
        n.message || '',
        n.type || 'info',
        n.read ? 1 : 0,
        n.timestamp || new Date().toISOString(),
        n.recipientRole || n.role || 'all',
        JSON.stringify(n)
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving notification to Turso:', err.message);
    return false;
  }
}

async function clearTursoNotifications() {
  if (!isConnected || !client) return false;
  try {
    await client.execute('DELETE FROM notifications');
    return true;
  } catch (err) {
    console.error('Error clearing notifications from Turso:', err.message);
    return false;
  }
}

async function saveTursoActivity(a) {
  if (!isConnected || !client) return null;
  try {
    await client.execute({
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
    return true;
  } catch (err) {
    console.error('Error saving activity to Turso:', err.message);
    return false;
  }
}

async function saveTursoSetting(key, value) {
  if (!isConnected || !client) return null;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      args: [key, String(value)]
    });
    return true;
  } catch (err) {
    console.error('Error saving setting to Turso:', err.message);
    return false;
  }
}

async function deleteTursoListing(id) {
  deletedItemIds.add(id);
  if (!isConnected || !client) return false;
  try {
    await client.execute({
      sql: 'DELETE FROM listings WHERE id = ?',
      args: [id]
    });
    try {
      await client.execute({
        sql: 'INSERT OR REPLACE INTO deleted_items (id, type, deleted_at) VALUES (?, ?, ?)',
        args: [id, 'listing', new Date().toISOString()]
      });
    } catch (_) {}
    return true;
  } catch (err) {
    console.error('Error deleting listing from Turso:', err.message);
    return false;
  }
}

async function deleteTursoOrder(id) {
  deletedItemIds.add(id);
  if (!isConnected || !client) return false;
  try {
    await client.execute({
      sql: 'DELETE FROM orders WHERE id = ? OR order_number = ?',
      args: [id, id]
    });
    try {
      await client.execute({
        sql: 'INSERT OR REPLACE INTO deleted_items (id, type, deleted_at) VALUES (?, ?, ?)',
        args: [id, 'order', new Date().toISOString()]
      });
    } catch (_) {}
    return true;
  } catch (err) {
    console.error('Error deleting order from Turso:', err.message);
    return false;
  }
}

module.exports = {
  connectTurso,
  getIsConnected: () => isConnected,
  getTursoUrl: () => currentUrl ? currentUrl.replace(/:\/\/([^@]+)@/, '://****@') : '',
  getAllTursoData,
  isDeletedId: (id) => deletedItemIds.has(id),
  getDeletedIds: () => Array.from(deletedItemIds),
  saveTursoOrder,
  updateTursoOrder,
  deleteTursoOrder,
  clearTursoOrders,
  saveTursoUser,
  deleteTursoUser,
  deleteTursoUsersByRole,
  saveTursoListing,
  deleteTursoListing,
  clearTursoListings,
  saveTursoBulkDemand,
  deleteTursoBulkDemand,
  clearTursoBulkDemands,
  saveTursoVehicle,
  deleteTursoVehicle,
  clearTursoVehicles,
  saveTursoNotification,
  clearTursoNotifications,
  saveTursoActivity,
  saveTursoSetting
};

