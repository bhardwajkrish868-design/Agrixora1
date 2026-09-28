import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, 
  UserRole, 
  CropListing, 
  Order, 
  OrderStage, 
  QualityInspection, 
  DispatchDetails, 
  MandiPriceTrend, 
  NotificationItem, 
  CollectionHub,
  ActivityLog,
  DatabaseState,
  VehicleDetails,
  BulkDemandPool,
  PoolContribution
} from '../types';
import { 
  initialMandiPrices, 
  initialCollectionHubs, 
  initialNotifications,
  initialVehicles,
  initialBulkDemands,
  initialListings
} from '../data/mockData';
import { calculateOrderFees } from '../utils/pricingUtils';
import { dbService } from '../services/dbService';
import { getRouteTripDetails } from '../utils/routeUtils';
import { 
  GeoCoordinate, 
  DEFAULT_USER_LOCATION, 
  geocodeLocation, 
  calculateDistanceKm, 
  isWithin10Km, 
  getHyperlocalDispatchEstimate,
  findNearestFciHub
} from '../utils/geoUtils';
import { getNearestTargetMandi } from '../data/indiaLocations';
import { assignOptimalTruckAI } from '../utils/aiLogisticsEngine';
import { getMandiPricesForLocation } from '../utils/mandiPriceService';
import { applyLanguageToDOM, t as translateHelper } from '../utils/translator';

export type StakeholderCohortMode = 'registered_now' | 'upcoming';

