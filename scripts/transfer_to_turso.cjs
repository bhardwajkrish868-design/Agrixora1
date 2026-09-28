/**
 * 🚀 Farm2Future - Full Database Migration to Turso Cloud (9 GB LibSQL)
 * Transfers all data from local database (data/farm2future_db.json) to Turso Cloud
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://farm2future-krish-x97.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL) {
  console.error('❌ Error: TURSO_DATABASE_URL is missing in .env');
  process.exit(1);
}

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});

async function main() {
  console.log('====================================================');
  console.log('🌱 FARM2FUTURE: LOCAL TO TURSO CLOUD DATA TRANSFER');
  console.log('====================================================');
  console.log(`📡 Connecting to Turso Cloud: ${TURSO_URL.replace(/:\/\/([^@]+)@/, '://****@')}`);

  // Test connection
  try {
    await client.execute('SELECT 1');
    console.log('✅ Connection to Turso Cloud established successfully!\n');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  // 1. Ensure all tables exist
  console.log('📦 Step 1: Initializing Turso Cloud SQL Tables...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS deleted_items (
      id TEXT PRIMARY KEY,
      type TEXT,
      deleted_at TEXT
    );
  `);
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vehicle_number TEXT,
      driver_name TEXT,
      driver_phone TEXT,
      data TEXT
    );
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  await client.execute(`
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
  console.log('✅ Tables verified in Turso Cloud.\n');

  // 2. Read local database
  const jsonPath = path.resolve(__dirname, '..', 'data', 'farm2future_db.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Local database file not found at ${jsonPath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const localDb = JSON.parse(raw);

  console.log('📂 Local Database Summary to Transfer:');
  console.log(`   - Users:          ${localDb.users ? localDb.users.length : 0}`);
  console.log(`   - Listings:       ${localDb.listings ? localDb.listings.length : 0}`);
  console.log(`   - Orders:         ${localDb.orders ? localDb.orders.length : 0}`);
  console.log(`   - Bulk Demands:   ${localDb.bulkDemands ? localDb.bulkDemands.length : 0}`);
  console.log(`   - Vehicles:       ${localDb.vehicles ? localDb.vehicles.length : 0}`);
  console.log(`   - Notifications:  ${localDb.notifications ? localDb.notifications.length : 0}`);
  console.log(`   - Activities:     ${localDb.activityHistory ? localDb.activityHistory.length : 0}`);
  console.log(`   - Deleted Ids:    ${localDb.deletedIds ? localDb.deletedIds.length : 0}\n`);

  // 3. Sync Deleted Items & Tombstones
  console.log('🛡️ Step 2: Syncing Deleted Items / Tombstones...');
  const deletedSet = new Set(localDb.deletedIds || []);
  for (const id of deletedSet) {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO deleted_items (id, type, deleted_at) VALUES (?, ?, ?)',
      args: [id, 'tombstone', new Date().toISOString()]
    });
    // Remove from active tables in Turso Cloud if present
    await client.execute({ sql: 'DELETE FROM listings WHERE id = ?', args: [id] });
    await client.execute({ sql: 'DELETE FROM bulk_demands WHERE id = ?', args: [id] });
    await client.execute({ sql: 'DELETE FROM orders WHERE id = ? OR order_number = ?', args: [id, id] });
  }
  console.log(`   ✅ Synced ${deletedSet.size} deleted tombstones to Turso Cloud.\n`);

  // 4. Transfer Users
  console.log('👥 Step 3: Transferring Users to Turso Cloud...');
  let userCount = 0;
  if (Array.isArray(localDb.users)) {
    for (const u of localDb.users) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO users (id, name, phone, email, role, location, district, state, aadhaar_number, data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
      userCount++;
    }
  }
  console.log(`   ✅ Transferred ${userCount} users.\n`);

  // 5. Transfer Listings
  console.log('🌾 Step 4: Transferring Active Listings to Turso Cloud...');
  let listingCount = 0;
  if (Array.isArray(localDb.listings)) {
    for (const l of localDb.listings) {
      if (deletedSet.has(l.id)) continue;
      await client.execute({
        sql: `INSERT OR REPLACE INTO listings (id, farmer_id, farmer_name, crop_name, category, quantity, unit, price_per_unit, status, data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
      listingCount++;
    }
  }
  console.log(`   ✅ Transferred ${listingCount} active listings.\n`);

  // 6. Transfer Orders
  console.log('🛒 Step 5: Transferring Orders to Turso Cloud...');
  let orderCount = 0;
  if (Array.isArray(localDb.orders)) {
    for (const o of localDb.orders) {
      if (deletedSet.has(o.id)) continue;
      await client.execute({
        sql: `INSERT OR REPLACE INTO orders (id, order_number, crop_name, quantity, total_amount, buyer_id, farmer_id, current_stage, escrow_status, data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
      orderCount++;
    }
  }
  console.log(`   ✅ Transferred ${orderCount} orders.\n`);

  // 7. Transfer Bulk Demands
  console.log('📦 Step 6: Transferring Bulk Demands to Turso Cloud...');
  let bulkCount = 0;
  if (Array.isArray(localDb.bulkDemands)) {
    for (const b of localDb.bulkDemands) {
      if (deletedSet.has(b.id)) continue;
      await client.execute({
        sql: `INSERT OR REPLACE INTO bulk_demands (id, demand_number, buyer_id, crop_name, target_quantity_tons, committed_quantity_tons, price_per_ton, status, data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
      bulkCount++;
    }
  }
  console.log(`   ✅ Transferred ${bulkCount} bulk demands.\n`);

  // 8. Transfer Vehicles
  console.log('🚚 Step 7: Transferring Vehicles to Turso Cloud...');
  let vehicleCount = 0;
  if (Array.isArray(localDb.vehicles)) {
    for (const v of localDb.vehicles) {
      await client.execute({
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
      vehicleCount++;
    }
  }
  console.log(`   ✅ Transferred ${vehicleCount} fleet vehicles.\n`);

  // 9. Transfer Notifications
  console.log('🔔 Step 8: Transferring Notifications to Turso Cloud...');
  let notifCount = 0;
  if (Array.isArray(localDb.notifications)) {
    for (const n of localDb.notifications) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO notifications (id, title, message, type, is_read, timestamp, role, data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          n.id,
          n.title || '',
          n.message || '',
          n.type || 'info',
          n.read || n.is_read ? 1 : 0,
          n.timestamp || new Date().toISOString(),
          n.recipientRole || n.role || 'all',
          JSON.stringify(n)
        ]
      });
      notifCount++;
    }
  }
  console.log(`   ✅ Transferred ${notifCount} notifications.\n`);

  // 10. Transfer Activity History
  console.log('📜 Step 9: Transferring Audit Activity Logs to Turso Cloud...');
  let actCount = 0;
  if (Array.isArray(localDb.activityHistory)) {
    for (const a of localDb.activityHistory) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO activities (id, user_id, user_name, action_type, title, description, timestamp, data, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
      actCount++;
    }
  }
  console.log(`   ✅ Transferred ${actCount} activity audit logs.\n`);

  // 11. Transfer Settings
  console.log('⚙️ Step 10: Transferring Settings & Passkey to Turso Cloud...');
  if (localDb.adminPasskey) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO settings (key, value) VALUES ('adminPasskey', ?)`,
      args: [String(localDb.adminPasskey)]
    });
  }
  await client.execute({
    sql: `INSERT OR REPLACE INTO settings (key, value) VALUES ('lastCloudTransfer', ?)`,
    args: [new Date().toISOString()]
  });
  console.log('   ✅ Transferred admin credentials and migration timestamp.\n');

  // 12. Verification & Summary Report
  console.log('====================================================');
  console.log('🔍 VERIFICATION OF TURSO CLOUD DATABASE (9 GB):');
  console.log('====================================================');

  const [tUsers, tListings, tOrders, tVehicles, tNotifs, tActs, tDels, tSettings, tBulks] = await Promise.all([
    client.execute('SELECT COUNT(*) as count FROM users'),
    client.execute('SELECT COUNT(*) as count FROM listings'),
    client.execute('SELECT COUNT(*) as count FROM orders'),
    client.execute('SELECT COUNT(*) as count FROM vehicles'),
    client.execute('SELECT COUNT(*) as count FROM notifications'),
    client.execute('SELECT COUNT(*) as count FROM activities'),
    client.execute('SELECT COUNT(*) as count FROM deleted_items'),
    client.execute('SELECT COUNT(*) as count FROM settings'),
    client.execute('SELECT COUNT(*) as count FROM bulk_demands')
  ]);

  console.log(`📊 Turso Cloud Live Row Counts:`);
  console.log(`   - Users Table:          ${tUsers.rows[0].count} rows`);
  console.log(`   - Listings Table:       ${tListings.rows[0].count} rows`);
  console.log(`   - Orders Table:         ${tOrders.rows[0].count} rows`);
  console.log(`   - Bulk Demands Table:   ${tBulks.rows[0].count} rows`);
  console.log(`   - Vehicles Table:       ${tVehicles.rows[0].count} rows`);
  console.log(`   - Notifications Table:  ${tNotifs.rows[0].count} rows`);
  console.log(`   - Activities Table:     ${tActs.rows[0].count} rows`);
  console.log(`   - Deleted Items Table:  ${tDels.rows[0].count} rows`);
  console.log(`   - Settings Table:       ${tSettings.rows[0].count} rows`);

  // Verify listings
  const listRows = await client.execute('SELECT id, crop_name, farmer_name, price_per_unit, status FROM listings');
  console.log('\n🌾 Live Active Listings in Turso Cloud:');
  listRows.rows.forEach(r => {
    console.log(`   • [${r.id}] ${r.crop_name} by ${r.farmer_name} - ₹${r.price_per_unit} (${r.status})`);
  });

  console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY TRANSFERRED TO TURSO CLOUD!');
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('❌ Migration failed with error:', err);
  process.exit(1);
});
