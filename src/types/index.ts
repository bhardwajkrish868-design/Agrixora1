export type UserRole = 'farmer' | 'buyer' | 'collection_centre' | 'admin';

export type QualityGrade = 'Grade A+' | 'Grade A' | 'Grade B' | 'Grade C' | 'Organic Certified' | 'Fair' | 'Rejected';

export type OrderStage = 
  | 'order_placed'
  | 'collected_at_hub'
  | 'quality_tested'
  | 'quality_verified'
  | 'in_transit'
  | 'delivered';

export type PaymentStatus = 
  | 'escrow_locked'
  | 'disbursed_to_farmer'
  | 'refunded'
  | 'pending';

export type CropCategory = 'Cereals & Grains' | 'Vegetables' | 'Fruits' | 'Pulses' | 'Oilseeds' | 'Spices' | 'Commercial' | 'Medicinal';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  location: string;
  state: string;
  district?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  businessName?: string;
  farmSizeAcres?: number;
  verified?: boolean;
  memberSince?: string;
  avatar?: string;
  rating?: number;
  totalDeals?: number;
  kycVerified?: boolean;
  aadhaarVerified?: boolean;
  aadhaarNumber?: string;
  gstin?: string;
  hubName?: string;
  password?: string;
  preferredMandi?: string;
}

export interface QualityParameter {
  name: string;
  value: string | number;
  unit: string;
  isAcceptable: boolean;
  benchmark: string;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  farmerState?: string;
  district?: string;
  location?: string;
  state?: string;
  cropName: string;
  category: CropCategory;
  variety: string;
  quantity: number;
  unit?: 'Quintals' | 'KG' | 'Kg' | 'Tons' | 'Bags' | string;
  pricePerUnit: number;
  minOrderQuantity?: number;
  harvestDate: string;
  shelfLifeDays?: number;
  storageCondition?: 'Ambient' | 'Cold Storage' | 'Dry Aerated' | string;
  qualityGrade: QualityGrade;
  images: string[];
  description: string;
  status: 'Active' | 'Under Offer' | 'Sold Out' | 'Sold' | 'Expired';
  collectionCentreId?: string;
  fciHubName?: string;
  fciHubCode?: string;
  fciHubDistanceKm?: number;
  fciHubType?: string;
  fciHubDistrict?: string;
  fciHubState?: string;
  nearestMandi?: string;
  createdAt: string;
  organicCertified?: boolean;
  mandiBenchmarkPrice?: number;
  moisturePercent?: number;
  expectedPriceTotal?: number;
  availableDate?: string;
  viewsCount?: number;
  bidsCount?: number;
  recommendedPrice?: number;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  isHyperlocal?: boolean;
}

export interface SupplyChainStep {
  id?: string;
  stage: OrderStage;
  title: string;
  subtitle?: string;
  description?: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  location: string;
  details?: {
    agentName?: string;
    verifiedWeight?: string;
    moistureScore?: string;
    gradeAssigned?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    temperatureCelsius?: number;
    humidityPercent?: number;
    digitalSignature?: string;
    gpsCoordinates?: string;
  };
}

export interface QualityInspection {
  inspectorName: string;
  hubId: string;
  hubName: string;
  inspectedAt: string;
  moisturePercent: number;
  foreignMatterPercent: number;
  pestInfestationPercent: number;
  assignedGrade: QualityGrade;
  visualQualityScore: number;
  notes: string;
  certificateId: string;
  passed: boolean;
}

export interface RouteCheckpoint {
  id: string;
  name: string;
  distanceKm: number;
  status: 'passed' | 'current' | 'upcoming';
  passedAt?: string;
  type?: 'origin' | 'toll' | 'checkpoint' | 'junction' | 'destination';
  description?: string;
}