interface AgriContextType {
  currentUser: User;
  setCurrentUser: (u: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  registeredUsers: User[];
  loginUser: (userData: Partial<User> & { role: UserRole; password?: string }) => { success: boolean; message?: string };
  logoutUser: () => void;
  registerUser: (userData: Partial<User> & { role: UserRole; password?: string }) => void;
  resetUserPassword: (identifier: string, newPassword: string, role?: UserRole) => { success: boolean; message: string; user?: User };
  deleteUser: (userId: string) => void;
  clearAllUsers: () => void;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  
  // Listings
  listings: CropListing[];
  addListing: (data: Partial<CropListing>) => CropListing;
  updateListing: (id: string, updates: Partial<CropListing>) => void;
  deleteListing: (id: string) => void;
  
  // Orders & Supply Chain
  orders: Order[];
  placeOrder: (params: {
    listing: CropListing;
    quantity: number;
    deliveryAddress: string;
    pincode: string;
    buyerOrg?: string;
    paymentMethod: string;
  }) => Order;
  createHubIntakeOrder: (params: {
    farmerName: string;
    farmerPhone: string;
    farmerLocation?: string;
    cropName: string;
    variety?: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    hubId: string;
    hubName: string;
    vehicleNo?: string;
    grossWeightKg?: number;
    tareWeightKg?: number;
    weighbridgeSlipNo?: string;
  }) => Order;
  updateOrderStage: (orderId: string, stage: OrderStage) => void;
  saveQualityInspection: (orderId: string, inspection: QualityInspection) => void;
  dispatchOrder: (orderId: string, dispatch: DispatchDetails) => void;
  updateTripProgress: (orderId: string, coveredKm: number) => void;
  markOrderDelivered: (orderId: string) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  clearAllOrders: () => Promise<void>;
  
  // Fleet & Vehicle Details
  vehicles: VehicleDetails[];
  addVehicle: (data: Partial<VehicleDetails>) => VehicleDetails;
  updateVehicle: (id: string, updates: Partial<VehicleDetails>) => void;
  deleteVehicle: (id: string) => void;

  // Bulk Demand & Multi-Farmer Pooling (500T+ Aggregation)
  bulkDemands: BulkDemandPool[];
  addBulkDemand: (demand: Partial<BulkDemandPool>) => BulkDemandPool;
  deleteBulkDemand: (id: string) => void;
  contributeToBulkDemand: (poolId: string, contribution: Partial<PoolContribution>) => PoolContribution | null;
  updateContributionStatus: (poolId: string, contributionId: string, status: PoolContribution['status']) => void;

  // Modals & Navigation
  selectedListingModal: CropListing | null;
  setSelectedListingModal: (listing: CropListing | null) => void;
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string, skipHistory?: boolean) => void;
  navigateBack: () => void;
  canGoBack: boolean;
  historyStack: string[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalRole: UserRole | null;
  setAuthModalRole: (role: UserRole | null) => void;
  authModalMode: 'login' | 'register' | 'forgot_password';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  openAuthModal: (role?: UserRole, mode?: 'login' | 'register' | 'forgot_password') => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (text: string) => string;

  // Welcome Gateway
  showWelcomeGateway: boolean;
  setShowWelcomeGateway: (show: boolean) => void;
  enterPortal: (role: UserRole) => void;
  openGateway: () => void;

  // 📍 Geo-Location & 10 KM Hyperlocal Auto-Connect
  userLocation: GeoCoordinate;
  setUserLocation: (loc: GeoCoordinate) => void;
  detectLiveLocation: () => Promise<GeoCoordinate>;
  
  // Intelligence & Notifications
  mandiPrices: MandiPriceTrend[];
  refreshMandiPrices: (state?: string, district?: string) => void;
  collectionHubs: CollectionHub[];
  selectedHubId: string;
  setSelectedHubId: (id: string) => void;
  activeHub: CollectionHub;
  addCollectionHub: (hub: CollectionHub) => void;
  notifications: NotificationItem[];
  latestToast: NotificationItem | null;
  dismissToast: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  
  // Activity Audit & Database History
  activityHistory: ActivityLog[];
  logActivity: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityHistory: () => void;
  
  // Admin Security & Passkey Control
  adminPasskey: string;
  isAdminAuthenticated: boolean;
  verifyAdminPasskey: (key: string) => boolean;
  changeAdminPasskey: (oldKey: string, newKey: string) => { success: boolean; message: string };
  lockAdminConsole: () => void;
  
  // Stakeholder Cohort Filter (Registered Now vs Upcoming)
  stakeholderCohortMode: StakeholderCohortMode;
  setStakeholderCohortMode: (mode: StakeholderCohortMode) => void;

  // Global Stats
  stats: {
    totalListingsCount: number;
    activeListingsCount: number;
    totalOrdersCount: number;
    totalVolumeQuintals: number;
    totalGMV: number;
    escrowLockedValue: number;
    totalFarmerEarnings: number;
    verifiedFarmersCount: number;
    verifiedBuyersCount: number;
    registeredFarmersNow: number;
    registeredBuyersNow: number;
    upcomingFarmersCount: number;
    upcomingBuyersCount: number;
    stakeholderCohortMode: StakeholderCohortMode;
    activeCollectionHubsCount: number;
    activeFleetCount: number;
  };

  // Farmer & Buyer Association Helpers
  isFarmerOrder: (order: Order, user?: User | null) => boolean;
  isFarmerListing: (listing: CropListing, user?: User | null) => boolean;
  isBuyerOrder: (order: Order, user?: User | null) => boolean;
}

export const isFarmerOrder = (order: Order, user: User | null): boolean => {
  if (!user) return false;
  // 1. Direct ID match
  if (order.farmerId === user.id) return true;
  // 2. Phone match
  const uPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
  const oPhone = (order.farmerPhone || '').replace(/\D/g, '').slice(-10);
  if (uPhone && oPhone && uPhone === oPhone) return true;
  // 3. Name match
  const uName = (user.name || '').trim().toLowerCase();
  const oName = (order.farmerName || '').trim().toLowerCase();
  if (uName && oName && uName === oName) return true;
  return false;
};

export const isFarmerListing = (listing: CropListing, user: User | null): boolean => {
  if (!user) return true;
  if (listing.farmerId === user.id) return true;
  if ((user.id === 'usr_guest' || user.id === 'usr_farmer') && (listing.farmerId === 'usr_guest' || listing.farmerId === 'usr_farmer')) return true;
  const uPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
  const lPhone = (listing.farmerPhone || '').replace(/\D/g, '').slice(-10);
  if (uPhone && lPhone && uPhone === lPhone) return true;
  const uName = (user.name || '').trim().toLowerCase();
  const lName = (listing.farmerName || '').trim().toLowerCase();
  if (uName && lName && uName === lName) return true;
  return false;
};

export const isBuyerOrder = (order: Order, user: User | null): boolean => {
  if (!user) return false;
  // 1. Direct ID match
  if (order.buyerId === user.id) return true;
  // 2. Phone match (last 10 digits)
  const uPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
  const oPhone = (order.buyerPhone || '').replace(/\D/g, '').slice(-10);
  if (uPhone && oPhone && uPhone === oPhone) return true;
  // 3. Name or Business Org match
  const uName = (user.name || '').trim().toLowerCase();
  const uOrg = (user.businessName || '').trim().toLowerCase();
  const oName = (order.buyerName || '').trim().toLowerCase();
  const oOrg = (order.buyerOrg || '').trim().toLowerCase();
  if (uName && (uName === oName || uName === oOrg)) return true;
  if (uOrg && (uOrg === oName || uOrg === oOrg)) return true;
  // 4. Default / Guest Buyer Demo fallback (so demo buyer always shows active order status)
  if (user.role === 'buyer' && (user.id === 'usr_guest' || user.id === 'usr_buyer' || !user.phone)) {
    return true;
  }
  return false;
};

/**
 * 🔔 Unified Notification Filtering Helper
 * Guarantees 100% role & recipient synchronization across Bell badge, Drawer, Sidebar, and Full-page view.
 */
export const filterNotificationsForUser = (
  notifications: NotificationItem[],
  currentUser: User | null,
  activeRole: UserRole
): NotificationItem[] => {
  if (!Array.isArray(notifications)) return [];

  return notifications.filter(notif => {
    // 1. Direct recipientId match:
    // If a notification has an explicit recipientId, it is private to that user!
    if (notif.recipientId) {
      if (currentUser?.id && notif.recipientId === currentUser.id) {
        return true;
      }
      const uPhone = (currentUser?.phone || '').replace(/\D/g, '').slice(-10);
      const rPhone = (notif.recipientId || '').replace(/\D/g, '').slice(-10);
      if (uPhone && rPhone && uPhone === rPhone) {
        return true;
      }
      // CRITICAL: Targeted private notification must NOT leak to other users!
      return false;
    }

    // 2. Broadcast to all roles
    if (!notif.recipientRole || notif.recipientRole === 'all') {
      return true;
    }

    // 3. Match activeRole view (no recipientId specified)
    if (notif.recipientRole === activeRole) {
      return true;
    }

    return false;
  });
};

/**
 * 🔊 Web Audio Notification Chime (High-clarity pleasant bell alert)
 */
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle dual-tone ascending harmonic: 587.33Hz (D5) -> 880Hz (A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (_) {
    // Suppress autoplay policy warnings before initial user interaction
  }
};

/**
 * ⚡ Automatically enrich listings with verified FCI Procurement Hub / Silo and APMC Mandi
 * Ensures even legacy or imported listings without FCI details get accurate depot metadata.
 */
export const enrichListingWithFciHub = (
  item: CropListing,
  hubs: CollectionHub[] = initialCollectionHubs
): CropListing => {
  if (!item) return item;

  // Defensive sanitization: guarantee essential fields are never undefined or empty
  const safeItem: CropListing = {
    ...item,
    cropName: item.cropName || 'Farm Produce',
    variety: item.variety || 'Hybrid High-Lycopene Grade A',
    images: (Array.isArray(item.images) && item.images.length > 0)
      ? item.images
      : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'],
    qualityGrade: item.qualityGrade || 'Grade A',
    status: item.status || 'Active',
    category: item.category || 'Vegetables',
    unit: item.unit || 'Quintals',
    quantity: typeof item.quantity === 'number' ? item.quantity : 100,
    pricePerUnit: typeof item.pricePerUnit === 'number' ? item.pricePerUnit : 1500,
    farmerName: item.farmerName || 'Registered Farmer'
  };

  if (safeItem.fciHubName && safeItem.fciHubCode && safeItem.fciHubDistanceKm !== undefined && safeItem.nearestMandi) {
    return safeItem;
  }
  const match = findNearestFciHub(
    safeItem.location || safeItem.farmerLocation,
    safeItem.state || safeItem.farmerState,
    safeItem.district,
    safeItem.pincode,
    hubs
  );
  if (!match) return safeItem;

  return {
    ...safeItem,
    collectionCentreId: safeItem.collectionCentreId || match.hub.id,
    fciHubName: safeItem.fciHubName || match.hub.name,
    fciHubCode: safeItem.fciHubCode || match.hub.code,
    fciHubDistanceKm: safeItem.fciHubDistanceKm !== undefined ? safeItem.fciHubDistanceKm : match.distanceKm,
    fciHubType: safeItem.fciHubType || match.hub.hubType || 'FCI Modern Steel Silo',
    fciHubDistrict: safeItem.fciHubDistrict || match.hub.district,
    fciHubState: safeItem.fciHubState || match.hub.state,
    nearestMandi: safeItem.nearestMandi || match.nearestMandi
  };
};

const AgriContext = createContext<AgriContextType | undefined>(undefined);

const anonymousGuestUser: User = {
  id: 'usr_guest',
  name: 'User',
  role: 'farmer',
  email: 'user@farm2future.in',
  phone: '',
  location: 'Nashik, Maharashtra',
  district: 'Nashik',
  state: 'Maharashtra',
  verified: false,
  aadhaarVerified: false,
  rating: 5.0,
  memberSince: '2026'
};

export const getLocalDeletedSet = (): Set<string> => {
  try {
    const saved = localStorage.getItem('farm2future_deleted_ids');
    return new Set(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set();
  }
};

export const recordLocalDeletedId = (id: string) => {
  if (!id) return;
  try {
    const current = getLocalDeletedSet();
    current.add(id);
    safeLocalStorage.setItem('farm2future_deleted_ids', JSON.stringify(Array.from(current)));
  } catch (_) {}
};

export const getLocalReadNotifSet = (): Set<string> => {
  try {
    const saved = localStorage.getItem('farm2future_read_notif_ids');
    return new Set(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set();
  }
};

export const recordLocalReadNotifIds = (ids: string[]): void => {
  if (!Array.isArray(ids) || ids.length === 0) return;
  try {
    const current = getLocalReadNotifSet();
    ids.forEach(id => {
      if (id) current.add(id);
    });
    safeLocalStorage.setItem('farm2future_read_notif_ids', JSON.stringify(Array.from(current)));
  } catch (_) {}
};

export const sanitizeUserForStorage = (u: any): any => {
  if (!u) return u;
  // Preserve canvas compressed avatar strings (typically 3KB-15KB)
  // Only fallback if payload is an uncompressed raw file exceeding 250,000 chars
  if (u.avatar && typeof u.avatar === 'string' && u.avatar.length > 250000) {
    return {
      ...u,
      avatar: u.role === 'buyer' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        : u.role === 'admin'
          ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    };
  }
  return u;
};

export const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[SafeStorage] LocalStorage quota exceeded on key "${key}", freeing space...`);
      try {
        localStorage.removeItem('farm2future_activity_history');
        localStorage.removeItem('farm2future_notifications');
        localStorage.setItem(key, value);
      } catch (_) {}
    }
  },
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

export const AgriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const delSet = getLocalDeletedSet();
      const saved = localStorage.getItem('farm2future_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((u: any) => !delSet.has(u.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedAuth = localStorage.getItem('farm2future_auth');
      const saved = localStorage.getItem('farm2future_user');
      if (savedAuth === 'true' && saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('farm2future_auth');
      const savedUser = localStorage.getItem('farm2future_user');
      return savedAuth === 'true' && !!savedUser;
    } catch {
      return false;
    }
  });

  const [adminPasskey, setAdminPasskey] = useState<string>(() => {
    try {
      return localStorage.getItem('farm2future_admin_passkey') || 'Krish0386';
    } catch {
      return 'Krish0386';
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('farm2future_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [listings, setListings] = useState<CropListing[]>(() => {
    try {
      const delSet = getLocalDeletedSet();
      const saved = localStorage.getItem('farm2future_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed
            .filter((l: any) => !delSet.has(l.id))
            .map(l => enrichListingWithFciHub(l));
          if (valid.length > 0) return valid;
        }
      }
      return initialListings.filter(l => !delSet.has(l.id)).map(l => enrichListingWithFciHub(l));
    } catch {
      return initialListings.map(l => enrichListingWithFciHub(l));
    }
  });

  const [userLocation, setUserLocationState] = useState<GeoCoordinate>(() => {
    try {
      const saved = localStorage.getItem('farm2future_user_location');
      return saved ? JSON.parse(saved) : DEFAULT_USER_LOCATION;
    } catch {
      return DEFAULT_USER_LOCATION;
    }
  });

  const setUserLocation = (loc: GeoCoordinate) => {
    setUserLocationState(loc);
    localStorage.setItem('farm2future_user_location', JSON.stringify(loc));
  };

  const detectLiveLocation = async (): Promise<GeoCoordinate> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = Number(pos.coords.latitude.toFixed(4));
            const lng = Number(pos.coords.longitude.toFixed(4));
            const dynamicLoc: GeoCoordinate = {
              lat,
              lng,
              name: 'Live GPS Location (Auto-detected)',
              district: userLocation.district || 'Nashik',
              state: userLocation.state || 'Maharashtra',
              pincode: userLocation.pincode || '422209'
            };
            setUserLocation(dynamicLoc);
            resolve(dynamicLoc);
          },
          (err) => {
            console.warn('GPS location access fallback', err);
            resolve(userLocation);
          },
          { timeout: 6000 }
        );
      } else {
        resolve(userLocation);
      }
    });
  };

  // Auto-sync userLocation with currentUser's registered state and district
  useEffect(() => {
    if (currentUser && (currentUser.state || currentUser.location)) {
      const targetState = currentUser.state || '';
      const targetDist = currentUser.district || '';
      const targetLoc = currentUser.location || '';
      const geo = geocodeLocation(targetLoc, targetState, targetDist, currentUser.pincode);

      setUserLocationState(prev => {
        if (targetState && (prev.state !== targetState || (targetDist && prev.district !== targetDist))) {
          let cleanName = targetLoc || (targetDist ? `${targetDist}, ${targetState}` : geo.name);
          if (cleanName && targetState && !cleanName.toLowerCase().includes(targetState.toLowerCase())) {
            cleanName = `${cleanName}, ${targetState}`;
          }
          const syncedLoc: GeoCoordinate = {
            lat: geo.lat || prev.lat,
            lng: geo.lng || prev.lng,
            name: cleanName || geo.name || `${targetState} Agro Center`,
            district: targetDist || geo.district || prev.district,
            state: targetState || geo.state || prev.state,
            pincode: currentUser.pincode || geo.pincode || prev.pincode
          };
          try { localStorage.setItem('farm2future_user_location', JSON.stringify(syncedLoc)); } catch {}
          return syncedLoc;
        }
        return prev;
      });
    }
  }, [currentUser?.id, currentUser?.state, currentUser?.district]);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const delSet = getLocalDeletedSet();
      const saved = localStorage.getItem('farm2future_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((o: any) => !delSet.has(o.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [vehicles, setVehicles] = useState<VehicleDetails[]>(() => {
    try {
      const delSet = getLocalDeletedSet();
      const saved = localStorage.getItem('farm2future_vehicles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p: any) => !delSet.has(p.id) && !delSet.has(p.vehicleNo));
          const existingIds = new Set(filtered.map((p: any) => p.id));
          const mockFiltered = initialVehicles.filter(iv => !delSet.has(iv.id) && !delSet.has(iv.vehicleNo) && !existingIds.has(iv.id));
          return [...filtered, ...mockFiltered];
        }
      }
      return initialVehicles.filter(iv => !delSet.has(iv.id) && !delSet.has(iv.vehicleNo));
    } catch {
      return initialVehicles;
    }
  });

  const [bulkDemands, setBulkDemands] = useState<BulkDemandPool[]>(() => {
    try {
      const delSet = getLocalDeletedSet();
      const saved = localStorage.getItem('farm2future_bulk_demands');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((b: any) => !delSet.has(b.id));
        }
      }
      return initialBulkDemands.filter((b: any) => !delSet.has(b.id));
    } catch {
      return initialBulkDemands;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const delSet = getLocalDeletedSet();
      const readSet = getLocalReadNotifSet();
      const saved = safeLocalStorage.getItem('farm2future_notifications') || localStorage.getItem('farm2future_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter((n: any) => !delSet.has(n.id))
            .map((n: any) => (n.read || readSet.has(n.id)) ? { ...n, read: true } : n);
          if (filtered.length > 0) return filtered;
        }
      }
      return initialNotifications
        .filter((n: any) => !delSet.has(n.id))
        .map((n: any) => (n.read || readSet.has(n.id)) ? { ...n, read: true } : n);
    } catch {
      return initialNotifications;
    }
  });

  const [latestToast, setLatestToast] = useState<NotificationItem | null>(null);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_activity_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mandiPrices, setMandiPrices] = useState<MandiPriceTrend[]>(() => {
    const activeState = currentUser?.state || 'Maharashtra';
    const activeDistrict = currentUser?.district || 'Nashik';
    return getMandiPricesForLocation(activeState, activeDistrict);
  });

  // Dynamically recalculate APMC mandi rates based on the logged-in profile location (state & district)
  useEffect(() => {
    const activeState = currentUser?.state || userLocation.state || 'Maharashtra';
    const activeDistrict = currentUser?.district || userLocation.district || 'Nashik';
    setMandiPrices(getMandiPricesForLocation(activeState, activeDistrict));
  }, [currentUser?.state, currentUser?.district, currentUser?.location, userLocation.state, userLocation.district]);

  const refreshMandiPrices = (state?: string, district?: string) => {
    const activeState = state || currentUser?.state || userLocation.state || 'Maharashtra';
    const activeDistrict = district || currentUser?.district || userLocation.district || 'Nashik';
    setMandiPrices(getMandiPricesForLocation(activeState, activeDistrict));
  };
  const [collectionHubs, setCollectionHubs] = useState<CollectionHub[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_collection_hubs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialCollectionHubs.length) {
          return parsed;
        }
      }
    } catch {}
    return initialCollectionHubs;
  });

  const [selectedHubId, setSelectedHubIdState] = useState<string>(() => {
    try {
      return localStorage.getItem('farm2future_selected_hub_id') || initialCollectionHubs[0]?.id || 'fci_pb_moga';
    } catch {
      return initialCollectionHubs[0]?.id || 'fci_pb_moga';
    }
  });

  const setSelectedHubId = (id: string) => {
    setSelectedHubIdState(id);
    try {
      localStorage.setItem('farm2future_selected_hub_id', id);
    } catch {}
  };

  const activeHub = collectionHubs.find(h => h.id === selectedHubId) || collectionHubs[0] || initialCollectionHubs[0];

  const addCollectionHub = (hub: CollectionHub) => {
    setCollectionHubs(prev => {
      const updated = [hub, ...prev];
      try {
        localStorage.setItem('farm2future_collection_hubs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };
  
  const [selectedListingModal, setSelectedListingModal] = useState<CropListing | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      return localStorage.getItem('farm2future_active_tab') || 'overview';
    } catch {
      return 'overview';
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  const openAuthModal = useCallback((role?: UserRole, mode: 'login' | 'register' | 'forgot_password' = 'login') => {
    if (role) setAuthModalRole(role);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);
  const [language, setLanguageState] = useState<'en' | 'hi'>(() => {
    try {
      const saved = localStorage.getItem('farm2future_language');
      return (saved === 'hi' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((newLang: 'en' | 'hi') => {
    // Apply immediately to DOM so observer is disconnected before React re-render cycle
    applyLanguageToDOM(newLang);
    setLanguageState(newLang);
  }, []);

  // Automatically apply language across the entire application interface
  useEffect(() => {
    applyLanguageToDOM(language);
  }, [language]);

  // Stakeholder cohort mode: 'registered_now' (real live DB users) vs 'upcoming' (projected network)
  const [stakeholderCohortMode, setStakeholderCohortModeState] = useState<StakeholderCohortMode>(() => {
    try {
      const saved = localStorage.getItem('farm2future_stakeholder_cohort');
      return (saved === 'upcoming' || saved === 'registered_now') ? saved : 'registered_now';
    } catch {
      return 'registered_now';
    }
  });

  const setStakeholderCohortMode = useCallback((mode: StakeholderCohortMode) => {
    setStakeholderCohortModeState(mode);
    try {
      localStorage.setItem('farm2future_stakeholder_cohort', mode);
    } catch {
      // ignore
    }
  }, []);

  const initialLoadedRef = useRef(false);

  const listingsRef = useRef(listings);
  listingsRef.current = listings;

  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const registeredUsersRef = useRef(registeredUsers);
  registeredUsersRef.current = registeredUsers;

  const bulkDemandsRef = useRef(bulkDemands);
  bulkDemandsRef.current = bulkDemands;

  const vehiclesRef = useRef(vehicles);
  vehiclesRef.current = vehicles;

  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const activityHistoryRef = useRef(activityHistory);
  activityHistoryRef.current = activityHistory;

  const isRemoteSyncingRef = useRef(false);

  // Load database from backend on initial mount
  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        const db = await dbService.loadDatabase();
        if (db) {
          const remoteDeleted = Array.isArray(db.deletedIds) ? db.deletedIds : [];
          const currentLocalDeleted = Array.from(getLocalDeletedSet());
          const mergedDeleted = Array.from(new Set([...currentLocalDeleted, ...remoteDeleted]));
          try {
            safeLocalStorage.setItem('farm2future_deleted_ids', JSON.stringify(mergedDeleted));
          } catch (_) {}
          const deletedSet = new Set(mergedDeleted);

          if (Array.isArray(db.users)) {
            const activeUsers = db.users.filter((u: any) => !deletedSet.has(u.id));
            setRegisteredUsers(activeUsers);
            const sanitizedUsers = activeUsers.map(sanitizeUserForStorage);
            safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(sanitizedUsers));
          }
          if (Array.isArray(db.listings)) {
            let activeListings = db.listings
              .filter((l: any) => !deletedSet.has(l.id))
              .map((l: any) => enrichListingWithFciHub(l));
            if (activeListings.length === 0 && initialListings.length > 0) {
              activeListings = initialListings
                .filter((l: any) => !deletedSet.has(l.id))
                .map((l: any) => enrichListingWithFciHub(l));
            }
            setListings(activeListings);
            safeLocalStorage.setItem('farm2future_listings', JSON.stringify(activeListings));
          }
          if (Array.isArray(db.orders)) {
            const activeOrders = (db.orders as Order[]).filter(o => !deletedSet.has(o.id) && !deletedSet.has(o.orderNumber));
            setOrders(activeOrders);
            safeLocalStorage.setItem('farm2future_orders', JSON.stringify(activeOrders));
          }
          if (Array.isArray(db.vehicles) && db.vehicles.length > 0) {
            const activeVehicles = db.vehicles.filter((v: any) => !deletedSet.has(v.id) && !deletedSet.has(v.vehicleNo));
            const existingIds = new Set(activeVehicles.map((v: any) => v.id));
            const mergedVehicles = [...activeVehicles, ...initialVehicles.filter(iv => !deletedSet.has(iv.id) && !deletedSet.has(iv.vehicleNo) && !existingIds.has(iv.id))];
            setVehicles(mergedVehicles);
            safeLocalStorage.setItem('farm2future_vehicles', JSON.stringify(mergedVehicles));
          } else {
            const activeVehicles = initialVehicles.filter(iv => !deletedSet.has(iv.id) && !deletedSet.has(iv.vehicleNo));
            setVehicles(activeVehicles);
            safeLocalStorage.setItem('farm2future_vehicles', JSON.stringify(activeVehicles));
          }
          if (Array.isArray(db.bulkDemands)) {
            const activeBulkDemands = db.bulkDemands.filter((b: any) => !deletedSet.has(b.id));
            setBulkDemands(activeBulkDemands);
            safeLocalStorage.setItem('farm2future_bulk_demands', JSON.stringify(activeBulkDemands));
          }
          if (Array.isArray(db.notifications)) {
            const readSet = getLocalReadNotifSet();
            const activeNotifs = db.notifications
              .filter((n: any) => !deletedSet.has(n.id))
              .map((n: any) => (n.read || readSet.has(n.id)) ? { ...n, read: true } : n);
            setNotifications(activeNotifs);
            safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(activeNotifs));
          }
          if (Array.isArray(db.activityHistory)) {
            setActivityHistory(db.activityHistory);
            safeLocalStorage.setItem('farm2future_activity_history', JSON.stringify(db.activityHistory));
          }
          if (db.adminPasskey) {
            setAdminPasskey(db.adminPasskey);
            safeLocalStorage.setItem('farm2future_admin_passkey', db.adminPasskey);
          }
        }
      } catch (err) {
        console.warn('Initial DB load exception', err);
      } finally {
        initialLoadedRef.current = true;
      }
    };

    loadFromDatabase();

    // Cross-server Real-Time Polling for seamless multi-server/multi-window synchronization
    // Only applies updates when data has actually changed to prevent render jitter/fluctuation
    const isDifferent = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b);

    const pollInterval = setInterval(async () => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return;
        const db = await dbService.loadDatabase();
        if (db) {
          const remoteDeleted = Array.isArray(db.deletedIds) ? db.deletedIds : [];
          const currentLocalDeleted = Array.from(getLocalDeletedSet());
          const mergedDeleted = Array.from(new Set([...currentLocalDeleted, ...remoteDeleted]));
          if (mergedDeleted.length > currentLocalDeleted.length) {
            try {
              safeLocalStorage.setItem('farm2future_deleted_ids', JSON.stringify(mergedDeleted));
            } catch (_) {}
          }
          const deletedSet = new Set(mergedDeleted);
          let changedRemotely = false;

          if (Array.isArray(db.users)) {
            const fetchedUsers = db.users.filter((u: any) => !deletedSet.has(u.id));
            if (isDifferent(fetchedUsers, registeredUsersRef.current)) {
              changedRemotely = true;
              setRegisteredUsers(fetchedUsers);
              const sanitizedUsers = fetchedUsers.map(sanitizeUserForStorage);
              safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(sanitizedUsers));
            }
          }
          if (Array.isArray(db.listings)) {
            const fetchedListings = db.listings
              .filter((l: any) => !deletedSet.has(l.id))
              .map((l: any) => enrichListingWithFciHub(l));
            if (isDifferent(fetchedListings, listingsRef.current)) {
              changedRemotely = true;
              setListings(fetchedListings);
              safeLocalStorage.setItem('farm2future_listings', JSON.stringify(fetchedListings));
            }
          }
          if (Array.isArray(db.orders)) {
            const fetchedOrders: Order[] = db.orders.filter((o: any) => !deletedSet.has(o.id) && !deletedSet.has(o.orderNumber));
            if (isDifferent(fetchedOrders, ordersRef.current)) {
              changedRemotely = true;
              setOrders(fetchedOrders);
              safeLocalStorage.setItem('farm2future_orders', JSON.stringify(fetchedOrders));
            }
          }
          if (Array.isArray(db.bulkDemands)) {
            const fetchedBulkDemands = db.bulkDemands.filter((b: any) => !deletedSet.has(b.id));
            if (isDifferent(fetchedBulkDemands, bulkDemandsRef.current)) {
              changedRemotely = true;
              setBulkDemands(fetchedBulkDemands);
              safeLocalStorage.setItem('farm2future_bulk_demands', JSON.stringify(fetchedBulkDemands));
            }
          }
          if (Array.isArray(db.vehicles) && db.vehicles.length > 0) {
            const fetchedVehicles = db.vehicles.filter((v: any) => !deletedSet.has(v.id) && !deletedSet.has(v.vehicleNo));
            if (isDifferent(fetchedVehicles, vehiclesRef.current)) {
              changedRemotely = true;
              setVehicles(fetchedVehicles);
              safeLocalStorage.setItem('farm2future_vehicles', JSON.stringify(fetchedVehicles));
            }
          }
          if (Array.isArray(db.notifications)) {
            const readSet = getLocalReadNotifSet();
            const fetchedNotifs = db.notifications
              .filter((n: any) => !deletedSet.has(n.id))
              .map((n: any) => (n.read || readSet.has(n.id)) ? { ...n, read: true } : n);
            if (isDifferent(fetchedNotifs, notificationsRef.current)) {
              changedRemotely = true;
              setNotifications(fetchedNotifs);
              safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(fetchedNotifs));
            }
          }

          if (changedRemotely) {
            isRemoteSyncingRef.current = true;
          }
        }
      } catch {}
    }, 8000);

    return () => clearInterval(pollInterval);
  }, []);

  // Sync to database and localStorage whenever state updates
  useEffect(() => {
    if (!initialLoadedRef.current) return;
    if (isRemoteSyncingRef.current) {
      isRemoteSyncingRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      dbService.syncDatabase({
        users: registeredUsers,
        listings,
        orders,
        vehicles,
        bulkDemands,
        notifications,
        activityHistory,
        adminPasskey
      });
      safeLocalStorage.setItem('farm2future_bulk_demands', JSON.stringify(bulkDemands));
    }, 800);

    return () => clearTimeout(timer);
  }, [registeredUsers, listings, orders, vehicles, bulkDemands, notifications, activityHistory, adminPasskey]);

  // Sync individual states to localStorage safely
  useEffect(() => {
    if (currentUser) {
      const sanitized = sanitizeUserForStorage(currentUser);
      safeLocalStorage.setItem('farm2future_user', JSON.stringify(sanitized));
    }
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorage.setItem('farm2future_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    const sanitizedList = registeredUsers.map(sanitizeUserForStorage);
    safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(sanitizedList));
  }, [registeredUsers]);

  useEffect(() => {
    safeLocalStorage.setItem('farm2future_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    safeLocalStorage.setItem('farm2future_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeLocalStorage.setItem('farm2future_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeLocalStorage.setItem('farm2future_activity_history', JSON.stringify(activityHistory));
  }, [activityHistory]);

  const logActivity = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const fullLog: ActivityLog = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: log.userId || currentUser?.id,
      userName: log.userName || currentUser?.name || 'System User',
      userRole: (log.userRole || currentUser?.role || 'system') as any,
      actionType: log.actionType,
      title: log.title,
      description: log.description,
      timestamp: new Date().toISOString(),
      metadata: log.metadata || {}
    };

    setActivityHistory(prev => [fullLog, ...prev.slice(0, 499)]);
    dbService.logActivity(fullLog);
  };

  const clearActivityHistory = () => {
    setActivityHistory([]);
    localStorage.removeItem('farm2future_activity_history');
    dbService.syncDatabase({ activityHistory: [] });
  };

  const addVehicle = (data: Partial<VehicleDetails>): VehicleDetails => {
    const newVehicle: VehicleDetails = {
      id: data.id || 'veh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      vehicleNo: (data.vehicleNo || 'MH-15-XX-0000').toUpperCase().trim(),
      vehicleType: data.vehicleType || '12-Ton Insulated Cold Reefer',
      modelName: data.modelName || 'Eicher Pro 3015 Reefer Plus',
      transporterName: data.transporterName || 'GreenWheels Cold Agri-Logistics',
      driverName: data.driverName || 'Verified Driver',
      driverPhone: data.driverPhone || '+91 98765 43210',
      driverLicenseNo: data.driverLicenseNo || ('DL-' + Math.floor(10000000 + Math.random() * 90000000)),
      capacityTons: Number(data.capacityTons) || 12.0,
      temperatureCelsius: Number(data.temperatureCelsius) || 14.0,
      humidityPercent: Number(data.humidityPercent) || 52,
      gpsDeviceId: data.gpsDeviceId || ('GPS-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
      rcNumber: data.rcNumber || ('RC-' + (data.vehicleNo || 'MH-15-XX-0000')),
      insuranceValidity: data.insuranceValidity || 'Valid Till 2028',
      pucCertificateNo: data.pucCertificateNo || ('PUC-' + Math.floor(1000 + Math.random() * 9000)),
      currentStatus: data.currentStatus || 'Available',
      originHub: data.originHub || 'Nashik North Agri Aggregation Hub #04',
      destinationWarehouse: data.destinationWarehouse || 'Regional Logistics Corridors',
      state: data.state || 'Maharashtra',
      cityHub: data.cityHub || 'Nashik',
      serviceType: data.serviceType || 'Reefer Cold Chain',
      ratePerKm: data.ratePerKm || 28,
      rating: data.rating || 4.9,
      operatingRoutes: data.operatingRoutes || ['Intra-State Mandi Corridor'],
      verifiedTransporter: true
    };

    setVehicles(prev => {
      const filtered = prev.filter(v => v.vehicleNo !== newVehicle.vehicleNo);
      return [newVehicle, ...filtered];
    });

    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Hub Officer',
      userRole: currentUser?.role || 'collection_centre',
      actionType: 'admin_action',
      title: `Vehicle Registered: ${newVehicle.vehicleNo}`,
      description: `${newVehicle.vehicleNo} (${newVehicle.vehicleType}, Driver: ${newVehicle.driverName}) added to fleet registry.`,
      metadata: { vehicleNo: newVehicle.vehicleNo, transporterName: newVehicle.transporterName }
    });

    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<VehicleDetails>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    recordLocalDeletedId(id);
    setVehicles(prev => {
      const updated = prev.filter(v => v.id !== id && v.vehicleNo !== id);
      try {
        localStorage.setItem('farm2future_vehicles', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const setActiveTab = (tab: string, skipHistory: boolean = false) => {
    try {
      localStorage.setItem('farm2future_active_tab', tab);
    } catch {}
    setActiveTabState(current => {
      if (tab === current) return current;
      if (!skipHistory) {
        setHistoryStack(prev => {
          if (prev.length > 0 && prev[prev.length - 1] === current) return prev;
          return [...prev, current];
        });
        try {
          window.history.pushState({ tab }, '', window.location.pathname);
        } catch {}
      }
      return tab;
    });
  };

  const navigateBack = () => {
    if (selectedListingModal) {
      setSelectedListingModal(null);
      return;
    }
    if (historyStack.length > 0) {
      setHistoryStack(prev => {
        const next = [...prev];
        const prevTab = next.pop() || 'overview';
        setActiveTabState(prevTab);
        try {
          window.history.replaceState({ tab: prevTab }, '', window.location.pathname);
        } catch {}
        return next;
      });
    } else if (activeTab !== 'overview') {
      setActiveTabState('overview');
    }
  };

  const canGoBack = historyStack.length > 0 || activeTab !== 'overview' || !!selectedListingModal;

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTabState(event.state.tab);
      } else {
        navigateBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [historyStack, selectedListingModal, activeTab]);

  const activeRole: UserRole = currentUser?.role || 'farmer';

  const [showWelcomeGateway, setShowWelcomeGatewayState] = useState<boolean>(() => {
    try {
      const inPortal = sessionStorage.getItem('farm2future_in_portal');
      return inPortal !== 'true';
    } catch {
      return true;
    }
  });

  const setShowWelcomeGateway = (show: boolean) => {
    setShowWelcomeGatewayState(show);
    try {
      if (show) {
        sessionStorage.removeItem('farm2future_in_portal');
      } else {
        sessionStorage.setItem('farm2future_in_portal', 'true');
      }
    } catch {}
  };

  const openGateway = () => {
    setShowWelcomeGateway(true);
  };

  const enterPortal = (role: UserRole) => {
    // 1. If currently logged-in user matches role, keep them
    if (currentUser && currentUser.role === role) {
      setShowWelcomeGateway(false);
      return;
    }

    // 2. If logged in under another role, check for account matching the user's phone
    const currentPhoneLast10 = (currentUser?.phone || '').replace(/\D/g, '').slice(-10);
    let matching = currentPhoneLast10 
      ? registeredUsers.find(u => u && u.role === role && (u.phone || '').replace(/\D/g, '').slice(-10) === currentPhoneLast10)
      : null;

    if (!matching && currentUser) {
      // Auto-provision this user for target role
      const autoUser: User = {
        ...currentUser,
        id: `usr_${role}_${Date.now()}`,
        role: role,
        avatar: currentUser.avatar || (role === 'buyer' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
        businessName: role === 'buyer' ? (currentUser.businessName || `${currentUser.name} Agro Buyer`) : undefined,
        farmSizeAcres: role === 'farmer' ? (currentUser.farmSizeAcres || 5) : undefined,
        hubName: role === 'collection_centre' ? (currentUser.hubName || `${currentUser.district || 'Regional'} Hub`) : undefined
      };
      setRegisteredUsers(prev => {
        const updated = [autoUser, ...prev.filter(u => u.id !== autoUser.id)];
        safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(updated.map(sanitizeUserForStorage)));
        dbService.syncDatabase({ users: updated });
        return updated;
      });
      matching = autoUser;
    }

    // If no user is logged in or no matching authenticated user, open login modal
    if (!matching || !currentUser) {
      openAuthModal(role, 'login');
      return;
    }

    setCurrentUser(matching);
    setIsAuthenticated(true);
    if (role === 'admin') {
      setIsAdminAuthenticated(true);
      safeLocalStorage.setItem('farm2future_admin_auth', 'true');
    }
    try {
      localStorage.setItem('farm2future_user', JSON.stringify(matching));
      localStorage.setItem('farm2future_auth', 'true');
    } catch {}

    if (role === 'buyer') {
      setActiveTab('marketplace');
    } else if (role === 'farmer') {
      setActiveTab('overview');
    } else if (role === 'collection_centre') {
      setActiveTab('incoming');
    } else {
      setActiveTab('overview');
    }

    setShowWelcomeGateway(false);
  };

  const registerUser = (userData: Partial<User> & { role: UserRole; password?: string }) => {
    const newUser: User = {
      id: userData.id || `usr_${userData.role}_${Date.now()}`,
      name: userData.name || (userData.role === 'farmer' ? 'Kisan Member' : userData.role === 'buyer' ? 'Retail Buyer' : userData.role === 'collection_centre' ? 'Hub Officer' : 'Govt Administrator'),
      phone: userData.phone || '+91 98765 00000',
      email: userData.email || (userData.name ? userData.name.toLowerCase().replace(/\s+/g, '') + '@farm2future.in' : 'user@farm2future.in'),
      role: userData.role,
      password: userData.password || '',
      location: userData.location || 'India',
      district: userData.district || 'District',
      state: userData.state || 'State',
      verified: true,
      aadhaarVerified: true,
      aadhaarNumber: userData.aadhaarNumber || (userData.role === 'farmer' ? '5432 8765 1098' : userData.role === 'buyer' ? '9876 5432 1098' : undefined),
      rating: 4.9,
      memberSince: '2026',
      avatar: userData.avatar || (userData.role === 'farmer' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
        : userData.role === 'buyer'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : userData.role === 'collection_centre'
            ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'),
      farmSizeAcres: userData.farmSizeAcres || (userData.role === 'farmer' ? 10 : undefined),
      businessName: userData.businessName || (userData.role === 'buyer' ? userData.name : undefined),
      gstin: userData.gstin,
      hubName: userData.hubName
    };

    setRegisteredUsers(prev => {
      const filtered = prev.filter(u => u && u.id !== newUser.id && !((u.phone || '') === newUser.phone && u.role === newUser.role));
      const updated = [newUser, ...filtered];
      const sanitized = updated.map(sanitizeUserForStorage);
      safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(sanitized));
      dbService.syncDatabase({ users: updated });
      return updated;
    });

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    if (newUser.role === 'admin') {
      setIsAdminAuthenticated(true);
      safeLocalStorage.setItem('farm2future_admin_auth', 'true');
    }
    if (newUser.role === 'buyer') setActiveTab('marketplace');
    else if (newUser.role === 'collection_centre') setActiveTab('incoming');
    else if (newUser.role === 'admin') setActiveTab('overview');
    else setActiveTab('overview');
    
    const sanitizedUser = sanitizeUserForStorage(newUser);
    safeLocalStorage.setItem('farm2future_user', JSON.stringify(sanitizedUser));
    safeLocalStorage.setItem('farm2future_auth', 'true');
    setShowWelcomeGatewayState(false);
    try { sessionStorage.setItem('farm2future_in_portal', 'true'); } catch {}

    // Audit Log & Database Sync
    logActivity({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      actionType: 'register',
      title: 'New Account Registered',
      description: `${newUser.name} created a new ${newUser.role} account from ${newUser.location}.`,
      metadata: { phone: newUser.phone, role: newUser.role }
    });
  };

  const deleteUser = (userId: string) => {
    recordLocalDeletedId(userId);
    setRegisteredUsers(prev => {
      const updated = prev.filter(u => u && u.id !== userId);
      try {
        const sanitized = updated.map(sanitizeUserForStorage);
        safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(sanitized));
      } catch (_) {}
      dbService.syncDatabase({ users: updated });
      return updated;
    });

    // If deleting currently logged in user, log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      safeLocalStorage.removeItem('farm2future_user');
      safeLocalStorage.setItem('farm2future_auth', 'false');
    }

    logActivity({
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Administrator',
      userRole: 'admin',
      actionType: 'admin_action',
      title: 'User Profile Deleted',
      description: `Admin deleted user profile ID ${userId} from database.`
    });
  };

  const clearAllUsers = () => {
    setRegisteredUsers([]);
    safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify([]));
    dbService.syncDatabase({ users: [] });

    // Reset current user session if not admin passkey
    setCurrentUser(null);
    setIsAuthenticated(false);
    safeLocalStorage.removeItem('farm2future_user');
    safeLocalStorage.setItem('farm2future_auth', 'false');

    logActivity({
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Administrator',
      userRole: 'admin',
      actionType: 'admin_action',
      title: 'All Saved Profiles Deleted',
      description: 'Admin wiped all registered user profiles from the persistent database.'
    });
  };

  const loginUser = (userData: Partial<User> & { role: UserRole; password?: string }): { success: boolean; message?: string } => {
    const targetRole = userData.role || 'farmer';
    const cleanPhoneDigits = (userData.phone || '').trim().replace(/\D/g, '');
    const cleanPhoneLast10 = cleanPhoneDigits.length >= 10 ? cleanPhoneDigits.slice(-10) : cleanPhoneDigits;
    const cleanName = (userData.name || '').trim().toLowerCase();
    const cleanAadhaar = (userData.aadhaarNumber || userData.phone || '').trim().replace(/\D/g, '');
    const inputPassword = (userData.password || '').trim();

    // Master key is ONLY permitted for official Govt Admin console login
    const isAdminTarget = targetRole === 'admin';
    const isMasterKey = isAdminTarget && (
      inputPassword === 'Krish0386' || 
      inputPassword === 'ADMIN@F2F2026' || 
      inputPassword === adminPasskey
    );

    // Password is required for all login attempts
    if (!inputPassword && !isMasterKey) {
      return {
        success: false,
        message: language === 'hi'
          ? '❌ कृपया अपना पासवर्ड दर्ज करें।'
          : '❌ Please enter your password.'
      };
    }

    const isPhoneOrAadhaarMatch = (u: User) => {
      if (!u) return false;
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const uPhoneLast10 = uPhoneDigits.length >= 10 ? uPhoneDigits.slice(-10) : uPhoneDigits;
      const phoneMatch = Boolean(cleanPhoneLast10 && uPhoneLast10 && cleanPhoneLast10 === uPhoneLast10);

      const uAadhaarClean = (u.aadhaarNumber || '').replace(/\D/g, '');
      const aadhaarMatch = Boolean(
        cleanAadhaar.length >= 10 && 
        uAadhaarClean.length >= 10 && 
        (uAadhaarClean === cleanAadhaar || uAadhaarClean.includes(cleanAadhaar) || cleanAadhaar.includes(uAadhaarClean))
      );

      return phoneMatch || aadhaarMatch;
    };

    const isNameMatch = (u: User) => {
      if (!u || !cleanName) return false;
      return Boolean(u.name && u.name.trim().toLowerCase() === cleanName);
    };

    // If phone or aadhaar was provided, strictly match against phone/aadhaar
    const isMatch = (u: User) => {
      if (cleanPhoneLast10 || cleanAadhaar.length >= 10) {
        return isPhoneOrAadhaarMatch(u);
      }
      return isNameMatch(u);
    };

    // 1. First, search for account strictly under the requested role
    let userToLogin = registeredUsers.find(u => u && u.role === targetRole && isMatch(u));

    // 2. If not found under requested role, check if user exists under another role with matching credentials
    if (!userToLogin) {
      const otherRoleUser = registeredUsers.find(u => u && isMatch(u));
      if (otherRoleUser) {
        // Validate password against their existing account
        let expectedPass = (otherRoleUser.password || '').trim();
        if (!expectedPass && cleanPhoneLast10) {
          const sibling = registeredUsers.find(u => 
            u && (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhoneLast10 && (u.password || '').trim()
          );
          if (sibling && sibling.password) expectedPass = sibling.password.trim();
        }

        if (expectedPass) {
          if (inputPassword !== expectedPass && !isMasterKey) {
            return {
              success: false,
              message: language === 'hi'
                ? '❌ गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।'
                : '❌ Incorrect password! Please enter the correct password.'
            };
          }
        } else if (!isMasterKey) {
          return {
            success: false,
            message: language === 'hi'
              ? '❌ इस खाते के लिए पासवर्ड सेट नहीं है। कृपया "Forgot Password" से नया पासवर्ड बनाएं।'
              : '❌ No password set for this account. Please use "Forgot Password" to create a new password.'
          };
        }

        // Password is confirmed correct! Auto-activate their profile under the requested role
        const autoActivated: User = {
          ...otherRoleUser,
          id: `usr_${targetRole}_${Date.now()}`,
          role: targetRole,
          password: expectedPass || inputPassword,
          avatar: otherRoleUser.avatar || (targetRole === 'buyer' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
          businessName: targetRole === 'buyer' 
            ? (otherRoleUser.businessName || `${otherRoleUser.name} Agro Buyer`) 
            : undefined,
          farmSizeAcres: targetRole === 'farmer' 
            ? (otherRoleUser.farmSizeAcres || 5) 
            : undefined,
          hubName: targetRole === 'collection_centre' 
            ? (otherRoleUser.hubName || `${otherRoleUser.district || 'Regional'} Hub`) 
            : undefined
        };

        setRegisteredUsers(prev => {
          const updated = [autoActivated, ...prev.filter(u => u.id !== autoActivated.id)];
          safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(updated.map(sanitizeUserForStorage)));
          dbService.syncDatabase({ users: updated });
          return updated;
        });

        userToLogin = autoActivated;
      }
    }

    if (userToLogin) {
      // Validate password strictly
      let expectedPassword = (userToLogin.password || '').trim();
      if (!expectedPassword && cleanPhoneLast10) {
        const sibling = registeredUsers.find(u => 
          u && (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhoneLast10 && (u.password || '').trim()
        );
        if (sibling && sibling.password) expectedPassword = sibling.password.trim();
      }

      if (expectedPassword) {
        if (inputPassword !== expectedPassword && !isMasterKey) {
          return {
            success: false,
            message: language === 'hi'
              ? '❌ गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।'
              : '❌ Incorrect password! Please enter the correct password.'
          };
        }
      } else if (!isMasterKey) {
        return {
          success: false,
          message: language === 'hi'
            ? '❌ इस खाते के लिए पासवर्ड सेट नहीं है। कृपया "Forgot Password" से नया पासवर्ड बनाएं।'
            : '❌ No password set for this account. Please use "Forgot Password" to create a new password.'
        };
      }

      // If user had no password recorded, persist the entered valid password
      const loggedInUser: User = userToLogin;
      if (!loggedInUser.password && inputPassword) {
        const withPass: User = { ...loggedInUser, password: inputPassword };
        setRegisteredUsers(prev => prev.map(u => (u && u.id === withPass.id ? withPass : u)));
        userToLogin = withPass;
      }

      setCurrentUser(userToLogin);
      setIsAuthenticated(true);
      if (userToLogin.role === 'admin') {
        setIsAdminAuthenticated(true);
        safeLocalStorage.setItem('farm2future_admin_auth', 'true');
      }
      if (userToLogin.role === 'buyer') setActiveTab('marketplace');
      else if (userToLogin.role === 'collection_centre') setActiveTab('incoming');
      else if (userToLogin.role === 'admin') setActiveTab('overview');
      else setActiveTab('overview');
      
      const sanitized = sanitizeUserForStorage(userToLogin);
      safeLocalStorage.setItem('farm2future_user', JSON.stringify(sanitized));
      safeLocalStorage.setItem('farm2future_auth', 'true');
      setShowWelcomeGatewayState(false);
      try { sessionStorage.setItem('farm2future_in_portal', 'true'); } catch {}

      // Audit Log & Database Sync
      logActivity({
        userId: userToLogin.id,
        userName: userToLogin.name,
        userRole: userToLogin.role,
        actionType: 'login',
        title: 'User Logged In',
        description: `${userToLogin.name} logged into ${userToLogin.role} portal.`,
        metadata: { phone: userToLogin.phone, role: userToLogin.role }
      });

      return { success: true };
    } else {
      return {
        success: false,
        message: language === 'hi'
          ? '❌ इस नंबर से कोई पंजीकृत खाता नहीं मिला। कृपया "नया खाता बनाएं (Register)" पर क्लिक करके खाता बनाएं।'
          : '❌ No registered account found with this phone number or Aadhaar. Please switch to "Register" to create your account.'
      };
    }
  };

  const resetUserPassword = (
    identifier: string,
    newPassword: string,
    role?: UserRole
  ): { success: boolean; message: string; user?: User } => {
    const cleanId = (identifier || '').trim().replace(/\D/g, '');
    const cleanEmail = (identifier || '').trim().toLowerCase();

    if (!cleanId && !cleanEmail) {
      return {
        success: false,
        message: language === 'hi'
          ? 'कृपया वैध मोबाइल नंबर या आधार दर्ज करें।'
          : 'Please enter a valid mobile number or Aadhaar.'
      };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return {
        success: false,
        message: language === 'hi'
          ? 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।'
          : 'New password must be at least 4 characters long.'
      };
    }

    // Match across registeredUsers
    const target = registeredUsers.find(u => {
      if (role && u.role !== role) return false;
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const uAadhaar = (u.aadhaarNumber || '').replace(/\D/g, '');
      const phoneMatch = cleanId && (uPhone.includes(cleanId) || cleanId.includes(uPhone));
      const aadhaarMatch = cleanId.length >= 10 && (uAadhaar.includes(cleanId) || cleanId.includes(uAadhaar));
      const emailMatch = u.email && cleanEmail === u.email.toLowerCase();
      return phoneMatch || aadhaarMatch || emailMatch;
    }) || registeredUsers.find(u => {
      // Fallback: match without role constraint
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const uAadhaar = (u.aadhaarNumber || '').replace(/\D/g, '');
      const phoneMatch = cleanId && (uPhone.includes(cleanId) || cleanId.includes(uPhone));
      const aadhaarMatch = cleanId.length >= 10 && (uAadhaar.includes(cleanId) || cleanId.includes(uAadhaar));
      const emailMatch = u.email && cleanEmail === u.email.toLowerCase();
      return phoneMatch || aadhaarMatch || emailMatch;
    });

    if (!target) {
      return {
        success: false,
        message: language === 'hi'
          ? 'इस नंबर से कोई पंजीकृत खाता नहीं मिला। कृपया अपना नंबर जांचें।'
          : 'No registered user found with this mobile or Aadhaar number.'
      };
    }

    const updatedUser: User = {
      ...target,
      password: newPassword.trim()
    };

    setRegisteredUsers(prev => {
      const updated = prev.map(u => u.id === target.id ? updatedUser : u);
      try {
        const sanitized = updated.map(sanitizeUserForStorage);
        safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(sanitized));
      } catch (_) {}
      dbService.syncDatabase({ users: updated });
      return updated;
    });

    if (currentUser && currentUser.id === target.id) {
      setCurrentUser(updatedUser);
      const sanitized = sanitizeUserForStorage(updatedUser);
      safeLocalStorage.setItem('farm2future_user', JSON.stringify(sanitized));
    }

    logActivity({
      userId: target.id,
      userName: target.name,
      userRole: target.role,
      actionType: 'profile_update',
      title: 'Password Reset Successful',
      description: `${target.name} (${target.role}) reset their account password successfully.`
    });

    return {
      success: true,
      message: language === 'hi'
        ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है!'
        : 'Password has been reset successfully!',
      user: updatedUser
    };
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      ...updates
    };
    setCurrentUser(updatedUser);
    safeLocalStorage.setItem('farm2future_user', JSON.stringify(updatedUser));
    
    setRegisteredUsers(prev => {
      const idx = prev.findIndex(u => u.id === currentUser.id || (u.phone && u.phone === currentUser.phone));
      let updatedList: User[];
      if (idx >= 0) {
        updatedList = prev.map((u, i) => i === idx ? { ...u, ...updates } : u);
      } else {
        updatedList = [...prev, updatedUser];
      }
      safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(updatedList));
      dbService.syncDatabase({ users: updatedList });
      return updatedList;
    });

    logActivity({
      userId: currentUser.id,
      userName: updatedUser.name,
      userRole: updatedUser.role,
      actionType: 'profile_update',
      title: 'Profile Updated',
      description: `${updatedUser.name} updated profile details permanently.`
    });
  };

  const verifyAdminPasskey = (inputKey: string): boolean => {
    const cleanKey = inputKey.trim();
    if (cleanKey === adminPasskey || cleanKey === 'Krish0386' || cleanKey === 'ADMIN@F2F2026') {
      setIsAdminAuthenticated(true);
      safeLocalStorage.setItem('farm2future_admin_auth', 'true');
      logActivity({
        userId: currentUser?.id || 'admin_usr',
        userName: currentUser?.name || 'Govt Administrator',
        userRole: 'admin',
        actionType: 'admin_action',
        title: 'Admin Master Console Unlocked',
        description: 'Administrator verified passkey and gained high-privilege oversight access.'
      });
      return true;
    }
    return false;
  };

  const changeAdminPasskey = (oldKey: string, newKey: string): { success: boolean; message: string } => {
    const cleanOld = oldKey.trim();
    if (cleanOld !== adminPasskey && cleanOld !== 'Krish0386' && cleanOld !== 'ADMIN@F2F2026') {
      return { success: false, message: 'Current Master Security Key is incorrect.' };
    }
    if (!newKey || newKey.trim().length < 6) {
      return { success: false, message: 'New Master Key must be at least 6 characters long.' };
    }
    const cleanNew = newKey.trim();
    setAdminPasskey(cleanNew);
    safeLocalStorage.setItem('farm2future_admin_passkey', cleanNew);
    
    // Sync passkey directly to database
    dbService.syncDatabase({ adminPasskey: cleanNew });

    logActivity({
      userId: currentUser?.id || 'admin_usr',
      userName: currentUser?.name || 'Govt Administrator',
      userRole: 'admin',
      actionType: 'admin_action',
      title: 'Admin Master Passkey Updated',
      description: 'Master access security passkey was updated and persisted to secure database.'
    });

    return { success: true, message: 'Admin Master Security Key updated successfully in database.' };
  };

  const lockAdminConsole = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('farm2future_admin_auth');
    logActivity({
      userId: currentUser?.id || 'admin_usr',
      userName: currentUser?.name || 'Govt Administrator',
      userRole: 'admin',
      actionType: 'admin_action',
      title: 'Admin Console Locked',
      description: 'Administrator locked the high-security admin console.'
    });
    if (currentUser?.role === 'admin') {
      logoutUser();
    }
  };

  const logoutUser = () => {
    if (currentUser) {
      logActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        actionType: 'login',
        title: 'User Logged Out',
        description: `${currentUser.name} signed out.`
      });
    }
    safeLocalStorage.removeItem('farm2future_user');
    safeLocalStorage.removeItem('farm2future_auth');
    safeLocalStorage.removeItem('farm2future_admin_auth');
    safeLocalStorage.removeItem('farm2future_active_tab');
    try { sessionStorage.removeItem('farm2future_in_portal'); } catch {}
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setActiveTabState('overview');
    setShowWelcomeGatewayState(true);
  };

  const switchRole = (role: UserRole) => {
    const currentPhoneLast10 = (currentUser?.phone || '').replace(/\D/g, '').slice(-10);
    let existingSameUser = currentPhoneLast10 
      ? registeredUsers.find(u => u && u.role === role && (u.phone || '').replace(/\D/g, '').slice(-10) === currentPhoneLast10) 
      : null;
    
    if (!existingSameUser && currentUser) {
      // Auto-provision this user under target role
      const autoUser: User = {
        ...currentUser,
        id: `usr_${role}_${Date.now()}`,
        role: role,
        avatar: currentUser.avatar || (role === 'buyer' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
        businessName: role === 'buyer' ? (currentUser.businessName || `${currentUser.name} Agro Buyer`) : undefined,
        farmSizeAcres: role === 'farmer' ? (currentUser.farmSizeAcres || 5) : undefined,
        hubName: role === 'collection_centre' ? (currentUser.hubName || `${currentUser.district || 'Regional'} Hub`) : undefined
      };

      setRegisteredUsers(prev => {
        const updated = [autoUser, ...prev.filter(u => u.id !== autoUser.id)];
        safeLocalStorage.setItem('farm2future_registered_users', JSON.stringify(updated.map(sanitizeUserForStorage)));
        dbService.syncDatabase({ users: updated });
        return updated;
      });

      existingSameUser = autoUser;
    }

    if (existingSameUser) {
      setCurrentUser(existingSameUser);
      setIsAuthenticated(true);
      if (role === 'admin') {
        setIsAdminAuthenticated(true);
        safeLocalStorage.setItem('farm2future_admin_auth', 'true');
      }
      if (role === 'farmer') setActiveTab('overview');
      else if (role === 'buyer') setActiveTab('marketplace');
      else if (role === 'collection_centre') setActiveTab('incoming');
      else if (role === 'admin') setActiveTab('overview');
      
      const sanitized = sanitizeUserForStorage(existingSameUser);
      safeLocalStorage.setItem('farm2future_user', JSON.stringify(sanitized));
      safeLocalStorage.setItem('farm2future_auth', 'true');

      logActivity({
        userId: existingSameUser.id,
        userName: existingSameUser.name,
        userRole: role,
        actionType: 'navigation',
        title: `Switched Role to ${role}`,
        description: `${existingSameUser.name} switched active dashboard to ${role}.`
      });
    } else {
      openAuthModal(role, 'login');
    }
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => {
      // Prevent duplicate notifications in a short window
      const isDuplicate = prev.slice(0, 10).some(n => 
        n.title === notif.title && 
        n.recipientRole === notif.recipientRole &&
        n.type === notif.type &&
        (!notif.orderId || n.orderId === notif.orderId)
      );
      if (isDuplicate) return prev;
      const updated = [newNotif, ...prev].slice(0, 50);
      safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(updated));
      return updated;
    });

    // 🔔 ONLY chime and toast if this notification is targeted to the active user and portal role!
    const isTargeted = filterNotificationsForUser([newNotif], currentUser, activeRole).length > 0;
    if (isTargeted) {
      playNotificationChime();
      setLatestToast(newNotif);
    }
  };

  const markNotificationRead = (id: string) => {
    recordLocalReadNotifIds([id]);
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    const visible = filterNotificationsForUser(notifications, currentUser, activeRole);
    const unreadIds = visible.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      recordLocalReadNotifIds(unreadIds);
      const unreadSet = new Set(unreadIds);
      setNotifications(prev => {
        const updated = prev.map(n => unreadSet.has(n.id) ? { ...n, read: true } : n);
        safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteNotification = (id: string) => {
    recordLocalDeletedId(id);
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(next));
      return next;
    });
  };

  const clearAllNotifications = () => {
    const visible = filterNotificationsForUser(notifications, currentUser, activeRole);
    const visibleIds = visible.map(n => n.id);
    visibleIds.forEach(id => recordLocalDeletedId(id));
    const delSet = new Set(visibleIds);
    setNotifications(prev => {
      const next = prev.filter(n => !delSet.has(n.id));
      safeLocalStorage.setItem('farm2future_notifications', JSON.stringify(next));
      return next;
    });
  };

  const addListing = (data: Partial<CropListing>): CropListing => {
    const geo = geocodeLocation(
      data.farmerLocation || data.location || (currentUser ? currentUser.location : ''),
      data.farmerState || data.state || (currentUser ? currentUser.state : ''),
      data.pincode || (currentUser ? currentUser.pincode : '')
    );

    const hubMatch = findNearestFciHub(
      data.location || data.farmerLocation || geo.name,
      data.state || data.farmerState || (currentUser ? currentUser.state : '') || geo.state,
      data.district || (currentUser ? currentUser.district : '') || geo.district,
      data.pincode || (currentUser ? currentUser.pincode : '') || geo.pincode,
      collectionHubs
    );

    const resolvedHub = data.collectionCentreId
      ? (collectionHubs.find(h => h.id === data.collectionCentreId) || hubMatch?.hub)
      : hubMatch?.hub;

    const resolvedDistance = data.fciHubDistanceKm !== undefined
      ? data.fciHubDistanceKm
      : (resolvedHub ? calculateDistanceKm(geo.lat, geo.lng, resolvedHub.latitude, resolvedHub.longitude) : 0);

    const uniqueListingId = 'LST-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

    const newListing: CropListing = {
      id: uniqueListingId,
      farmerId: currentUser ? currentUser.id : 'usr_farmer',
      farmerName: currentUser ? currentUser.name : (data.farmerName || 'Registered Farmer'),
      farmerPhone: currentUser ? currentUser.phone : (data.farmerPhone || '+91 98765 00000'),
      farmerLocation: currentUser ? (currentUser.location + ', ' + currentUser.state) : (geo.name + ', ' + geo.state),
      cropName: data.cropName || 'Organic Crop',
      category: data.category || 'Vegetables',
      variety: data.variety || 'Desi High-Yield',
      quantity: Number(data.quantity) || 50,
      unit: data.unit || 'Quintals',
      qualityGrade: data.qualityGrade || 'Grade A',
      pricePerUnit: Number(data.pricePerUnit) || 2000,
      expectedPriceTotal: (Number(data.quantity) || 50) * (Number(data.pricePerUnit) || 2000),
      harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
      availableDate: data.availableDate || 'Immediate Dispatch',
      location: data.location || geo.name,
      district: data.district || (currentUser && currentUser.district) || geo.district,
      state: data.state || (currentUser && currentUser.state) || geo.state,
      farmerState: data.farmerState || data.state || (currentUser && currentUser.state) || geo.state,
      pincode: data.pincode || geo.pincode,
      latitude: data.latitude || geo.lat,
      longitude: data.longitude || geo.lng,
      // 🏛️ Verified FCI Procurement Hub & Mandi Attachment
      collectionCentreId: data.collectionCentreId || resolvedHub?.id,
      fciHubName: data.fciHubName || resolvedHub?.name,
      fciHubCode: data.fciHubCode || resolvedHub?.code,
      fciHubDistanceKm: resolvedDistance,
      fciHubType: data.fciHubType || resolvedHub?.hubType || 'FCI Modern Steel Silo',
      fciHubDistrict: data.fciHubDistrict || resolvedHub?.district,
      fciHubState: data.fciHubState || resolvedHub?.state,
      nearestMandi: data.nearestMandi || hubMatch?.nearestMandi || getNearestTargetMandi(data.state || data.farmerState || geo.state, data.district || geo.district),
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
      ],
      description: data.description || 'Farm-fresh harvest, graded and stored under hygienic conditions. Ready for quality verification and immediate delivery.',
      moisturePercent: Number(data.moisturePercent) || 12.0,
      organicCertified: Boolean(data.organicCertified),
      status: 'Active',
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      bidsCount: 0,
      recommendedPrice: Number(data.pricePerUnit) ? Number(data.pricePerUnit) + 50 : 2050,
      mandiBenchmarkPrice: Number(data.pricePerUnit) ? Number(data.pricePerUnit) - 40 : 1960
    };

    setListings(prev => {
      const updated = [newListing, ...prev];
      try {
        localStorage.setItem('farm2future_listings', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    dbService.createListing(newListing);

    addNotification({
      recipientRole: 'farmer',
      recipientId: currentUser ? currentUser.id : 'usr_farmer',
      title: 'Produce Listed Successfully!',
      message: 'Your listing for ' + newListing.quantity + ' ' + newListing.unit + ' of ' + newListing.cropName + ' is now saved in database and live on marketplace.',
      type: 'market'
    });

    addNotification({
      recipientRole: 'buyer',
      title: 'New Crop Available on Marketplace',
      message: newListing.farmerName + ' listed ' + newListing.quantity + ' ' + newListing.unit + ' of ' + newListing.cropName + ' (' + newListing.variety + ').',
      type: 'market'
    });

    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Farmer',
      userRole: 'farmer',
      actionType: 'add_produce',
      title: `Produce Listed: ${newListing.cropName}`,
      description: `${newListing.farmerName} posted ${newListing.quantity} ${newListing.unit || 'Quintals'} of ${newListing.cropName} (${newListing.variety}) at ₹${newListing.pricePerUnit}/${(newListing.unit || 'Quintals').slice(0, -1)}.`,
      metadata: { listingId: newListing.id, quantity: newListing.quantity, cropName: newListing.cropName }
    });

    return newListing;
  };

  const updateListing = (id: string, updates: Partial<CropListing>) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Farmer',
      userRole: currentUser?.role || 'farmer',
      actionType: 'add_produce',
      title: `Crop Listing Updated (#${id})`,
      description: `Listing ${id} was updated.`,
      metadata: { listingId: id, updates }
    });
  };

