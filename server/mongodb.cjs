const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Define Mongoose Schemas for Agrixora
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  role: { type: String, enum: ['farmer', 'buyer', 'collection_centre', 'admin'], required: true },
  location: { type: String },
  district: { type: String },
  state: { type: String },
  verified: { type: Boolean, default: true },
  aadhaarVerified: { type: Boolean, default: true },
  aadhaarNumber: { type: String },
  rating: { type: Number, default: 4.9 },
  memberSince: { type: String, default: '2026' },
  avatar: { type: String },
  farmSizeAcres: { type: Number },
  businessName: { type: String },
  gstin: { type: String },
  hubName: { type: String }
}, { timestamps: true });

const ListingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String },
  farmerLocation: { type: String },
  cropName: { type: String, required: true },
  category: { type: String, required: true },
  variety: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Quintals' },
  qualityGrade: { type: String, default: 'Grade A' },
  pricePerUnit: { type: Number, required: true },
  expectedPriceTotal: { type: Number },
  harvestDate: { type: String },
  availableDate: { type: String, default: 'Immediate Dispatch' },
  location: { type: String },
  district: { type: String },
  state: { type: String },
  images: [{ type: String }],
  description: { type: String },
  moisturePercent: { type: Number, default: 12 },
  organicCertified: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Sold', 'Draft'], default: 'Active' },
  viewsCount: { type: Number, default: 0 },
  bidsCount: { type: Number, default: 0 },
  recommendedPrice: { type: Number },
  mandiBenchmarkPrice: { type: Number }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true },
  listingId: { type: String },
  cropName: { type: String, required: true },
  category: { type: String },
  variety: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Quintals' },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String },
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String },
  buyerOrg: { type: String },
  deliveryAddress: { type: String },
  pincode: { type: String },
  paymentMethod: { type: String, default: 'UPI' },
  escrowStatus: { type: String, default: 'Funded & Locked' },
  currentStage: { type: String, default: 'order_placed' },
  stagesTimeline: [{
    stage: { type: String },
    timestamp: { type: String },
    status: { type: String },
    details: { type: String },
    facilityName: { type: String },
    facilityLocation: { type: String }
  }],
  vehicleDetails: {
    vehicleNo: { type: String },
    driverName: { type: String },
    driverPhone: { type: String },
    temperatureCelsius: { type: Number },
    humidityPercent: { type: Number },
    currentLocation: { type: String },
    etaTimestamp: { type: String },
    liveGpsCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  qualityInspection: {
    inspectedBy: { type: String },
    inspectionDate: { type: String },
    moisturePercent: { type: Number },
    foreignMatterPercent: { type: Number },
    gradeAssigned: { type: String },
    status: { type: String },
    certificateId: { type: String }
  },
  createdAt: { type: String }
}, { timestamps: true, strict: false });

const ActivitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  userName: { type: String },
  userRole: { type: String },
  actionType: { type: String },
  title: { type: String },
  description: { type: String },
  timestamp: { type: String },
  metadata: { type: Object }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String },
  message: { type: String },
  type: { type: String },
  timestamp: { type: String },
  read: { type: Boolean, default: false },
  role: { type: String },
  linkTab: { type: String }
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  vehicleNumber: { type: String },
  driverName: { type: String },
  driverPhone: { type: String },
  capacityTons: { type: Number },
  status: { type: String },
  temperature: { type: Number },
  humidity: { type: Number },
  currentLocation: { type: String }
}, { timestamps: true, strict: false });

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const BulkDemandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  data: { type: Object, required: true }
}, { timestamps: true, strict: false });

// Models
const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const ListingModel = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const ActivityModel = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const VehicleModel = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
const SettingModel = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
const BulkDemandModel = mongoose.models.BulkDemand || mongoose.model('BulkDemand', BulkDemandSchema);

let isConnected = false;
let currentUri = process.env.MONGODB_URI || '';

async function connectMongoDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI || currentUri;
  if (!uri) {
    return { success: false, message: 'No MongoDB URI configured. Waiting for connection string.' };
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return { success: true, message: 'MongoDB is already connected.' };
    }

    console.log('🔄 Connecting to MongoDB Cloud Database...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    });

    isConnected = true;
    currentUri = uri;
    console.log('✅ Connected to MongoDB Cloud Database successfully!');

    // Trigger auto-migration from local JSON DB if MongoDB collections are empty
    await autoMigrateFromJsonIfEmpty();

    return { 
      success: true, 
      message: 'Connected to MongoDB Cloud successfully!',
      host: mongoose.connection.host,
      database: mongoose.connection.name
    };
  } catch (err) {
    isConnected = false;
    console.error('❌ MongoDB Cloud Connection Error:', err.message);
    return { success: false, error: err.message };
  }
}