export interface VehicleDetails {
  id: string;
  vehicleNo: string;
  vehicleType: string;
  modelName?: string;
  transporterName: string;
  driverName: string;
  driverPhone: string;
  driverLicenseNo?: string;
  capacityTons: number;
  temperatureCelsius?: number;
  humidityPercent?: number;
  gpsDeviceId?: string;
  rcNumber?: string;
  insuranceValidity?: string;
  pucCertificateNo?: string;
  currentStatus: 'Available' | 'On Trip' | 'Under Maintenance' | 'Loading';
  lastInspectionDate?: string;
  originHub?: string;
  destinationWarehouse?: string;
  state: string;
  district?: string;
  cityHub?: string;
  hubLocation?: string;
  serviceType?: string;
  ratePerKm?: number;
  rating?: number;
  operatingRoutes?: string[];
  verifiedTransporter?: boolean;
  activeTrip?: {
    orderId?: string;
    routeHighway?: string;
    origin?: string;
    destination?: string;
    totalDistanceKm?: number;
    coveredDistanceKm?: number;
    currentSpeedKmph?: number;
    estimatedMinutesRemaining?: number;
  };
}

export interface StateTransportBooking {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userPhone: string;
  vehicleId: string;
  vehicleNo: string;
  transporterName: string;
  driverName: string;
  driverPhone: string;
  state: string;
  pickupLocation: string;
  dropLocation: string;
  cropName: string;
  cargoWeightTons: number;
  expectedDate: string;
  estimatedCost: number;
  status: 'Confirmed' | 'Dispatched' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface DispatchDetails {
  transporterName: string;
  driverName: string;
  driverPhone: string;
  driverLicenseNo?: string;
  vehicleNo: string;
  vehicleType: string;
  modelName?: string;
  capacityTons?: number;
  rcNumber?: string;
  gpsDeviceId?: string;
  insuranceValidity?: string;
  eWayBillNo: string;
  dispatchedAt: string;
  estimatedArrival: string;
  temperatureCelsius: number;
  gpsLiveLat: number;
  gpsLiveLng: number;
  originHub?: string;
  destinationWarehouse?: string;
  routeHighway?: string;
  totalDistanceKm?: number;
  coveredDistanceKm?: number;
  currentSpeedKmph?: number;
  estimatedMinutesRemaining?: number;
  checkpoints?: RouteCheckpoint[];
}

export interface AIAllocationDetails {
  aiMatchScore: number;
  aiModelUsed: string;
  aiConfidence: 'Ultra High' | 'High' | 'Optimal';
  aiRationale: string[];
  carbonSavedKg: number;
  costOptimizedPercent: number;
  allocatedVehicleId: string;
  allocatedVehicleNo: string;
  allocatedDriverName: string;
  allocatedDriverPhone: string;
  allocatedAt: string;
  autoAssigned: boolean;
  transitType: 'Hyperlocal EV Express' | 'Direct Farmgate Reefer' | 'Mandi Trunk Line' | 'Interstate Heavy Freight';
}

export interface Order {
  id: string;
  orderNumber: string;
  listingId: string;
  cropName: string;
  category: CropCategory;
  variety?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  produceAmount?: number;
  collectionFee?: number;
  logisticsFee?: number;
  platformFee: number;
  farmerPayout: number;
  
  // Delivery & Payment
  deliveryPaidBy?: 'buyer';
  deliveryPaymentStatus?: 'paid_by_buyer' | 'disbursed_to_transporter' | 'escrow_locked';
  deliveryFeePaid?: number;
  transporterPayout?: number;
  assignedVehicleId?: string;
  
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  farmerState: string;
  
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerOrg?: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryState?: string;
  pincode?: string;
  
  collectionHubId: string;
  collectionHubName: string;
  collectionHubAddress: string;
  
  orderDate: string;
  expectedDelivery: string;
  actualDeliveryDate?: string;
  
  currentStage: OrderStage;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paymentMethod: string;
  
