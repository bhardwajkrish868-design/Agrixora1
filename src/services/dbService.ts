import { DatabaseState, ActivityLog, User, CropListing, Order, NotificationItem, VehicleDetails, BulkDemandPool } from '../types';

const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const dbService = {
  async loadDatabase(): Promise<Partial<DatabaseState>> {
    try {
      const res = await fetch(`${API_BASE}/api/db`);
      if (res.ok) {
        const data = await res.json();
        if (!Array.isArray(data.bulkDemands) || data.bulkDemands.length === 0) {
          try {
            const bRes = await fetch(`${API_BASE}/api/bulk-demands`);
            if (bRes.ok) {
              const bData = await bRes.json();
              if (Array.isArray(bData) && bData.length > 0) {
                data.bulkDemands = bData;
              }
            }
          } catch (_) {}
        }
        return data;
      }
    } catch (err) {
      console.warn('Backend DB fetch failed, falling back to local cache', err);
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
    try {
      const res = await fetch(`${API_BASE}/api/db/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend DB sync failed', err);
      return false;
    }
  },

  async createOrder(order: Order): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend direct order creation failed', err);
      return false;
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/orders/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, updates })
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend order update failed', err);
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
    try {
      const res = await fetch(`${API_BASE}/api/listings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing)
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend direct listing creation failed', err);
      return false;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/listings/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend direct listing deletion failed', err);
      return false;
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
    try {
      const res = await fetch(`${API_BASE}/api/bulk-demands/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demand)
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend createBulkDemand failed', err);
      return false;
    }
  },

  async contributeBulkDemand(poolId: string, updatedPool: BulkDemandPool): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/bulk-demands/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, updatedPool })
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend contributeBulkDemand failed', err);
      return false;
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
      if (res.ok) {
        const data = await res.json();
        return data.log || fullLog;
      }
    } catch (err) {
      console.warn('Backend activity log failed', err);
    }
    return fullLog;
  },

  async getHistory(): Promise<ActivityLog[]> {
    try {
      const res = await fetch(`${API_BASE}/api/db/history`);
      if (res.ok) {
        const data = await res.json();
        return data || [];
      }
    } catch (err) {
      console.warn('Backend history fetch failed', err);
    }
    return [];
  }
};
