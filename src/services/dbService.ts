import { DatabaseState, ActivityLog, User, CropListing, Order, NotificationItem, VehicleDetails, BulkDemandPool } from '../types';
import { tursoDirectService } from './tursoDirect';

const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

function isJsonResponse(res: Response): boolean {
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json');
}

export const dbService = {
  async loadDatabase(): Promise<Partial<DatabaseState>> {
    // 1. Try local Express / Node backend API first
    try {
      const res = await fetch(`${API_BASE}/api/db`);
      if (res.ok && isJsonResponse(res)) {
        const data = await res.json();
        if (data && (Array.isArray(data.users) || Array.isArray(data.listings) || Array.isArray(data.orders))) {
          if (!Array.isArray(data.bulkDemands) || data.bulkDemands.length === 0) {
            try {
              const bRes = await fetch(`${API_BASE}/api/bulk-demands`);
              if (bRes.ok && isJsonResponse(bRes)) {
                const bData = await bRes.json();
                if (Array.isArray(bData) && bData.length > 0) {
                  data.bulkDemands = bData;
                }
              }
            } catch (_) {}
          }
          return data;
        }
      }
    } catch (err) {
      console.debug('Local backend API unavailable, falling back to direct Turso LibSQL Cloud:', err);
    }

    // 2. Direct Cloud Turso LibSQL Fallback (Works on static hosting, Vercel, Netlify, Cloudflare Pages, GitHub Pages)
    try {
      const tursoData = await tursoDirectService.loadDatabase();
      if (tursoData) {
        return tursoData;
      }
    } catch (tursoErr) {
      console.warn('Direct Turso Cloud DB fetch failed:', tursoErr);
    }

    return {};
  },

  async syncDatabase(state: {
    users?: User[];
    listings?: CropListing[];
    orders?: Order[];
    vehicles?: VehicleDetails[];
    bulkDemands?: BulkDemandPool[];
    notifications?: NotificationItem[];
    activityHistory?: ActivityLog[];
    adminPasskey?: string;
  }): Promise<boolean> {
    let localSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/api/db/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      localSuccess = res.ok && isJsonResponse(res);
    } catch (_) {}

    // Always ensure Turso Cloud DB has latest data if local backend isn't handling it or is static
    try {
      const tursoSuccess = await tursoDirectService.syncFullDatabase(state);
      return localSuccess || tursoSuccess;
    } catch (err) {
      console.warn('Turso direct sync fallback error:', err);
      return localSuccess;
    }
  },

  async saveUser(user: User): Promise<boolean> {
    try {
      // 1. Direct Turso Cloud DB persist
      const tursoSuccess = await tursoDirectService.saveUser(user);
      // 2. Also notify local backend if alive
      try {
        await fetch(`${API_BASE}/api/db/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: [user] })
        });
      } catch (_) {}
      return tursoSuccess;
    } catch (err) {
      console.warn('Failed to persist user to Turso:', err);
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const tursoSuccess = await tursoDirectService.deleteUser(id);
      try {
        await fetch(`${API_BASE}/api/db/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deletedIds: [id] })
        });
      } catch (_) {}
      return tursoSuccess;
    } catch (err) {
      console.warn('Failed to delete user on Turso:', err);
      return false;
    }
  },

  async createOrder(order: Order): Promise<boolean> {
    let localSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      localSuccess = res.ok;
    } catch (_) {}

    try {
      const tursoSuccess = await tursoDirectService.saveOrder(order);
      return localSuccess || tursoSuccess;
    } catch (err) {
      console.warn('Turso order create failed:', err);
      return localSuccess;
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>, fullOrder?: Order): Promise<boolean> {
    let localSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/api/orders/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, updates })
      });
      localSuccess = res.ok;
    } catch (_) {}

    if (fullOrder) {
      try {
        const mergedOrder = { ...fullOrder, ...updates };
        const tursoSuccess = await tursoDirectService.saveOrder(mergedOrder);
        return localSuccess || tursoSuccess;
      } catch (_) {}
    }
    return localSuccess;
  },

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/orders/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) return true;
    } catch (_) {}

    try {
      return await tursoDirectService.syncFullDatabase({});
    } catch (_) {
      return false;
    }
  },

  async clearAllOrders(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/orders/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend clear all orders failed', err);
      return false;
    }
  },

  async createListing(listing: CropListing): Promise<boolean> {
    let localSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/api/listings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing)
      });
      localSuccess = res.ok;
    } catch (_) {}

    try {
      const tursoSuccess = await tursoDirectService.saveListing(listing);
      return localSuccess || tursoSuccess;
    } catch (err) {
      console.warn('Turso listing create failed:', err);
      return localSuccess;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    let localSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/api/listings/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      localSuccess = res.ok;
    } catch (_) {}

    try {
      const tursoSuccess = await tursoDirectService.deleteListing(id);
      return localSuccess || tursoSuccess;
    } catch (err) {
      console.warn('Turso listing delete failed:', err);
      return localSuccess;
    }
  },

  async clearAllListings(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/listings/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend clear all listings failed', err);
      return false;
    }
  },

  async createBulkDemand(demand: BulkDemandPool): Promise<boolean> {
    let localSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/api/bulk-demands/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demand)
      });
      localSuccess = res.ok;
    } catch (_) {}

    try {
      const tursoSuccess = await tursoDirectService.saveBulkDemand(demand);
      return localSuccess || tursoSuccess;
    } catch (err) {
      console.warn('Turso bulk demand create failed:', err);
      return localSuccess;
    }
  },

  async contributeBulkDemand(poolId: string, updatedPool: BulkDemandPool): Promise<boolean> {
    let localSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/api/bulk-demands/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, updatedPool })
      });
      localSuccess = res.ok;
    } catch (_) {}

    try {
      const tursoSuccess = await tursoDirectService.saveBulkDemand(updatedPool);
      return localSuccess || tursoSuccess;
    } catch (err) {
      console.warn('Turso bulk demand contribute failed:', err);
      return localSuccess;
    }
  },

  async deleteBulkDemand(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/bulk-demands/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend delete bulk demand failed', err);
      return false;
    }
  },

  async logActivity(log: {
    userId?: string;
    userName?: string;
    userRole?: string;
    actionType: ActivityLog['actionType'];
    title: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<ActivityLog | null> {
    const fullLog: ActivityLog = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: log.userId,
      userName: log.userName,
      userRole: (log.userRole as any) || 'system',
      actionType: log.actionType,
      title: log.title,
      description: log.description,
      timestamp: new Date().toISOString(),
      metadata: log.metadata || {}
    };

    try {
      const res = await fetch(`${API_BASE}/api/db/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullLog)
      });
      if (res.ok && isJsonResponse(res)) {
        const data = await res.json();
        return data.log || fullLog;
      }
    } catch (_) {}

    try {
      await tursoDirectService.logActivity(fullLog);
    } catch (_) {}

    return fullLog;
  },

  async getHistory(): Promise<ActivityLog[]> {
    try {
      const res = await fetch(`${API_BASE}/api/db/history`);
      if (res.ok && isJsonResponse(res)) {
        const data = await res.json();
        return data || [];
      }
    } catch (err) {
      console.warn('Backend history fetch failed', err);
    }
    return [];
  }
};
