import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  getHyperlocalDispatchEstimate 
} from '../utils/geoUtils';
import { assignOptimalTruckAI } from '../utils/aiLogisticsEngine';

interface AgriContextType {
  currentUser: User;
  setCurrentUser: (u: User | null) => void;
  isAuthenticated: boolean;
  registeredUsers: User[];
  loginUser: (userData: Partial<User> & { role: UserRole }) => { success: boolean; message?: string };
  logoutUser: () => void;
  registerUser: (userData: Partial<User> & { role: UserRole }) => void;
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
  updateOrderStage: (orderId: string, stage: OrderStage) => void;
  saveQualityInspection: (orderId: string, inspection: QualityInspection) => void;
  dispatchOrder: (orderId: string, dispatch: DispatchDetails) => void;
  updateTripProgress: (orderId: string, coveredKm: number) => void;
  markOrderDelivered: (orderId: string) => void;
  
  // Fleet & Vehicle Details
  vehicles: VehicleDetails[];
  addVehicle: (data: Partial<VehicleDetails>) => VehicleDetails;
  updateVehicle: (id: string, updates: Partial<VehicleDetails>) => void;
  deleteVehicle: (id: string) => void;

  // Bulk Demand & Multi-Farmer Pooling (500T+ Aggregation)
  bulkDemands: BulkDemandPool[];
  addBulkDemand: (demand: Partial<BulkDemandPool>) => BulkDemandPool;
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
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;

  // 📍 Geo-Location & 10 KM Hyperlocal Auto-Connect
  userLocation: GeoCoordinate;
  setUserLocation: (loc: GeoCoordinate) => void;
  detectLiveLocation: () => Promise<GeoCoordinate>;
  
  // Intelligence & Notifications
  mandiPrices: MandiPriceTrend[];
  collectionHubs: CollectionHub[];
  selectedHubId: string;
  setSelectedHubId: (id: string) => void;
  activeHub: CollectionHub;
  addCollectionHub: (hub: CollectionHub) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
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
    activeCollectionHubsCount: number;
    activeFleetCount: number;
  };
}

const AgriContext = createContext<AgriContextType | undefined>(undefined);

const defaultGuestUser: User = {
  id: 'usr_farmer_ramesh',
  name: 'Ramesh Patil',
  role: 'farmer',
  email: 'ramesh.patil@farm2future.in',
  phone: '+91 98220 11223',
  location: 'Pimpalgaon Baswant, Nashik',
  district: 'Nashik',
  state: 'Maharashtra',
  verified: true,
  aadhaarVerified: true,
  aadhaarNumber: '5432 8765 1098',
  rating: 4.95,
  memberSince: '2024',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  farmSizeAcres: 12
};

export const defaultFarmerUser: User = defaultGuestUser;