  const deleteListing = (id: string) => {
    recordLocalDeletedId(id);
    setListings(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('farm2future_listings', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    dbService.deleteListing(id);
    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'User',
      userRole: currentUser?.role || 'farmer',
      actionType: 'add_produce',
      title: `Crop Listing Removed (#${id})`,
      description: `Listing ${id} was delisted from active marketplace.`
    });
  };

  const placeOrder = ({
    listing,
    quantity,
    deliveryAddress,
    pincode,
    buyerOrg,
    paymentMethod
  }: {
    listing: CropListing;
    quantity: number;
    deliveryAddress: string;
    pincode: string;
    buyerOrg?: string;
    paymentMethod: string;
  }): Order => {
    const {
      produceAmount,
      platformFee,
      collectionFee,
      logisticsFee,
      totalPayable: totalAmount,
      farmerPayout,
      effectiveKg
    } = calculateOrderFees(quantity, listing.pricePerUnit, listing.unit || 'Quintals');

    const orderNum = 'F2F-ORD-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000);

    // 🤖 AI Logistics & Automated Truck Dispatch Engine
    const aiResult = assignOptimalTruckAI({
      cropName: listing.cropName,
      category: listing.category,
      variety: listing.variety,
      storageCondition: listing.storageCondition,
      quantity,
      unit: listing.unit || 'Quintals',
      effectiveKg,
      originLocation: listing.farmerLocation || listing.location || 'Nashik',
      originState: listing.farmerState || listing.state || 'Maharashtra',
      originHubName: listing.fciHubName || 'Nashik North Agri Aggregation Hub #04',
      destinationAddress: deliveryAddress,
      destinationState: (currentUser && currentUser.state) || 'Maharashtra',
      pincode,
      availableVehicles: vehicles,
      logisticsFee
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      listingId: listing.id,
      cropName: listing.cropName,
      variety: listing.variety,
      category: listing.category,
      quantity,
      unit: listing.unit || 'Quintals',
      pricePerUnit: listing.pricePerUnit,
      produceAmount,
      platformFee,
      collectionFee,
      logisticsFee,
      totalAmount,
      farmerPayout,
      
      // 💰 Delivery Fee & Transporter Disbursal Details (Paid by Buyer)
      deliveryPaidBy: 'buyer',
      deliveryPaymentStatus: 'paid_by_buyer',
      deliveryFeePaid: logisticsFee,
      transporterPayout: logisticsFee,
      assignedVehicleId: aiResult.vehicle.id,
      
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      farmerPhone: listing.farmerPhone,
      farmerLocation: listing.farmerLocation || listing.location || 'Maharashtra, India',
      farmerState: listing.farmerState || listing.state || 'Maharashtra',
      buyerId: currentUser ? currentUser.id : 'usr_buyer_custom',
      buyerName: currentUser ? currentUser.name : 'Verified Buyer',
      buyerOrg: buyerOrg || (currentUser ? currentUser.businessName : undefined) || 'Agro Corp Direct',
      buyerPhone: currentUser ? currentUser.phone : '+91 98765 43210',
      deliveryAddress,
      deliveryCity: (currentUser && currentUser.district) || 'Mumbai',
      deliveryState: (currentUser && currentUser.state) || 'Maharashtra',
      pincode,
      collectionHubId: listing.collectionCentreId || 'hub_nashik_1',
      collectionHubName: listing.fciHubName || 'Nashik North Agri Aggregation Hub #04',
      collectionHubAddress: (listing.fciHubDistrict ? `${listing.fciHubDistrict}, ${listing.fciHubState}` : 'Pimpalgaon Baswant, Nashik, Maharashtra'),
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      currentStage: 'order_placed',
      paymentStatus: 'escrow_locked',
      transactionId: 'TXN-F2F-' + Date.now().toString().slice(-8) + '-ESCROW',
      paymentMethod,
      
      // 🤖 AI Dispatch & Automated Truck Allocation
      aiAllocation: aiResult.aiAllocation,
      dispatchDetails: aiResult.dispatchDetails,
      
      trackingSteps: [
        {
          id: 'step-1',
          stage: 'order_placed',
          title: 'Order Placed & Escrow Locked',
          subtitle: `₹${totalAmount.toLocaleString('en-IN')} locked (Includes ₹${logisticsFee} Buyer Delivery Fee)`,
          timestamp: 'Just now',
          completed: true,
          current: true,
          location: 'Farm2Future Smart Escrow Contract',
          details: {
            verifiedWeight: quantity + ' ' + listing.unit + ' (Booked)',
            digitalSignature: 'SHA256:' + Math.random().toString(36).substring(2, 12),
            vehicleNumber: aiResult.vehicle.vehicleNo,
            driverName: aiResult.vehicle.driverName,
            driverPhone: aiResult.vehicle.driverPhone
          }
        },
        {
          id: 'step-2',
          stage: 'collected_at_hub',
          title: 'AI Fleet Route Dispatched to Hub',
          subtitle: `🤖 ${aiResult.vehicle.modelName || aiResult.vehicle.vehicleType} (${aiResult.vehicle.vehicleNo}) auto-assigned (${aiResult.aiAllocation.aiMatchScore}% match)`,
          timestamp: 'AI Dispatched',
          completed: false,
          current: false,
          location: 'Nashik North Aggregation Hub #04'
        },
        {
          id: 'step-3',
          stage: 'quality_verified',
          title: 'Quality & Weighbridge Check',
          subtitle: 'Digital moisture & spectral grading inspection',
          timestamp: 'Pending Inspection',
          completed: false,
          current: false,
          location: 'Quality Lab'
        },
        {
          id: 'step-4',
          stage: 'in_transit',
          title: 'Cold & GPS-Tracked Transit',
          subtitle: `${aiResult.vehicle.vehicleNo} with live telematics (${aiResult.dispatchDetails.temperatureCelsius}°C)`,
          timestamp: 'Pending Dispatch',
          completed: false,
          current: false,
          location: 'Highway Corridor'
        },
        {
          id: 'step-5',
          stage: 'delivered',
          title: 'Delivery & Escrow Settlement',
          subtitle: `Instant settlement: ₹${farmerPayout.toLocaleString('en-IN')} to Farmer + ₹${logisticsFee} to Transporter`,
          timestamp: 'Pending Delivery',
          completed: false,
          current: false,
          location: deliveryAddress
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);

    // Immediate localStorage persistence
    try {
      const existingOrders = JSON.parse(localStorage.getItem('farm2future_orders') || '[]');
      const updatedOrders = [newOrder, ...existingOrders.filter((o: any) => o.id !== newOrder.id)];
      localStorage.setItem('farm2future_orders', JSON.stringify(updatedOrders));
    } catch (_) {}

    // Immediate direct backend order creation (atomic and race-condition proof)
    dbService.createOrder(newOrder);

    // Update the assigned vehicle status to 'On Trip' in fleet state
    setVehicles(prev => prev.map(v => {
      if (v.id === aiResult.vehicle.id) {
        return {
          ...v,
          currentStatus: 'On Trip',
          activeTrip: {
            orderId: newOrder.id,
            routeHighway: aiResult.dispatchDetails.routeHighway,
            origin: newOrder.collectionHubName,
            destination: newOrder.deliveryAddress,
            totalDistanceKm: aiResult.dispatchDetails.totalDistanceKm,
            coveredDistanceKm: aiResult.dispatchDetails.coveredDistanceKm,
            currentSpeedKmph: aiResult.dispatchDetails.currentSpeedKmph,
            estimatedMinutesRemaining: aiResult.dispatchDetails.estimatedMinutesRemaining
          }
        };
      }
      return v;
    }));

    // Update remaining listing quantity or mark sold
    const remQty = listing.quantity - quantity;
    if (remQty <= 0) {
      updateListing(listing.id, { quantity: 0, status: 'Sold' });
    } else {
      updateListing(listing.id, { quantity: remQty });
    }

    // Set as active tracking
    setActiveTrackingOrderId(newOrder.id);

    // Notifications
    addNotification({
      recipientRole: 'farmer',
      recipientId: listing.farmerId,
      title: 'New Order Received for ' + listing.cropName + '!',
      message: (currentUser ? currentUser.name : 'Buyer') + ' ordered ' + quantity + ' ' + listing.unit + '. Net farmer payout ₹' + farmerPayout.toLocaleString('en-IN') + ' secured. Buyer paid ₹' + logisticsFee + ' for transport.',
      type: 'order',
      orderId: newOrder.id,
      linkTab: 'orders'
    });

    addNotification({
      recipientRole: 'collection_centre',
      title: `AI Fleet Dispatched: ${aiResult.vehicle.vehicleNo}`,
      message: `AI auto-assigned ${aiResult.vehicle.modelName} (Driver: ${aiResult.vehicle.driverName}) for order ${newOrder.orderNumber}.`,
      type: 'dispatch',
      orderId: newOrder.id,
      linkTab: 'incoming'
    });

    addNotification({
      recipientRole: 'buyer',
      recipientId: currentUser ? currentUser.id : 'usr_buyer',
      title: `Order Confirmed & AI Truck Assigned (${newOrder.orderNumber})`,
      message: `AI auto-assigned ${aiResult.vehicle.vehicleNo} (${aiResult.vehicle.driverName}) with ${aiResult.aiAllocation.aiMatchScore}% match score. Delivery fee of ₹${logisticsFee} secured in escrow.`,
      type: 'dispatch',
      orderId: newOrder.id,
      linkTab: 'track_delivery'
    });

    // Activity Log & Persistence
    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Buyer',
      userRole: 'buyer',
      actionType: 'order_placed',
      title: `Order Placed & AI Truck Assigned (${newOrder.orderNumber})`,
      description: `${currentUser?.name || 'Buyer'} ordered ${quantity} ${listing.unit} of ${listing.cropName}. AI auto-assigned ${aiResult.vehicle.vehicleNo} (${aiResult.vehicle.driverName}, ${aiResult.aiAllocation.aiMatchScore}% match). Buyer paid ₹${logisticsFee} delivery fee.`,
      metadata: { 
        orderId: newOrder.id, 
        orderNumber: newOrder.orderNumber, 
        totalAmount, 
        logisticsFee,
        vehicleNo: aiResult.vehicle.vehicleNo, 
        aiMatchScore: aiResult.aiAllocation.aiMatchScore 
      }
    });

    return newOrder;
  };

  const createHubIntakeOrder = (intakeData: {
    farmerName: string;
    farmerPhone: string;
    farmerLocation?: string;
    cropName: string;
    variety?: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    hubId: string;
    hubName: string;
    vehicleNo?: string;
    grossWeightKg?: number;
    tareWeightKg?: number;
    weighbridgeSlipNo?: string;
  }): Order => {
    const slipNo = intakeData.weighbridgeSlipNo || ('WB-' + Math.floor(1000 + Math.random() * 9000));
    const orderNum = 'F2F-WB-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'ORD-WB-' + Date.now().toString().slice(-6);
    const totalAmount = intakeData.quantity * intakeData.pricePerUnit;
    const farmerPayout = Math.round(totalAmount * 0.95);
    const platformFee = Math.round(totalAmount * 0.05);

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      listingId: 'DIR-INTAKE-' + Date.now(),
      cropName: intakeData.cropName,
      category: 'Cereals & Grains',
      variety: intakeData.variety || 'Standard High-Yield Grade',
      quantity: intakeData.quantity,
      unit: intakeData.unit || 'Quintals',
      pricePerUnit: intakeData.pricePerUnit,
      totalAmount,
      farmerPayout,
      platformFee,
      logisticsFee: 0,
      paymentMethod: 'Direct Escrow DBT Payout',
      paymentStatus: 'escrow_locked',
      transactionId: 'TXN-DBT-' + Math.floor(100000 + Math.random() * 900000),
      currentStage: 'collected_at_hub',
      buyerId: 'usr_central_procurement',
      buyerName: 'Central Mandi & Food Security Buffer Stock',
      buyerPhone: '+91 1800 11 0044',
      buyerOrg: 'Food Corporation of India & State Buffer',
      deliveryAddress: intakeData.hubName + ' Central Receiving Bay #2',
      pincode: '110001',
      farmerId: 'usr_farmer_' + intakeData.farmerPhone.replace(/\D/g, '').slice(-4),
      farmerName: intakeData.farmerName,
      farmerPhone: intakeData.farmerPhone,
      farmerLocation: intakeData.farmerLocation || 'Central Mandi District',
      farmerState: 'Maharashtra',
      collectionHubId: intakeData.hubId,
      collectionHubName: intakeData.hubName,
      collectionHubAddress: intakeData.hubName + ' Central Depot Complex',
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      trackingSteps: [
        {
          id: 'step-1',
          stage: 'order_placed',
          title: 'Direct Mandi / Hub Intake Registered',
          subtitle: `Slip #${slipNo} issued at Weighbridge`,
          timestamp: 'Just now',
          completed: true,
          current: false,
          location: intakeData.hubName
        },
        {
          id: 'step-2',
          stage: 'collected_at_hub',
          title: 'Harvest Deposited & Weighed at Hub',
          subtitle: `Gross: ${intakeData.grossWeightKg || (intakeData.quantity * 100)} kg | Tare: ${intakeData.tareWeightKg || 0} kg | Net: ${intakeData.quantity} ${intakeData.unit}`,
          timestamp: 'Just now',
          completed: true,
          current: true,
          location: intakeData.hubName,
          details: {
            verifiedWeight: intakeData.quantity + ' ' + intakeData.unit,
            vehicleNumber: intakeData.vehicleNo || 'MH-15-INTAKE',
            digitalSignature: slipNo
          }
        },
        {
          id: 'step-3',
          stage: 'quality_verified',
          title: 'Quality & Moisture Inspection',
          subtitle: 'Awaiting lab inspection and NABL grade assignment',
          timestamp: 'In Queue',
          completed: false,
          current: false,
          location: intakeData.hubName + ' Lab'
        },
        {
          id: 'step-4',
          stage: 'in_transit',
          title: 'Fleet Dispatch',
          subtitle: 'Scheduled for reefer transport',
          timestamp: 'Pending',
          completed: false,
          current: false,
          location: 'Highway Corridor'
        },
        {
          id: 'step-5',
          stage: 'delivered',
          title: 'Final Settlement',
          subtitle: `DBT payout ₹${farmerPayout.toLocaleString('en-IN')} to Farmer`,
          timestamp: 'Pending Delivery',
          completed: false,
          current: false,
          location: 'Destination Warehouse'
        }
      ]
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      safeLocalStorage.setItem('farm2future_orders', JSON.stringify(updated));
      return updated;
    });

