import { DatabaseState, ActivityLog, User, CropListing, Order, NotificationItem, VehicleDetails, BulkDemandPool } from '../types';

// Turso Cloud Database HTTP Endpoint Configuration
const FALLBACK_TURSO_URL = 'https://farm2future-krish-x97.aws-ap-south-1.turso.io';
const FALLBACK_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAxOTA4NjcsImlkIjoiMDFhMGNmYWYtZTgwMS03ZDUzLThhZTctMTlhNTMyMTA5NmU1Iiwia2lkIjoiNGkwXzg1Sy1TeVJ0Qkd2N0JwdlAwYnVJbExxd1NMZnBsQm4tbVpVUjdrVSIsInJpZCI6IjM0OTkwMzRhLWZjM2YtNGQ4Mi04MGQ5LTgyMGI4YmZkN2I2MSJ9.wDlnSuNtURvzEU7yCCADNul-QQiM2SxiCABaEig0EDrY6R9yQmWMNYcr56295_O1KE-mic8WvR3a4gMpjYVwBw';

function getTursoEndpoint(): { pipelineUrl: string; token: string } {
  const envObj = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
  let rawUrl = envObj.VITE_TURSO_DATABASE_URL 
    ? String(envObj.VITE_TURSO_DATABASE_URL).trim() 
    : FALLBACK_TURSO_URL;
  
  if (rawUrl.startsWith('libsql://')) {
    rawUrl = rawUrl.replace('libsql://', 'https://');
  } else if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = 'https://' + rawUrl;
  }
  
  rawUrl = rawUrl.replace(/\/+$/, '');
  const pipelineUrl = rawUrl.endsWith('/v2/pipeline') ? rawUrl : `${rawUrl}/v2/pipeline`;

  const token = envObj.VITE_TURSO_AUTH_TOKEN
    ? String(envObj.VITE_TURSO_AUTH_TOKEN).trim()
    : FALLBACK_TURSO_TOKEN;

  return { pipelineUrl, token };
}

type TursoArg = 
  | { type: 'null' }
  | { type: 'text'; value: string }
  | { type: 'integer'; value: string }
  | { type: 'float'; value: number };

function toTursoArg(val: any): TursoArg {
  if (val === null || val === undefined) {
    return { type: 'null' };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { type: 'integer', value: String(val) };
    }
    return { type: 'float', value: val };
  }
  if (typeof val === 'boolean') {
    return { type: 'integer', value: val ? '1' : '0' };
  }
  if (typeof val === 'object') {
    return { type: 'text', value: JSON.stringify(val) };
  }
  return { type: 'text', value: String(val) };
}