// Auto-seed cloud database from local agrixora_db.json on first connection
async function autoMigrateFromJsonIfEmpty() {
  try {
    const jsonPath = path.join(__dirname, '..', 'data', 'agrixora_db.json');
    if (!fs.existsSync(jsonPath)) return;

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const localData = JSON.parse(raw || '{}');

    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && Array.isArray(localData.users) && localData.users.length > 0) {
      console.log(`📦 Auto-migrating ${localData.users.length} users to MongoDB Cloud...`);
      for (const u of localData.users) {
        await UserModel.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      }
    }

    const listingCount = await ListingModel.countDocuments();
    if (listingCount === 0 && Array.isArray(localData.listings) && localData.listings.length > 0) {
      console.log(`📦 Auto-migrating ${localData.listings.length} listings to MongoDB Cloud...`);
      for (const l of localData.listings) {
        await ListingModel.findOneAndUpdate({ id: l.id }, l, { upsert: true, new: true });
      }
    }

    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0 && Array.isArray(localData.orders) && localData.orders.length > 0) {
      console.log(`📦 Auto-migrating ${localData.orders.length} orders to MongoDB Cloud...`);
      for (const o of localData.orders) {
        await OrderModel.findOneAndUpdate({ id: o.id }, o, { upsert: true, new: true });
      }
    }

    const activityCount = await ActivityModel.countDocuments();
    if (activityCount === 0 && Array.isArray(localData.activityHistory) && localData.activityHistory.length > 0) {
      console.log(`📦 Auto-migrating activity history to MongoDB Cloud...`);
      for (const a of localData.activityHistory.slice(0, 500)) {
        await ActivityModel.findOneAndUpdate({ id: a.id }, a, { upsert: true, new: true });
      }
    }

    console.log('🎉 Initial data migration to MongoDB Cloud complete!');
  } catch (err) {
    console.warn('⚠️ Auto-migration notice:', err.message);
  }
}

// Fetch all database state from MongoDB
async function getAllMongoData() {
  if (!isConnected) return null;

  try {
    const [users, listings, orders, activities, notifications, vehicles, adminKeySetting, bulkDemandsRaw] = await Promise.all([
      UserModel.find({}).lean(),
      ListingModel.find({}).lean(),
      OrderModel.find({}).lean(),
      ActivityModel.find({}).sort({ createdAt: -1 }).limit(500).lean(),
      NotificationModel.find({}).sort({ createdAt: -1 }).limit(100).lean(),
      VehicleModel.find({}).lean(),
      SettingModel.findOne({ key: 'adminPasskey' }).lean(),
      BulkDemandModel.find({}).lean()
    ]);

    const bulkDemands = (bulkDemandsRaw || []).map(b => b.data || b);

    return {
      users: users || [],
      listings: listings || [],
      orders: orders || [],
      activityHistory: activities || [],
      notifications: notifications || [],
      vehicles: vehicles || [],
      adminPasskey: adminKeySetting?.value || 'Krish0386',
      bulkDemands: bulkDemands || [],
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    return null;
  }
}

// Atomic helpers
async function saveMongoUser(userData) {
  if (!isConnected) return null;
  return await UserModel.findOneAndUpdate({ id: userData.id }, userData, { upsert: true, new: true });
}

async function saveMongoListing(listingData) {
  if (!isConnected) return null;
  return await ListingModel.findOneAndUpdate({ id: listingData.id }, listingData, { upsert: true, new: true });
}

async function saveMongoOrder(orderData) {
  if (!isConnected) return null;
  return await OrderModel.findOneAndUpdate({ id: orderData.id }, orderData, { upsert: true, new: true });
}

async function updateMongoOrder(orderId, updates) {
  if (!isConnected) return null;
  return await OrderModel.findOneAndUpdate(
    { $or: [{ id: orderId }, { orderNumber: orderId }] },
    { $set: updates },
    { new: true }
  );
}

async function saveMongoBulkDemand(demandData) {
  if (!isConnected) return null;
  return await BulkDemandModel.findOneAndUpdate(
    { id: demandData.id },
    { id: demandData.id, data: demandData },
    { upsert: true, new: true }
  );
}

async function recordMongoActivity(activityData) {
  if (!isConnected) return null;
  return await ActivityModel.findOneAndUpdate({ id: activityData.id }, activityData, { upsert: true, new: true });
}

module.exports = {
  connectMongoDB,
  getIsConnected: () => isConnected,
  getMongoUri: () => currentUri ? currentUri.replace(/:([^:@]+)@/, ':****@') : '',
  getAllMongoData,
  saveMongoUser,
  saveMongoListing,
  saveMongoOrder,
  updateMongoOrder,
  saveMongoBulkDemand,
  recordMongoActivity,
  UserModel,
  ListingModel,
  OrderModel,
  ActivityModel,
  BulkDemandModel
};