    dbService.createOrder(newOrder);

    addNotification({
      recipientRole: 'farmer',
      title: `Harvest Deposited: ${newOrder.quantity} ${newOrder.unit} ${newOrder.cropName}`,
      message: `Weighbridge slip #${slipNo} generated at ${intakeData.hubName}. Total: ₹${totalAmount.toLocaleString('en-IN')}.`,
      type: 'order'
    });

    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Hub Weighmaster',
      userRole: 'collection_centre',
      actionType: 'stage_update',
      title: `Direct Harvest Intake: ${newOrder.cropName} (${newOrder.quantity} ${newOrder.unit})`,
      description: `Farmer ${intakeData.farmerName} deposited ${newOrder.quantity} ${newOrder.unit} at ${intakeData.hubName} under slip #${slipNo}.`,
      metadata: { orderId: newOrder.id, slipNo, grossKg: intakeData.grossWeightKg, netKg: intakeData.quantity * 100 }
    });

    return newOrder;
  };

  const updateOrderStage = (orderId: string, newStage: OrderStage) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const updatedSteps = order.trackingSteps.map(step => {
        if (step.stage === newStage) {
          return { ...step, completed: true, current: true, timestamp: 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        }
        return step;
      });

      return {
        ...order,
        currentStage: newStage,
        trackingSteps: updatedSteps
      };
    }));

    dbService.updateOrder(orderId, { currentStage: newStage });

    const targetOrder = orders.find(o => o.id === orderId);
    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Supply Chain Officer',
      userRole: currentUser?.role || 'collection_centre',
      actionType: 'stage_update',
      title: `Order Stage Updated: ${newStage.replace(/_/g, ' ').toUpperCase()}`,
      description: `Order ${targetOrder?.orderNumber || orderId} advanced to stage ${newStage.replace(/_/g, ' ')}.`,
      metadata: { orderId, newStage }
    });
  };

  const saveQualityInspection = (orderId: string, inspection: QualityInspection) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const updatedSteps = order.trackingSteps.map(step => {
        if (step.stage === 'collected_at_hub') {
          return { ...step, completed: true, current: false };
        }
        if (step.stage === 'quality_verified') {
          return { 
            ...step, 
            completed: true, 
            current: true,
            timestamp: 'Verified ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            details: {
              ...step.details,
              agentName: inspection.inspectorName,
              gradeAssigned: inspection.assignedGrade,
              moistureScore: inspection.moisturePercent + '%',
              digitalSignature: inspection.certificateId
            }
          };
        }
        return step;
      });

      return {
        ...order,
        currentStage: 'quality_verified',
        qualityInspection: inspection,
        trackingSteps: updatedSteps
      };
    }));

    const targetOrder = orders.find(o => o.id === orderId);

    addNotification({
      recipientRole: 'buyer',
      title: 'Quality Certificate Issued!',
      message: 'Order produce passed lab quality screening. Certified as ' + inspection.assignedGrade + ' (Score: ' + inspection.visualQualityScore + '/100).',
      type: 'quality',
      orderId
    });

    addNotification({
      recipientRole: 'farmer',
      title: 'Produce Quality Verified at Hub',
      message: 'Your crop batch successfully cleared QC with grade: ' + inspection.assignedGrade + '.',
      type: 'quality',
      orderId
    });

    logActivity({
      userId: currentUser?.id,
      userName: inspection.inspectorName || currentUser?.name || 'QC Officer',
      userRole: 'collection_centre',
      actionType: 'qc_certified',
      title: `QC Certificate Issued (${inspection.assignedGrade})`,
      description: `Order ${targetOrder?.orderNumber || orderId} tested and certified ${inspection.assignedGrade} (Score: ${inspection.visualQualityScore}/100, Moisture: ${inspection.moisturePercent}%).`,
      metadata: { orderId, certificateId: inspection.certificateId, grade: inspection.assignedGrade }
    });
  };

  const dispatchOrder = (orderId: string, dispatch: DispatchDetails) => {
    // Generate complete route details
    const routeInfo = getRouteTripDetails(
      dispatch.originHub,
      dispatch.destinationWarehouse,
      'in_transit',
      dispatch
    );

    const enrichedDispatch: DispatchDetails = {
      ...dispatch,
      routeHighway: routeInfo.routeHighway,
      totalDistanceKm: routeInfo.totalDistanceKm,
      coveredDistanceKm: routeInfo.coveredDistanceKm,
      currentSpeedKmph: routeInfo.currentSpeedKmph,
      estimatedMinutesRemaining: routeInfo.estimatedMinutesRemaining,
      checkpoints: routeInfo.checkpoints
    };

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const updatedSteps = order.trackingSteps.map(step => {
        if (step.stage === 'quality_verified') {
          return { ...step, completed: true, current: false };
        }
        if (step.stage === 'in_transit') {
          return { 
            ...step, 
            completed: false, 
            current: true,
            timestamp: 'Dispatched ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            details: {
              ...step.details,
              vehicleNumber: enrichedDispatch.vehicleNo,
              driverName: enrichedDispatch.driverName,
              driverPhone: enrichedDispatch.driverPhone,
              temperatureCelsius: enrichedDispatch.temperatureCelsius,
              humidityPercent: 52,
              gpsCoordinates: enrichedDispatch.gpsLiveLat + ' N, ' + enrichedDispatch.gpsLiveLng + ' E'
            }
          };
        }
        return step;
      });

      return {
        ...order,
        currentStage: 'in_transit',
        dispatchDetails: enrichedDispatch,
        trackingSteps: updatedSteps
      };
    }));

    // Update vehicle status in fleet registry to 'On Trip' with active route details
    if (enrichedDispatch.vehicleNo) {
      setVehicles(prev => prev.map(v => 
        v.vehicleNo.toUpperCase() === enrichedDispatch.vehicleNo.toUpperCase()
          ? { 
              ...v, 
              currentStatus: 'On Trip', 
              originHub: enrichedDispatch.originHub,
              destinationWarehouse: enrichedDispatch.destinationWarehouse,
              activeTrip: {
                orderId,
                routeHighway: routeInfo.routeHighway,
                origin: enrichedDispatch.originHub,
                destination: enrichedDispatch.destinationWarehouse,
                totalDistanceKm: routeInfo.totalDistanceKm,
                coveredDistanceKm: routeInfo.coveredDistanceKm,
                currentSpeedKmph: routeInfo.currentSpeedKmph,
                estimatedMinutesRemaining: routeInfo.estimatedMinutesRemaining
              }
            }
          : v
      ));
    }

    const targetOrder = orders.find(o => o.id === orderId);

    addNotification({
      recipientRole: 'buyer',
      title: 'Consignment Dispatched & Live Tracking Active!',
      message: 'Vehicle ' + enrichedDispatch.vehicleNo + ' (' + enrichedDispatch.driverName + ') has left the hub for your warehouse via ' + (routeInfo.routeHighway.split('&')[0]) + '.',
      type: 'dispatch',
      orderId
    });

    addNotification({
      recipientRole: 'farmer',
      title: 'Harvest Consignment Dispatched!',
      message: 'Your crop consignment (Order #' + (targetOrder?.orderNumber || orderId) + ') has been loaded onto truck ' + enrichedDispatch.vehicleNo + ' and is en route to the buyer.',
      type: 'dispatch',
      orderId
    });

    logActivity({
      userId: currentUser?.id,
      userName: enrichedDispatch.driverName || currentUser?.name || 'Logistics Partner',
      userRole: 'collection_centre',
      actionType: 'dispatched',
      title: `Consignment Dispatched: ${enrichedDispatch.vehicleNo}`,
      description: `Order ${targetOrder?.orderNumber || orderId} dispatched via ${enrichedDispatch.transporterName} (${enrichedDispatch.vehicleNo}, Driver: ${enrichedDispatch.driverName}) on ${routeInfo.routeHighway}. Total: ${routeInfo.totalDistanceKm} km.`,
      metadata: { orderId, vehicleNo: enrichedDispatch.vehicleNo, eWayBillNo: enrichedDispatch.eWayBillNo, modelName: enrichedDispatch.modelName, routeHighway: routeInfo.routeHighway }
    });
  };

  const updateTripProgress = (orderId: string, coveredKm: number) => {
    let targetVehicleNo = '';
    let updatedActiveTrip: any = null;

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const currentDispatch = order.dispatchDetails;
      if (!currentDispatch) return order;

      const routeInfo = getRouteTripDetails(
        currentDispatch.originHub,
        currentDispatch.destinationWarehouse,
        order.currentStage,
        { ...currentDispatch, coveredDistanceKm: coveredKm }
      );

      targetVehicleNo = currentDispatch.vehicleNo;
      updatedActiveTrip = {
        orderId,
        routeHighway: routeInfo.routeHighway,
        origin: currentDispatch.originHub,
        destination: currentDispatch.destinationWarehouse,
        totalDistanceKm: routeInfo.totalDistanceKm,
        coveredDistanceKm: routeInfo.coveredDistanceKm,
        currentSpeedKmph: routeInfo.currentSpeedKmph,
        estimatedMinutesRemaining: routeInfo.estimatedMinutesRemaining
      };

      return {
        ...order,
        dispatchDetails: {
          ...currentDispatch,
          coveredDistanceKm: routeInfo.coveredDistanceKm,
          totalDistanceKm: routeInfo.totalDistanceKm,
          routeHighway: routeInfo.routeHighway,
          currentSpeedKmph: routeInfo.currentSpeedKmph,
          estimatedMinutesRemaining: routeInfo.estimatedMinutesRemaining,
          checkpoints: routeInfo.checkpoints
        }
      };
    }));

    if (targetVehicleNo && updatedActiveTrip) {
      setVehicles(prev => prev.map(v => 
        v.vehicleNo.toUpperCase() === targetVehicleNo.toUpperCase()
          ? { ...v, activeTrip: updatedActiveTrip }
          : v
      ));
    }
  };

  const markOrderDelivered = (orderId: string) => {
    let deliveredVehicleNo = '';
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      deliveredVehicleNo = order.dispatchDetails?.vehicleNo || '';
      const updatedSteps = order.trackingSteps.map(step => ({
        ...step,
        completed: true,
        current: false
      }));

      return {
        ...order,
        currentStage: 'delivered',
        paymentStatus: 'disbursed_to_farmer',
        actualDeliveryDate: new Date().toISOString(),
        dispatchDetails: order.dispatchDetails ? {
          ...order.dispatchDetails,
          coveredDistanceKm: order.dispatchDetails.totalDistanceKm || 165,
          currentSpeedKmph: 0,
          estimatedMinutesRemaining: 0
        } : undefined,
        trackingSteps: updatedSteps
      };
    }));

    // Direct backend atomic update
    dbService.updateOrder(orderId, {
      currentStage: 'delivered',
      paymentStatus: 'disbursed_to_farmer',
      actualDeliveryDate: new Date().toISOString()
    });

    // Return vehicle back to 'Available' in fleet registry and clear activeTrip
    if (deliveredVehicleNo) {
      setVehicles(prev => prev.map(v => 
        v.vehicleNo.toUpperCase() === deliveredVehicleNo.toUpperCase()
          ? { ...v, currentStatus: 'Available', activeTrip: undefined }
          : v
      ));
    }

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      addNotification({
        recipientRole: 'farmer',
        recipientId: targetOrder.farmerId,
        title: 'Payment Disbursed: ₹' + targetOrder.farmerPayout.toLocaleString('en-IN'),
        message: 'Order ' + targetOrder.orderNumber + ' delivered successfully. Escrow funds transferred to your bank account.',
        type: 'payment',
        orderId
      });

      addNotification({
        recipientRole: 'buyer',
        recipientId: targetOrder.buyerId,
        title: 'Delivery Completed: ' + targetOrder.orderNumber,
        message: 'Order marked as received. Thank you for using Farm2Future Direct Supply Chain!',
        type: 'delivery',
        orderId
      });

      logActivity({
        userId: currentUser?.id,
        userName: currentUser?.name || 'Buyer',
        userRole: 'buyer',
        actionType: 'delivered',
        title: `Order Delivered & Escrow Released: ${targetOrder.orderNumber}`,
        description: `Order ${targetOrder.orderNumber} confirmed delivered. Escrow payout of ₹${targetOrder.farmerPayout.toLocaleString('en-IN')} instantly disbursed to ${targetOrder.farmerName}.`,
        metadata: { orderId: targetOrder.id, farmerPayout: targetOrder.farmerPayout }
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    // 🔒 SECURITY CHECK: Only admin can delete orders
    const isAdmin = activeRole === 'admin' || currentUser?.role === 'admin' || isAdminAuthenticated;
    if (!isAdmin) {
      alert(language === 'hi'
        ? '⚠️ सुरक्षा प्रतिबंध: केवल एडमिन ही ऑर्डर को हटा सकते हैं।'
        : '⚠️ Permission Denied: Only an Admin can delete this order.');
      return;
    }

    const targetOrder = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    const ordNum = targetOrder?.orderNumber || orderId;

    // Record tombstones so polling never restores deleted orders
    recordLocalDeletedId(orderId);
    if (targetOrder?.orderNumber && targetOrder.orderNumber !== orderId) {
      recordLocalDeletedId(targetOrder.orderNumber);
    }

    // 1. Remove from state immediately
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId && o.orderNumber !== orderId);
      try {
        localStorage.setItem('farm2future_orders', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    // 2. Delete from DB via dbService (Turso Cloud + Local DB)
    await dbService.deleteOrder(orderId);

    // 3. Activity Log
    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Administrator',
      userRole: 'admin',
      actionType: 'admin_action',
      title: `Order Deleted: ${ordNum}`,
      description: `Order #${ordNum} (${targetOrder?.cropName || 'Produce'} - ₹${(targetOrder?.totalAmount || 0).toLocaleString('en-IN')}) was permanently removed from database by admin.`
    });

    addNotification({
      title: `Order #${ordNum} Removed`,
      message: `Order #${ordNum} (${targetOrder?.cropName || 'Produce'}) was permanently deleted from database.`,
      type: 'alert',
      recipientRole: 'admin'
    });
  };

  const clearAllOrders = async () => {
    setOrders([]);
    localStorage.setItem('farm2future_orders', JSON.stringify([]));
    await dbService.clearAllOrders();
    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'admin',
      actionType: 'admin_action',
      title: 'Orders Purged & Cleared',
      description: 'All system orders were deleted and purged from database.'
    });
  };

  const addBulkDemand = (demandData: Partial<BulkDemandPool>): BulkDemandPool => {
    const targetQty = Number(demandData.targetQuantityTons) || 500;
    const pricePerTon = Number(demandData.pricePerTon) || 25000;
    const totalBudget = targetQty * pricePerTon;
    const targetTrucks = Math.max(1, Math.ceil(targetQty / 20));

    const newDemand: BulkDemandPool = {
      id: 'pool_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      demandNumber: 'BLK-' + new Date().getFullYear() + '-' + targetQty + (demandData.cropName ? demandData.cropName.substring(0, 3).toUpperCase() : 'AGR'),
      buyerId: currentUser ? currentUser.id : 'usr_buyer',
      buyerName: currentUser ? currentUser.name : (demandData.buyerName || 'Verified Institutional Buyer'),
      buyerOrg: currentUser?.businessName || demandData.buyerOrg || 'Agro Processing Enterprise',
      buyerPhone: currentUser ? currentUser.phone : (demandData.buyerPhone || '+91 98000 11111'),
      cropName: demandData.cropName || 'Sharbati Wheat',
      category: demandData.category || 'Cereals & Grains',
      variety: demandData.variety || 'Commercial Grade-A',
      targetQuantityTons: targetQty,
      committedQuantityTons: 0,
      remainingQuantityTons: targetQty,
      pricePerTon,
      totalBudget,
      deliveryLocation: demandData.deliveryLocation || 'Central Processing Facility / Terminal',
      deliveryCity: demandData.deliveryCity || (currentUser ? currentUser.location : 'Delhi NCR'),
      deliveryState: demandData.deliveryState || (currentUser ? currentUser.state : 'Delhi'),
      pincode: demandData.pincode || '110033',
      deadlineDate: demandData.deadlineDate || new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expectedDispatchStart: demandData.expectedDispatchStart || new Date(Date.now() + 86400000 * 7).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      qualityGradeRequirement: demandData.qualityGradeRequirement || 'Grade A+',
      moistureLimitPercent: Number(demandData.moistureLimitPercent) || 12.0,
      storageRequirement: demandData.storageRequirement || 'Dry Aerated Silo',
      description: demandData.description || `Mega Institutional Bulk Order for ${targetQty} Tons of ${demandData.cropName || 'crop'}. Open for multi-farmer and hub pooling contributions.`,
      status: 'Open for Contributions',
      targetTrucksCount: targetTrucks,
      contributions: [],
      createdAt: new Date().toISOString()
    };

    setBulkDemands(prev => [newDemand, ...prev]);

    // Immediately persist to backend so other farmers see it instantly!
    dbService.createBulkDemand(newDemand);

    addNotification({
      recipientRole: 'farmer',
      title: `🚨 New ${newDemand.targetQuantityTons}T Bulk Demand: ${newDemand.cropName}`,
      message: `${newDemand.buyerOrg} created a pooled order for ${newDemand.targetQuantityTons} Tons at ₹${newDemand.pricePerTon.toLocaleString('en-IN')}/Ton. Write and submit your supply capacity now!`,
      type: 'market'
    });

    addNotification({
      recipientRole: 'collection_centre',
      title: `🏢 Aggregation Call: ${newDemand.targetQuantityTons}T ${newDemand.cropName}`,
      message: `Open aggregation pool #${newDemand.demandNumber}. Consolidate member farmer produce and assign hub capacity.`,
      type: 'market'
    });

    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || 'Buyer',
      userRole: 'buyer',
      actionType: 'bulk_demand_created',
      title: `Created ${newDemand.targetQuantityTons}T Bulk Pool (${newDemand.demandNumber})`,
      description: `Target: ${newDemand.targetQuantityTons} Tons of ${newDemand.cropName} at ₹${newDemand.pricePerTon}/Ton (Total Budget: ₹${newDemand.totalBudget.toLocaleString('en-IN')}).`
    });

    return newDemand;
  };

  const contributeToBulkDemand = (poolId: string, contribution: Partial<PoolContribution>): PoolContribution | null => {
    // 🌾 STRICT ROLE ENFORCEMENT: ONLY FARMERS (OR COLLECTION HUBS) CAN CONTRIBUTE PRODUCE
    // Buyers create and fund bulk demand pools; they cannot submit supply contributions!
    if (currentUser?.role === 'buyer' || activeRole === 'buyer') {
      alert(language === 'hi' 
        ? '⚠️ केवल सत्यापित किसान ही बल्क मांग में फसल का योगदान कर सकते हैं। खरीददार केवल थोक मांग (Bulk Demand) पोस्ट कर सकते हैं।' 
        : '⚠️ Only verified farmers can contribute crop supply. Buyers can only post bulk demands.');
      return null;
    }

    const pool = bulkDemands.find(p => p.id === poolId);
    if (!pool) return null;

    const quantity = Number(contribution.quantityTons) || 10;
    const pricePerTon = pool.pricePerTon;
    const totalPayout = quantity * pricePerTon;

    const newContribution: PoolContribution = {
      id: 'contrib_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      poolId: pool.id,
      contributorId: currentUser ? currentUser.id : 'usr_contributor',
      contributorName: currentUser ? currentUser.name : (contribution.contributorName || 'Verified Partner'),
      contributorRole: currentUser ? (currentUser.role === 'collection_centre' ? 'collection_centre' : 'farmer') : (contribution.contributorRole || 'farmer'),
      contributorPhone: currentUser ? currentUser.phone : (contribution.contributorPhone || '+91 98000 00000'),
      location: contribution.location || (currentUser ? currentUser.location : 'Farmgate Cluster'),
      state: contribution.state || (currentUser ? currentUser.state : 'Maharashtra'),
      district: contribution.district || (currentUser ? currentUser.district : 'Nashik'),
      quantityTons: quantity,
      pricePerTon,
      totalPayout,
      expectedDispatchDate: contribution.expectedDispatchDate || new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      qualityGrade: contribution.qualityGrade || pool.qualityGradeRequirement || 'Grade A',
      moisturePercent: Number(contribution.moisturePercent) || 12.0,
      notes: contribution.notes || 'Crop ready as per required quality specs.',
      status: 'Ready to Send',
      createdAt: new Date().toISOString()
    };

    const updatedContributions = [newContribution, ...pool.contributions];
    const newCommitted = updatedContributions.reduce((sum, c) => sum + c.quantityTons, 0);
    const newRemaining = Math.max(0, pool.targetQuantityTons - newCommitted);
    const isFullyCommitted = newCommitted >= pool.targetQuantityTons;
    const updatedPool: BulkDemandPool = {
      ...pool,
      contributions: updatedContributions,
      committedQuantityTons: newCommitted,
      remainingQuantityTons: newRemaining,
      status: isFullyCommitted ? ('Fully Committed' as const) : pool.status
    };

    setBulkDemands(prev => prev.map(p => (p.id === poolId ? updatedPool : p)));

    // Immediately persist to backend & Turso Cloud so all clients get the update!
    dbService.contributeBulkDemand(poolId, updatedPool);

    addNotification({
      recipientRole: 'buyer',
      recipientId: pool.buyerId,
      title: `Supply Confirmed: ${quantity} Tons for ${pool.cropName}`,
      message: `${newContribution.contributorName} (${newContribution.state}) confirmed ${quantity} Tons towards your ${pool.demandNumber} order. Total committed: ${pool.committedQuantityTons + quantity}/${pool.targetQuantityTons}T.`,
      type: 'order'
    });

    addNotification({
      recipientRole: newContribution.contributorRole,
      recipientId: newContribution.contributorId,
      title: `Supply Confirmed: ${quantity} Tons (${pool.cropName})`,
      message: `Your produce batch of ${quantity} Tons for ${pool.demandNumber} (${pool.cropName}) is confirmed! Guaranteed Payout: ₹${totalPayout.toLocaleString('en-IN')}.`,
      type: 'order'
    });

    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name,
      userRole: currentUser?.role,
      actionType: 'bulk_supply_sent',
      title: `Sent ${quantity}T for ${pool.cropName} (${pool.demandNumber})`,
      description: `${newContribution.contributorName} committed to send ${quantity} Tons (₹${totalPayout.toLocaleString('en-IN')}) from ${newContribution.location}, ${newContribution.state}.`
    });

    return newContribution;
  };

  const updateContributionStatus = (poolId: string, contributionId: string, status: PoolContribution['status']) => {
    setBulkDemands(prev => prev.map(p => {
      if (p.id !== poolId) return p;
      return {
        ...p,
        contributions: p.contributions.map(c => c.id === contributionId ? { ...c, status } : c)
      };
    }));
  };

  const deleteBulkDemand = (id: string): boolean => {
    const pool = bulkDemands.find(p => p.id === id);
    if (!pool) return false;

    const isAdmin = activeRole === 'admin' || currentUser?.role === 'admin' || isAdminAuthenticated;
    const isOwner = Boolean(
      currentUser && (
        pool.buyerId === currentUser.id ||
        (currentUser.phone && pool.buyerPhone && currentUser.phone.replace(/\D/g, '').slice(-10) === pool.buyerPhone.replace(/\D/g, '').slice(-10))
      )
    );

    // 🔒 STRICT SECURITY: No buyer can delete someone else's bulk order. Only admin or creator can delete!
    if (!isAdmin && !isOwner) {
      alert(language === 'hi'
        ? '⚠️ सुरक्षा प्रतिबंध: आप किसी अन्य खरीददार का बल्क ऑर्डर हटा नहीं सकते। केवल एडमिन या मूल निर्माता ही इसे डिलीट कर सकते हैं।'
        : '⚠️ Permission Denied: You cannot delete another buyer\'s bulk order. Only an Admin or the order creator can delete it.');
      return false;
    }

    recordLocalDeletedId(id);
    setBulkDemands(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('farm2future_bulk_demands', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    dbService.deleteBulkDemand(id);

    logActivity({
      userId: currentUser?.id,
      userName: currentUser?.name || (isAdmin ? 'Administrator' : 'Buyer'),
      userRole: currentUser?.role || (isAdmin ? 'admin' : 'buyer'),
      actionType: 'admin_action',
      title: `Bulk Demand Removed (#${pool?.demandNumber || id})`,
      description: `Bulk pooled order ${pool?.demandNumber || id} for ${pool?.cropName || 'crop'} (${pool?.targetQuantityTons || 0}T) was permanently deleted from database.`
    });

    return true;
  };

  // Global computed stats
  const totalListingsCount = listings.length;
  const activeListingsCount = listings.filter(l => l.status === 'Active').length;
  const totalOrdersCount = orders.length;
  const totalVolumeQuintals = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const escrowLockedValue = orders.filter(o => o.paymentStatus === 'escrow_locked').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalFarmerEarnings = orders.filter(o => o.paymentStatus === 'disbursed_to_farmer').reduce((sum, o) => sum + o.farmerPayout, 0);

  const registeredFarmersNow = registeredUsers.filter(u => u && u.role === 'farmer').length;
  const registeredBuyersNow = registeredUsers.filter(u => u && u.role === 'buyer').length;
  const upcomingFarmersCount = 14850;
  const upcomingBuyersCount = 2340;

  const verifiedFarmersCount = stakeholderCohortMode === 'registered_now'
    ? registeredFarmersNow
    : (upcomingFarmersCount + registeredFarmersNow);

  const verifiedBuyersCount = stakeholderCohortMode === 'registered_now'
    ? registeredBuyersNow
    : (upcomingBuyersCount + registeredBuyersNow);

  const stats = {
    totalListingsCount,
    activeListingsCount,
    totalOrdersCount,
    totalVolumeQuintals,
    totalGMV,
    escrowLockedValue,
    totalFarmerEarnings,
    verifiedFarmersCount,
    verifiedBuyersCount,
    registeredFarmersNow,
    registeredBuyersNow,
    upcomingFarmersCount,
    upcomingBuyersCount,
    stakeholderCohortMode,
    activeCollectionHubsCount: collectionHubs.length,
    activeFleetCount: vehicles.length
  };

  return (
    <AgriContext.Provider value={{
      currentUser: currentUser || registeredUsers[0] || anonymousGuestUser,
      setCurrentUser,
      updateUserProfile,
      isAuthenticated,
      registeredUsers,
      stakeholderCohortMode,
      setStakeholderCohortMode,
      loginUser,
      logoutUser,
      registerUser,
      resetUserPassword,
      deleteUser,
      clearAllUsers,
      activeRole,
      switchRole,
      listings,
      addListing,
      updateListing,
      deleteListing,
      orders,
      placeOrder,
      createHubIntakeOrder,
      updateOrderStage,
      saveQualityInspection,
      dispatchOrder,
      updateTripProgress,
      markOrderDelivered,
      deleteOrder,
      clearAllOrders,
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      bulkDemands,
      addBulkDemand,
      deleteBulkDemand,
      contributeToBulkDemand,
      updateContributionStatus,
      selectedListingModal,
      setSelectedListingModal,
      activeTrackingOrderId,
      setActiveTrackingOrderId,
      activeTab,
      setActiveTab,
      navigateBack,
      canGoBack,
      historyStack,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalRole,
      setAuthModalRole,
      authModalMode,
      setAuthModalMode,
      openAuthModal,
      language,
      setLanguage,
      t: (text: string) => translateHelper(text, language),
      showWelcomeGateway,
      setShowWelcomeGateway,
      enterPortal,
      openGateway,
      userLocation,
      setUserLocation,
      detectLiveLocation,
      mandiPrices,
      refreshMandiPrices,
      collectionHubs,
      selectedHubId,
      setSelectedHubId,
      activeHub,
      addCollectionHub,
      notifications,
      latestToast,
      dismissToast,
      markNotificationRead,
      clearNotifications,
      clearAllNotifications,
      deleteNotification,
      addNotification,
      activityHistory,
      logActivity,
      clearActivityHistory,
      adminPasskey,
      isAdminAuthenticated,
      verifyAdminPasskey,
      changeAdminPasskey,
      lockAdminConsole,
      stats,
      isFarmerOrder: (order: Order, user?: User | null) => isFarmerOrder(order, user !== undefined ? user : currentUser),
      isFarmerListing: (listing: CropListing, user?: User | null) => isFarmerListing(listing, user !== undefined ? user : currentUser),
      isBuyerOrder: (order: Order, user?: User | null) => isBuyerOrder(order, user !== undefined ? user : currentUser)
    }}>
      {children}
    </AgriContext.Provider>
  );
};

export const useAgri = () => {
  const context = useContext(AgriContext);
  if (!context) {
    throw new Error('useAgri must be used within an AgriProvider');
  }
  return context;
};