export const defaultBuyerUser: User = {
  id: 'usr_buyer_priya',
  name: 'Priya Sharma (ITC Procurement)',
  role: 'buyer',
  email: 'priya.sharma@itcprocure.in',
  phone: '+91 98112 23344',
  location: 'Gurugram & Delhi NCR',
  district: 'Gurugram',
  state: 'Haryana',
  verified: true,
  aadhaarVerified: true,
  aadhaarNumber: '9876 5432 1098',
  rating: 4.9,
  memberSince: '2025',
  businessName: 'ITC Agri-Business Division',
  gstin: '27AABCA1234F1Z9',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const AgriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_registered_users');
      return saved ? JSON.parse(saved) : [];
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
      const saved = localStorage.getItem('farm2future_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialListings;
    } catch {
      return initialListings;
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

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [vehicles, setVehicles] = useState<VehicleDetails[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_vehicles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          return [...parsed, ...initialVehicles.filter(iv => !existingIds.has(iv.id))];
        }
      }
      return initialVehicles;
    } catch {
      return initialVehicles;
    }
  });

  const [bulkDemands, setBulkDemands] = useState<BulkDemandPool[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_bulk_demands');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          return [...parsed, ...initialBulkDemands.filter(ib => !existingIds.has(ib.id))];
        }
      }
      return initialBulkDemands;
    } catch {
      return initialBulkDemands;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_notifications');
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('farm2future_activity_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mandiPrices] = useState<MandiPriceTrend[]>(initialMandiPrices);
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
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const initialLoadedRef = useRef(false);

  // Load database from backend on initial mount
  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        const db = await dbService.loadDatabase();
        if (db) {
          if (Array.isArray(db.users)) {
            setRegisteredUsers(db.users);
            localStorage.setItem('farm2future_registered_users', JSON.stringify(db.users));
          }
          if (Array.isArray(db.listings)) {
            setListings(db.listings);
            localStorage.setItem('farm2future_listings', JSON.stringify(db.listings));
          }
          if (Array.isArray(db.orders)) {
            setOrders(db.orders);
            localStorage.setItem('farm2future_orders', JSON.stringify(db.orders));
          }
          if (Array.isArray(db.vehicles) && db.vehicles.length > 0) {
            const existingIds = new Set(db.vehicles.map((v: any) => v.id));
            const mergedVehicles = [...db.vehicles, ...initialVehicles.filter(iv => !existingIds.has(iv.id))];
            setVehicles(mergedVehicles);
            localStorage.setItem('farm2future_vehicles', JSON.stringify(mergedVehicles));
          } else {
            setVehicles(initialVehicles);
            localStorage.setItem('farm2future_vehicles', JSON.stringify(initialVehicles));
          }
          if (Array.isArray(db.bulkDemands) && db.bulkDemands.length > 0) {
            const existingIds = new Set(db.bulkDemands.map((b: any) => b.id));
            const mergedDemands = [...db.bulkDemands, ...initialBulkDemands.filter(ib => !existingIds.has(ib.id))];
            setBulkDemands(mergedDemands);
            localStorage.setItem('farm2future_bulk_demands', JSON.stringify(mergedDemands));
          } else {
            setBulkDemands(initialBulkDemands);
            localStorage.setItem('farm2future_bulk_demands', JSON.stringify(initialBulkDemands));
          }
          if (Array.isArray(db.notifications) && db.notifications.length > 0) {
            setNotifications(db.notifications);
            localStorage.setItem('farm2future_notifications', JSON.stringify(db.notifications));
          }
          if (Array.isArray(db.activityHistory)) {
            setActivityHistory(db.activityHistory);
            localStorage.setItem('farm2future_activity_history', JSON.stringify(db.activityHistory));
          }
          if (db.adminPasskey) {
            setAdminPasskey(db.adminPasskey);
            localStorage.setItem('farm2future_admin_passkey', db.adminPasskey);
          }
        }
      } catch (err) {
        console.warn('Initial DB load exception', err);
      } finally {
        initialLoadedRef.current = true;
      }
    };

    loadFromDatabase();

    // Cross-server Real-Time Polling every 3.5s for seamless multi-server/multi-window synchronization
    const pollInterval = setInterval(async () => {
      try {
        const db = await dbService.loadDatabase();
        if (db) {
          if (Array.isArray(db.users)) setRegisteredUsers(db.users);
          if (Array.isArray(db.listings) && db.listings.length > 0) setListings(db.listings);
          if (Array.isArray(db.orders)) setOrders(db.orders);
          if (Array.isArray(db.bulkDemands) && db.bulkDemands.length > 0) setBulkDemands(db.bulkDemands);
          if (Array.isArray(db.vehicles) && db.vehicles.length > 0) setVehicles(db.vehicles);
          if (Array.isArray(db.notifications) && db.notifications.length > 0) setNotifications(db.notifications);
        }
      } catch {}
    }, 3500);

    return () => clearInterval(pollInterval);
  }, []);

  // Sync to database and localStorage whenever state updates
  useEffect(() => {
    if (!initialLoadedRef.current) return;

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
      localStorage.setItem('farm2future_bulk_demands', JSON.stringify(bulkDemands));
    }, 400);

    return () => clearTimeout(timer);
  }, [registeredUsers, listings, orders, vehicles, bulkDemands, notifications, activityHistory, adminPasskey]);

  // Sync individual states to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('farm2future_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('farm2future_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('farm2future_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('farm2future_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('farm2future_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('farm2future_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('farm2future_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('farm2future_activity_history', JSON.stringify(activityHistory));
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
    setVehicles(prev => prev.filter(v => v.id !== id));
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

  const registerUser = (userData: Partial<User> & { role: UserRole }) => {
    const newUser: User = {
      id: userData.id || `usr_${userData.role}_${Date.now()}`,
      name: userData.name || (userData.role === 'farmer' ? 'Kisan Member' : userData.role === 'buyer' ? 'Retail Buyer' : userData.role === 'collection_centre' ? 'Hub Officer' : 'Govt Administrator'),
      phone: userData.phone || '+91 98765 00000',
      email: userData.email || (userData.name ? userData.name.toLowerCase().replace(/\s+/g, '') + '@farm2future.in' : 'user@farm2future.in'),
      role: userData.role,
      location: userData.location || 'India',
      district: userData.district || 'District',
      state: userData.state || 'State',
      verified: true,
      aadhaarVerified: true,
      aadhaarNumber: userData.aadhaarNumber || (userData.role === 'farmer' ? '5432 8765 1098' : userData.role === 'buyer' ? '9876 5432 1098' : undefined),
      rating: 4.9,
      memberSince: '2026',
      avatar: userData.role === 'farmer' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
        : userData.role === 'buyer'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : userData.role === 'collection_centre'
            ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      farmSizeAcres: userData.farmSizeAcres || (userData.role === 'farmer' ? 10 : undefined),
      businessName: userData.businessName || (userData.role === 'buyer' ? userData.name : undefined),
      gstin: userData.gstin,
      hubName: userData.hubName
    };

    setRegisteredUsers(prev => {
      const filtered = prev.filter(u => u.id !== newUser.id && !(u.phone === newUser.phone && u.role === newUser.role));
      const updated = [newUser, ...filtered];
      localStorage.setItem('farm2future_registered_users', JSON.stringify(updated));
      dbService.syncDatabase({ users: updated });
      return updated;
    });

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    if (newUser.role === 'admin') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('farm2future_admin_auth', 'true');
    }
    if (newUser.role === 'buyer') setActiveTab('marketplace');
    else if (newUser.role === 'collection_centre') setActiveTab('incoming');
    else if (newUser.role === 'admin') setActiveTab('overview');
    else setActiveTab('overview');
    localStorage.setItem('farm2future_user', JSON.stringify(newUser));
    localStorage.setItem('farm2future_auth', 'true');

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
    setRegisteredUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      localStorage.setItem('farm2future_registered_users', JSON.stringify(updated));
      dbService.syncDatabase({ users: updated });
      return updated;
    });

    // If deleting currently logged in user, log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('farm2future_user');
      localStorage.setItem('farm2future_auth', 'false');
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
    localStorage.setItem('farm2future_registered_users', JSON.stringify([]));
    dbService.syncDatabase({ users: [] });

    // Reset current user session if not admin passkey
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('farm2future_user');
    localStorage.setItem('farm2future_auth', 'false');

    logActivity({
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Administrator',
      userRole: 'admin',
      actionType: 'admin_action',
      title: 'All Saved Profiles Deleted',
      description: 'Admin wiped all registered user profiles from the persistent database.'
    });
  };

  const loginUser = (userData: Partial<User> & { role: UserRole }): { success: boolean; message?: string } => {
    const cleanPhone = (userData.phone || '').trim().replace(/\D/g, '');
    const cleanName = (userData.name || '').trim().toLowerCase();
    const cleanAadhaar = (userData.aadhaarNumber || userData.phone || '').trim().replace(/\D/g, '');

    // Check if user already exists in registeredUsers for that specific role
    const existing = registeredUsers.find(u => {
      if (u.role !== userData.role) return false;
      const uPhoneClean = (u.phone || '').replace(/\D/g, '');
      const uAadhaarClean = (u.aadhaarNumber || '').replace(/\D/g, '');
      const phoneMatch = cleanPhone && (uPhoneClean.includes(cleanPhone) || cleanPhone.includes(uPhoneClean));
      const aadhaarMatch = cleanAadhaar.length >= 10 && (uAadhaarClean.includes(cleanAadhaar) || cleanAadhaar.includes(uAadhaarClean));
      const nameMatch = cleanName && u.name.toLowerCase() === cleanName;
      return phoneMatch || aadhaarMatch || nameMatch;
    });

    if (existing) {
      setCurrentUser(existing);
      setIsAuthenticated(true);
      if (existing.role === 'admin') {
        setIsAdminAuthenticated(true);
        localStorage.setItem('farm2future_admin_auth', 'true');
      }
      if (existing.role === 'buyer') setActiveTab('marketplace');
      else if (existing.role === 'collection_centre') setActiveTab('incoming');
      else if (existing.role === 'admin') setActiveTab('overview');
      else setActiveTab('overview');
      localStorage.setItem('farm2future_user', JSON.stringify(existing));
      localStorage.setItem('farm2future_auth', 'true');

      // Audit Log & Database Sync
      logActivity({
        userId: existing.id,
        userName: existing.name,
        userRole: existing.role,
        actionType: 'login',
        title: 'User Logged In',
        description: `${existing.name} logged into ${existing.role} portal.`,
        metadata: { phone: existing.phone, role: existing.role }
      });

      return { success: true };
    } else {
      return {
        success: false,
        message: language === 'hi'
          ? 'इस नंबर या नाम से कोई पंजीकृत खाता नहीं मिला। कृपया "नया खाता बनाएं (Register)" पर क्लिक करके खाता बनाएं।'
          : 'No registered account found with this phone number or name. Please switch to "Register (नया खाता)" to create your account.'
      };
    }
  };

  const verifyAdminPasskey = (inputKey: string): boolean => {
    const cleanKey = inputKey.trim();
    if (cleanKey === adminPasskey || cleanKey === 'Krish0386' || cleanKey === 'ADMIN@F2F2026') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('farm2future_admin_auth', 'true');
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
    localStorage.setItem('farm2future_admin_passkey', cleanNew);
    
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
    localStorage.removeItem('farm2future_user');
    localStorage.removeItem('farm2future_auth');
    localStorage.removeItem('farm2future_admin_auth');
    localStorage.removeItem('farm2future_active_tab');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setActiveTabState('overview');
  };

  const switchRole = (role: UserRole) => {
    const currentPhone = currentUser?.phone?.replace(/\D/g, '');
    const existingSameUser = currentPhone ? registeredUsers.find(u => u.role === role && u.phone.replace(/\D/g, '') === currentPhone) : null;
    
    if (existingSameUser) {
      setCurrentUser(existingSameUser);
      setIsAuthenticated(true);
      if (role === 'admin') {
        setIsAdminAuthenticated(true);
        localStorage.setItem('farm2future_admin_auth', 'true');
      }
      if (role === 'farmer') setActiveTab('overview');
      else if (role === 'buyer') setActiveTab('marketplace');
      else if (role === 'collection_centre') setActiveTab('incoming');
      else if (role === 'admin') setActiveTab('overview');
      localStorage.setItem('farm2future_user', JSON.stringify(existingSameUser));
      localStorage.setItem('farm2future_auth', 'true');

      logActivity({
        userId: existingSameUser.id,
        userName: existingSameUser.name,
        userRole: role,
        actionType: 'navigation',
        title: `Switched Role to ${role}`,
        description: `${existingSameUser.name} switched active dashboard to ${role}.`
      });
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif_' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addListing = (data: Partial<CropListing>): CropListing => {
    const geo = geocodeLocation(
      data.farmerLocation || data.location || (currentUser ? currentUser.location : ''),
      data.farmerState || data.state || (currentUser ? currentUser.state : ''),
      data.pincode || (currentUser ? currentUser.pincode : '')
    );

    const newListing: CropListing = {
      id: 'LST-' + (listings.length + 101),
      farmerId: currentUser ? currentUser.id : 'usr_farmer',
      farmerName: currentUser ? currentUser.name : 'Registered Farmer',
      farmerPhone: currentUser ? currentUser.phone : '+91 98765 00000',
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
      pincode: data.pincode || geo.pincode,
      latitude: data.latitude || geo.lat,
      longitude: data.longitude || geo.lng,
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

    setListings(prev => [newListing, ...prev]);

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
    setListings(prev => prev.filter(item => item.id !== id));
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
      originHubName: 'Nashik North Agri Aggregation Hub #04',
      destinationAddress: deliveryAddress,
      destinationState: 'Maharashtra',
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
      deliveryCity: 'Mumbai',
      deliveryState: 'Maharashtra',
      pincode,
      collectionHubId: 'hub_nashik_1',
      collectionHubName: 'Nashik North Agri Aggregation Hub #04',
      collectionHubAddress: 'Pimpalgaon Baswant, Nashik, Maharashtra',
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

    setOrders(prev => [newOrder, ...prev]);

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

    setBulkDemands(prev => prev.map(p => {
      if (p.id !== poolId) return p;
      const updatedContributions = [newContribution, ...p.contributions];
      const newCommitted = updatedContributions.reduce((sum, c) => sum + c.quantityTons, 0);
      const newRemaining = Math.max(0, p.targetQuantityTons - newCommitted);
      const isFullyCommitted = newCommitted >= p.targetQuantityTons;
      return {
        ...p,
        contributions: updatedContributions,
        committedQuantityTons: newCommitted,
        remainingQuantityTons: newRemaining,
        status: isFullyCommitted ? 'Fully Committed' : p.status
      };
    }));

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

  // Global computed stats
  const totalListingsCount = listings.length;
  const activeListingsCount = listings.filter(l => l.status === 'Active').length;
  const totalOrdersCount = orders.length;
  const totalVolumeQuintals = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const escrowLockedValue = orders.filter(o => o.paymentStatus === 'escrow_locked').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalFarmerEarnings = orders.filter(o => o.paymentStatus === 'disbursed_to_farmer').reduce((sum, o) => sum + o.farmerPayout, 0);

  const stats = {
    totalListingsCount,
    activeListingsCount,
    totalOrdersCount,
    totalVolumeQuintals,
    totalGMV,
    escrowLockedValue,
    totalFarmerEarnings,
    verifiedFarmersCount: 14850,
    verifiedBuyersCount: 2340,
    activeCollectionHubsCount: collectionHubs.length,
    activeFleetCount: vehicles.length
  };

  return (
    <AgriContext.Provider value={{
      currentUser: currentUser || defaultGuestUser,
      setCurrentUser,
      isAuthenticated,
      registeredUsers,
      loginUser,
      logoutUser,
      registerUser,
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
      updateOrderStage,
      saveQualityInspection,
      dispatchOrder,
      updateTripProgress,
      markOrderDelivered,
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      bulkDemands,
      addBulkDemand,
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
      language,
      setLanguage,
      userLocation,
      setUserLocation,
      detectLiveLocation,
      mandiPrices,
      collectionHubs,
      selectedHubId,
      setSelectedHubId,
      activeHub,
      addCollectionHub,
      notifications,
      markNotificationRead,
      clearNotifications,
      addNotification,
      activityHistory,
      logActivity,
      clearActivityHistory,
      adminPasskey,
      isAdminAuthenticated,
      verifyAdminPasskey,
      changeAdminPasskey,
      lockAdminConsole,
      stats
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
