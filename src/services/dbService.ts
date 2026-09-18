import { DatabaseState, ActivityLog, User, CropListing, Order, NotificationItem, VehicleDetails, BulkDemandPool } from '../types';

const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const dbService = {
  async loadDatabase(): Promise<Partial<DatabaseState>> {
    try {
      const res = await fetch(`${API_BASE}/api/db`);
      if (res.ok) {
        const data = await res.json();
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