  trackingSteps: SupplyChainStep[];
  qualityInspection?: QualityInspection;
  dispatchDetails?: DispatchDetails;
  aiAllocation?: AIAllocationDetails;
}

export interface MandiPriceTrend {
  cropName: string;
  category: CropCategory;
  currentPrice: number;
  yesterdayPrice: number;
  change: number;
  changePercent: number;
  mandiName: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  arrivalVolumeTons: number;
  recommendedFarmerSellingPrice: number;
  demandTrend: 'High' | 'Moderate' | 'Low';
  supplyTrend: 'Surplus' | 'Adequate' | 'Deficit';
  historical7Days: { day: string; price: number; volume: number }[];
  historical30Days: { date: string; modalPrice: number; minPrice: number; maxPrice: number }[];
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole | 'all';
  recipientId?: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'quality' | 'dispatch' | 'delivery' | 'market' | 'alert';
  timestamp: string;
  read: boolean;
  orderId?: string;
  linkTab?: string;
}

export interface CollectionHub {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  address: string;
  phone: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  capacityTons: number;
  currentOccupancyTons: number;
  temperatureCelsius: number;
  humidityPercent: number;
  activeBatches: number;
  operatorName: string;
  operatingHours: string;
  zone?: 'North Zone' | 'West & Central Zone' | 'South Zone' | 'East Zone' | 'North-East Zone';
  hubType?: 'FCI Modern Steel Silo' | 'FCI Food Storage Depot (FSD)' | 'FCI Railhead Buffer Depot' | 'State APMC Aggregation Hub';
  railwaySiding?: boolean;
  weighbridgeCapacityTons?: number;
  fciDivision?: string;
  silosCount?: number;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: UserRole | 'admin' | 'system';
  actionType: 'login' | 'register' | 'add_produce' | 'order_placed' | 'stage_update' | 'qc_certified' | 'dispatched' | 'delivered' | 'payment_disbursed' | 'navigation' | 'profile_update' | 'admin_action' | 'transport_booking' | string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PoolContribution {
  id: string;
  poolId: string;
  contributorId: string;
  contributorName: string;
  contributorRole: 'farmer' | 'collection_centre' | 'admin';
  contributorPhone: string;
  location: string;
  state: string;
  district?: string;
  quantityTons: number;
  pricePerTon: number;
  totalPayout: number;
  expectedDispatchDate: string;
  qualityGrade: QualityGrade;
  moisturePercent?: number;
  notes?: string;
  status: 'Ready to Send' | 'Confirmed' | 'Accepted' | 'Dispatched to Hub' | 'QC Verified' | 'Settled' | 'Pledged' | string;
  vehicleAssigned?: string;
  createdAt: string;
}

export interface BulkDemandPool {
  id: string;
  demandNumber: string;
  buyerId: string;
  buyerName: string;
  buyerOrg: string;
  buyerPhone: string;
  cropName: string;
  category: CropCategory;
  variety: string;
  targetQuantityTons: number;
  committedQuantityTons: number;
  remainingQuantityTons: number;
  pricePerTon: number;
  totalBudget: number;
  deliveryLocation: string;
  deliveryCity: string;
  deliveryState: string;
  pincode?: string;
  deadlineDate: string;
  expectedDispatchStart: string;
  qualityGradeRequirement: QualityGrade;
  moistureLimitPercent: number;
  storageRequirement?: string;
  description: string;
  status: 'Open for Contributions' | 'Fully Committed' | 'In Aggregation' | 'Dispatched' | 'Completed';
  targetTrucksCount: number;
  contributions: PoolContribution[];
  createdAt: string;
}

export interface DatabaseState {
  users: User[];
  listings: CropListing[];
  orders: Order[];
  vehicles?: VehicleDetails[];
  bulkDemands?: BulkDemandPool[];
  transportBookings?: StateTransportBooking[];
  notifications: NotificationItem[];
  activityHistory: ActivityLog[];
  adminPasskey: string;
  deletedIds?: string[];
  lastUpdated: string;
}