export async function executeTursoStatements(stmts: Array<{ sql: string; args?: any[] }>): Promise<any[]> {
  const { pipelineUrl, token } = getTursoEndpoint();
  if (!token) return [];

  const requests = stmts.map(s => {
    const formattedArgs = s.args ? s.args.map(toTursoArg) : [];
    return {
      type: 'execute',
      stmt: {
        sql: s.sql,
        args: formattedArgs
      }
    };
  });

  requests.push({ type: 'close' } as any);

  try {
    const res = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!res.ok) {
      console.warn(`Turso HTTP Pipeline error status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.results)) return [];

    return data.results.map((r: any) => {
      if (r.type === 'ok' && r.response && r.response.result) {
        return r.response.result;
      }
      return null;
    });
  } catch (err) {
    console.warn('Direct Turso HTTP execute exception:', err);
    return [];
  }
}

export const tursoDirectService = {
  async loadDatabase(): Promise<Partial<DatabaseState> | null> {
    try {
      const results = await executeTursoStatements([
        { sql: 'SELECT id, type FROM deleted_items;' },
        { sql: 'SELECT id, data FROM users ORDER BY updated_at DESC;' },
        { sql: 'SELECT id, data FROM listings ORDER BY updated_at DESC;' },
        { sql: 'SELECT id, data FROM orders ORDER BY updated_at DESC;' },
        { sql: 'SELECT id, data FROM vehicles ORDER BY updated_at DESC;' },
        { sql: 'SELECT id, data FROM bulk_demands ORDER BY updated_at DESC;' },
        { sql: 'SELECT id, data FROM notifications ORDER BY timestamp DESC LIMIT 50;' },
        { sql: 'SELECT id, data FROM activities ORDER BY timestamp DESC LIMIT 100;' },
        { sql: 'SELECT key, value FROM platform_settings;' }
      ]);

      if (!results || results.length < 9) return null;

      // 0: deleted_items
      const deletedIds: string[] = [];
      if (results[0] && Array.isArray(results[0].rows)) {
        for (const row of results[0].rows) {
          if (row && row[0] && row[0].value) {
            deletedIds.push(row[0].value);
          }
        }
      }

      // Helper to parse data column from SELECT id, data
      const parseJsonRows = <T>(resIndex: number): T[] => {
        const items: T[] = [];
        const result = results[resIndex];
        if (result && Array.isArray(result.rows)) {
          for (const row of result.rows) {
            if (row && row[1] && row[1].value) {
              try {
                const parsed = JSON.parse(row[1].value);
                if (parsed) items.push(parsed);
              } catch (_) {}
            }
          }
        }
        return items;
      };

      const users: User[] = parseJsonRows<User>(1);
      const listings: CropListing[] = parseJsonRows<CropListing>(2);
      const orders: Order[] = parseJsonRows<Order>(3);
      const vehicles: VehicleDetails[] = parseJsonRows<VehicleDetails>(4);
      const bulkDemands: BulkDemandPool[] = parseJsonRows<BulkDemandPool>(5);
      const notifications: NotificationItem[] = parseJsonRows<NotificationItem>(6);
      const activityHistory: ActivityLog[] = parseJsonRows<ActivityLog>(7);

      let adminPasskey: string | undefined = undefined;
      if (results[8] && Array.isArray(results[8].rows)) {
        for (const row of results[8].rows) {
          if (row && row[0] && row[0].value === 'admin_passkey' && row[1]) {
            adminPasskey = row[1].value;
          }
        }
      }

      return {
        deletedIds,
        users,
        listings,
        orders,
        vehicles,
        bulkDemands,
        notifications,
        activityHistory,
        adminPasskey
      };
    } catch (err) {
      console.warn('Direct Turso loadDatabase failed:', err);
      return null;
    }
  },

  async saveUser(user: User): Promise<boolean> {
    try {
      const results = await executeTursoStatements([
        {
          sql: `INSERT INTO users (id, name, phone, email, role, location, district, state, aadhaar_number, data, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  name=excluded.name,
                  phone=excluded.phone,
                  email=excluded.email,
                  role=excluded.role,
                  location=excluded.location,
                  district=excluded.district,
                  state=excluded.state,
                  aadhaar_number=excluded.aadhaar_number,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            user.id,
            user.name || '',
            user.phone || '',
            user.email || '',
            user.role || 'farmer',
            user.location || '',
            user.district || '',
            user.state || '',
            user.aadhaarNumber || null,
            JSON.stringify(user)
          ]
        }
      ]);
      return results.length > 0 && results[0] !== null;
    } catch (err) {
      console.warn('Direct Turso saveUser failed:', err);
      return false;
    }
  },

  async syncUsers(users: User[]): Promise<boolean> {
    if (!users || users.length === 0) return true;
    try {
      const stmts = users.map(user => ({
        sql: `INSERT INTO users (id, name, phone, email, role, location, district, state, aadhaar_number, data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                phone=excluded.phone,
                email=excluded.email,
                role=excluded.role,
                location=excluded.location,
                district=excluded.district,
                state=excluded.state,
                aadhaar_number=excluded.aadhaar_number,
                data=excluded.data,
                updated_at=CURRENT_TIMESTAMP;`,
        args: [
          user.id,
          user.name || '',
          user.phone || '',
          user.email || '',
          user.role || 'farmer',
          user.location || '',
          user.district || '',
          user.state || '',
          user.aadhaarNumber || null,
          JSON.stringify(user)
        ]
      }));
      const results = await executeTursoStatements(stmts);
      return results.length > 0;
    } catch (err) {
      console.warn('Direct Turso syncUsers failed:', err);
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const results = await executeTursoStatements([
        { sql: 'DELETE FROM users WHERE id = ?;', args: [id] },
        { sql: 'INSERT OR REPLACE INTO deleted_items (id, type, deleted_at) VALUES (?, ?, CURRENT_TIMESTAMP);', args: [id, 'user'] }
      ]);
      return results.length > 0;
    } catch (err) {
      console.warn('Direct Turso deleteUser failed:', err);
      return false;
    }
  },

  async saveListing(listing: CropListing): Promise<boolean> {
    try {
      const results = await executeTursoStatements([
        {
          sql: `INSERT INTO listings (id, farmer_id, farmer_name, crop_name, category, quantity, unit, price_per_unit, status, data, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  farmer_id=excluded.farmer_id,
                  farmer_name=excluded.farmer_name,
                  crop_name=excluded.crop_name,
                  category=excluded.category,
                  quantity=excluded.quantity,
                  unit=excluded.unit,
                  price_per_unit=excluded.price_per_unit,
                  status=excluded.status,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            listing.id,
            listing.farmerId || '',
            listing.farmerName || '',
            listing.cropName || '',
            listing.category || '',
            listing.quantity || 0,
            listing.unit || 'kg',
            listing.pricePerUnit || 0,
            listing.status || 'Active',
            JSON.stringify(listing)
          ]
        }
      ]);
      return results.length > 0;
    } catch (err) {
      console.warn('Direct Turso saveListing failed:', err);
      return false;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const results = await executeTursoStatements([
        { sql: 'DELETE FROM listings WHERE id = ?;', args: [id] },
        { sql: 'INSERT OR REPLACE INTO deleted_items (id, type, deleted_at) VALUES (?, ?, CURRENT_TIMESTAMP);', args: [id, 'listing'] }
      ]);
      return results.length > 0;
    } catch (err) {
      console.warn('Direct Turso deleteListing failed:', err);
      return false;
    }
  },

  async saveOrder(order: Order): Promise<boolean> {
    try {
      const results = await executeTursoStatements([
        {
          sql: `INSERT INTO orders (id, order_number, crop_name, quantity, total_amount, buyer_id, farmer_id, current_stage, escrow_status, data, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  order_number=excluded.order_number,
                  crop_name=excluded.crop_name,
                  quantity=excluded.quantity,
                  total_amount=excluded.total_amount,
                  buyer_id=excluded.buyer_id,
                  farmer_id=excluded.farmer_id,
                  current_stage=excluded.current_stage,
                  escrow_status=excluded.escrow_status,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            order.id,
            order.orderNumber || order.id,
            order.cropName || '',
            order.quantity || 0,
            order.totalAmount || 0,
            order.buyerId || '',
            order.farmerId || '',
            order.currentStage || 'created',
            order.paymentStatus || 'pending',
            JSON.stringify(order)
          ]
        }
      ]);
      return results.length > 0;
    } catch (err) {
      console.warn('Direct Turso saveOrder failed:', err);
      return false;
    }
  },

  async saveBulkDemand(demand: BulkDemandPool): Promise<boolean> {
    try {
      const results = await executeTursoStatements([
        {
          sql: `INSERT INTO bulk_demands (id, crop_name, target_quantity_kg, status, data, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  crop_name=excluded.crop_name,
                  target_quantity_kg=excluded.target_quantity_kg,
                  status=excluded.status,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            demand.id,
            demand.cropName || '',
            demand.targetQuantityTons || 0,
            demand.status || 'Open for Contributions',
            JSON.stringify(demand)
          ]
        }
      ]);
      return results.length > 0;
    } catch (err) {
      console.warn('Direct Turso saveBulkDemand failed:', err);
      return false;
    }
  },

  async logActivity(log: ActivityLog): Promise<boolean> {
    try {
      const results = await executeTursoStatements([
        {
          sql: `INSERT INTO activities (id, user_id, user_name, action_type, title, description, timestamp, data, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  title=excluded.title,
                  description=excluded.description,
                  data=excluded.data;`,
          args: [
            log.id,
            log.userId || '',
            log.userName || '',
            log.actionType || 'system',
            log.title || '',
            log.description || '',
            log.timestamp || new Date().toISOString(),
            JSON.stringify(log)
          ]
        }
      ]);
      return results.length > 0;
    } catch (err) {
      console.warn('Direct Turso logActivity failed:', err);
      return false;
    }
  },

  async syncFullDatabase(state: {
    users?: User[];
    listings?: CropListing[];
    orders?: Order[];
    vehicles?: VehicleDetails[];
    bulkDemands?: BulkDemandPool[];
    notifications?: NotificationItem[];
    activityHistory?: ActivityLog[];
    adminPasskey?: string;
  }): Promise<boolean> {
    const stmts: Array<{ sql: string; args?: any[] }> = [];

    if (Array.isArray(state.users) && state.users.length > 0) {
      for (const user of state.users) {
        stmts.push({
          sql: `INSERT INTO users (id, name, phone, email, role, location, district, state, aadhaar_number, data, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  name=excluded.name,
                  phone=excluded.phone,
                  email=excluded.email,
                  role=excluded.role,
                  location=excluded.location,
                  district=excluded.district,
                  state=excluded.state,
                  aadhaar_number=excluded.aadhaar_number,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            user.id,
            user.name || '',
            user.phone || '',
            user.email || '',
            user.role || 'farmer',
            user.location || '',
            user.district || '',
            user.state || '',
            user.aadhaarNumber || null,
            JSON.stringify(user)
          ]
        });
      }
    }

    if (Array.isArray(state.listings) && state.listings.length > 0) {
      for (const listing of state.listings) {
        stmts.push({
          sql: `INSERT INTO listings (id, farmer_id, farmer_name, crop_name, category, quantity, unit, price_per_unit, status, data, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  farmer_id=excluded.farmer_id,
                  farmer_name=excluded.farmer_name,
                  crop_name=excluded.crop_name,
                  category=excluded.category,
                  quantity=excluded.quantity,
                  unit=excluded.unit,
                  price_per_unit=excluded.price_per_unit,
                  status=excluded.status,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            listing.id,
            listing.farmerId || '',
            listing.farmerName || '',
            listing.cropName || '',
            listing.category || '',
            listing.quantity || 0,
            listing.unit || 'kg',
            listing.pricePerUnit || 0,
            listing.status || 'Active',
            JSON.stringify(listing)
          ]
        });
      }
    }

    if (Array.isArray(state.orders) && state.orders.length > 0) {
      for (const order of state.orders) {
        stmts.push({
          sql: `INSERT INTO orders (id, order_number, crop_name, quantity, total_amount, buyer_id, farmer_id, current_stage, escrow_status, data, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  order_number=excluded.order_number,
                  crop_name=excluded.crop_name,
                  quantity=excluded.quantity,
                  total_amount=excluded.total_amount,
                  buyer_id=excluded.buyer_id,
                  farmer_id=excluded.farmer_id,
                  current_stage=excluded.current_stage,
                  escrow_status=excluded.escrow_status,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            order.id,
            order.orderNumber || order.id,
            order.cropName || '',
            order.quantity || 0,
            order.totalAmount || 0,
            order.buyerId || '',
            order.farmerId || '',
            order.currentStage || 'created',
            order.paymentStatus || 'pending',
            JSON.stringify(order)
          ]
        });
      }
    }

    if (Array.isArray(state.bulkDemands) && state.bulkDemands.length > 0) {
      for (const demand of state.bulkDemands) {
        stmts.push({
          sql: `INSERT INTO bulk_demands (id, crop_name, target_quantity_kg, status, data, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  crop_name=excluded.crop_name,
                  target_quantity_kg=excluded.target_quantity_kg,
                  status=excluded.status,
                  data=excluded.data,
                  updated_at=CURRENT_TIMESTAMP;`,
          args: [
            demand.id,
            demand.cropName || '',
            demand.targetQuantityTons || 0,
            demand.status || 'Open for Contributions',
            JSON.stringify(demand)
          ]
        });
      }
    }

    if (stmts.length === 0) return true;
    const results = await executeTursoStatements(stmts);
    return results.length > 0;
  }
};
