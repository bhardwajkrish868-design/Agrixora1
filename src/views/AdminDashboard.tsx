import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  ShieldCheck, 
  Users, 
  Boxes, 
  ShoppingBag, 
  Building2, 
  Receipt, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  Sparkles,
  MapPin,
  Lock,
  Search,
  Eye,
  Trash2,
  Check,
  Truck,
  Cpu,
  Radio,
  Send,
  Database,
  Download,
  History,
  RefreshCw,
  Filter,
  FileJson,
  Phone
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { 
    listings, 
    orders, 
    collectionHubs, 
    vehicles,
    stats, 
    activeTab,
    setActiveTab, 
    setActiveTrackingOrderId, 
    setSelectedListingModal,
    deleteListing,
    addNotification,
    adminPasskey,
    changeAdminPasskey,
    lockAdminConsole,
    registeredUsers,
    deleteUser,
    clearAllUsers,
    activityHistory,
    clearActivityHistory
  } = useAgri();

  const [broadcastTitle, setBroadcastTitle] = useState('Govt MSP Revision & Rabi Procurement Advisory');
  const [broadcastMsg, setBroadcastMsg] = useState('Government has approved a 12% MSP floor price enhancement on Wheat and Mustard. Direct DBT Escrow payments active at all 48 Collection Hubs.');
  const [broadcastRole, setBroadcastRole] = useState<'all' | 'farmer' | 'buyer'>('all');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Security passkey settings
  const [oldKeyInput, setOldKeyInput] = useState('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [keyChangeStatus, setKeyChangeStatus] = useState<{ text: string; isError: boolean } | null>(null);

  // Database audit filters
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  // Registered users filter & search
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'farmer' | 'buyer' | 'collection_centre' | 'admin'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Vehicle filter
  const [vehicleFilterQuery, setVehicleFilterQuery] = useState('');
  const [adminStateFilter, setAdminStateFilter] = useState('all');

  const handleChangeKey = (e: React.FormEvent) => {
    e.preventDefault();
    const res = changeAdminPasskey(oldKeyInput, newKeyInput);
    if (res.success) {
      setKeyChangeStatus({ text: '✅ ' + res.message, isError: false });
      setOldKeyInput('');
      setNewKeyInput('');
      setTimeout(() => setKeyChangeStatus(null), 4000);
    } else {
      setKeyChangeStatus({ text: '❌ ' + res.message, isError: true });
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    addNotification({
      title: broadcastTitle,
      message: broadcastMsg,
      type: 'market',
      recipientRole: broadcastRole
    });

    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const handleExportDb = () => {
    const exportData = {
      users: registeredUsers,
      listings,
      orders,
      vehicles,
      activityHistory,
      adminPasskey: '***PROTECTED***',
      exportedAt: new Date().toISOString(),
      platform: 'Farm2Future Smart Agricultural Platform'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm2future_db_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const volumeByCategoryData = [
    { name: 'Cereals & Grains', volume: 6800, color: '#10B981' },
    { name: 'Vegetables', volume: 4950, color: '#F59E0B' },
    { name: 'Oilseeds', volume: 2400, color: '#3B82F6' },
    { name: 'Spices', volume: 850, color: '#8B5CF6' },
    { name: 'Fruits', volume: 1600, color: '#EC4899' },
  ];

  const revenueGrowthData = [
    { month: 'Apr 26', gmv: 3400000, fee: 51000 },
    { month: 'May 26', gmv: 4800000, fee: 72000 },
    { month: 'Jun 26', gmv: 4200000, fee: 63000 },
    { month: 'Jul 26', gmv: 7100000, fee: 106500 },
    { month: 'Aug 26', gmv: 9850000, fee: 147750 },
  ];

  const userGrowthData = [
    { month: 'Apr', farmers: 8200, buyers: 1100 },
    { month: 'May', farmers: 9900, buyers: 1450 },
    { month: 'Jun', farmers: 11400, buyers: 1780 },
    { month: 'Jul', farmers: 13100, buyers: 2050 },
    { month: 'Aug', farmers: 14850, buyers: 2340 },
  ];

  const filteredHistory = (activityHistory || []).filter(item => {
    const matchesFilter = auditActionFilter === 'all' || item.actionType === auditActionFilter;
    const q = auditSearchQuery.toLowerCase().trim();
    if (!q) return matchesFilter;
    const matchesSearch = 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.userName && item.userName.toLowerCase().includes(q)) ||
      (item.userRole && item.userRole.toLowerCase().includes(q)) ||
      (item.metadata && JSON.stringify(item.metadata).toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const filteredVehicles = (vehicles || []).filter(v => {
    if (adminStateFilter !== 'all' && v.state !== adminStateFilter) return false;
    const q = vehicleFilterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.vehicleNo.toLowerCase().includes(q) ||
      v.transporterName.toLowerCase().includes(q) ||
      v.driverName.toLowerCase().includes(q) ||
      (v.modelName && v.modelName.toLowerCase().includes(q)) ||
      (v.driverPhone && v.driverPhone.includes(q)) ||
      (v.state && v.state.toLowerCase().includes(q)) ||
      (v.cityHub && v.cityHub.toLowerCase().includes(q))
    );
  });

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'register':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'login':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'add_produce':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'order_placed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'stage_update':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'qc_certified':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'dispatched':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'admin_action':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Farm2Future Central Directorate Oversight
              </span>
              <span className="text-xs text-slate-400">All-India Network Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Smart Agricultural Supply Chain Ecosystem
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time persistent database syncing users, crop lots, vehicles, escrow contracts, and live audit trails.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 bg-black/40 p-3 rounded-2xl backdrop-blur-xs border border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total GMV Settled</span>
              <span className="text-base font-extrabold text-emerald-400">₹9.85 Cr</span>
            </div>
            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">In Escrow Vault</span>
              <span className="text-base font-extrabold text-amber-300">₹{stats.escrowLockedValue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign Admin Security & Master Key Manager */}
      <div className="bg-gradient-to-r from-purple-900/90 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-purple-800/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display">Government Security & Master Access Control</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  🔒 Key Protected
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Master Passkey secures national administration, database synchronization, and broadcast feeds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={lockAdminConsole}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white font-bold text-xs border border-purple-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Immediately lock the admin console and switch to safe view"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Change Master Passkey Form */}
        <form onSubmit={handleChangeKey} className="pt-3 border-t border-purple-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
          <div>
            <label className="block text-purple-200 font-semibold mb-1 text-[11px]">
              Current Master Key
            </label>
            <input
              type="password"
              required
              placeholder="Enter current passkey"
              value={oldKeyInput}
              onChange={e => setOldKeyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-purple-500/40 text-white font-mono text-xs focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-semibold mb-1 text-[11px]">
              New Master Security Key (Min 6 chars)
            </label>
            <input
              type="text"
              required
              placeholder="Enter new secret key"
              value={newKeyInput}
              onChange={e => setNewKeyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-purple-500/40 text-white font-mono text-xs focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Update Master Passkey</span>
            </button>
          </div>
        </form>

        {keyChangeStatus && (
          <div className={`p-2.5 rounded-xl text-xs font-bold ${
            keyChangeStatus.isError ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
          }`}>
            {keyChangeStatus.text}
          </div>
        )}
      </div>

      {/* Database & Persistence Health Monitor Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-soft border border-emerald-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display">Persistent Database Storage & Audit Trail</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Auto-Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Primary Database File: <span className="font-mono text-emerald-300 text-[11px]">data/farm2future_db.json</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDb}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export DB Backup (.json)</span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit History ({activityHistory?.length || 0})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Registered Users</span>
            <strong className="text-lg font-extrabold text-white">{registeredUsers.length}</strong>
            <span className="text-[10px] text-emerald-400 block">Saved in DB</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Produce Lots</span>
            <strong className="text-lg font-extrabold text-white">{listings.length}</strong>
            <span className="text-[10px] text-amber-400 block">Saved in DB</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Consignments</span>
            <strong className="text-lg font-extrabold text-white">{orders.length}</strong>
            <span className="text-[10px] text-blue-400 block">Saved in DB</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Fleet Vehicles</span>
            <strong className="text-lg font-extrabold text-white">{vehicles?.length || 0}</strong>
            <span className="text-[10px] text-teal-400 block">Saved in DB</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Audit History</span>
            <strong className="text-lg font-extrabold text-white">{activityHistory?.length || 0}</strong>
            <span className="text-[10px] text-purple-400 block">Saved in DB</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified Farmers"
          value={stats.verifiedFarmersCount.toLocaleString('en-IN')}
          subtitle="100% Aadhaar & Land Record KYC"
          icon={Users}
          trend={{ value: '14.2%', isPositive: true }}
          colorScheme="emerald"
          onClick={() => setActiveTab('users')}
        />

        <StatCard
          title="Verified Buyers"
          value={stats.verifiedBuyersCount.toLocaleString('en-IN')}
          subtitle="Retailers, Exporters & Processors"
          icon={ShoppingBag}
          trend={{ value: '18.5%', isPositive: true }}
          colorScheme="blue"
          onClick={() => setActiveTab('users')}
        />

        <StatCard
          title="Fleet Vehicles"
          value={`${vehicles?.length || 0} Assets`}
          subtitle="GPS Linked Cold Vans"
          icon={Truck}
          colorScheme="purple"
          onClick={() => setActiveTab('vehicles')}
        />

        <StatCard
          title="Collection Hubs"
          value="48 Active"
          subtitle="Zero SLA/Cold Chain Breaches"
          icon={Building2}
          colorScheme="amber"
          onClick={() => setActiveTab('collection_centres')}
        />
      </div>

      {/* Vehicles Sub-View */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  National Transport Fleet & State Vehicle Asset Registry ({vehicles?.length || 0} Vehicles)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  24+ States
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pan-India logistics fleet, cold chain temperature logs, driver VAHAN compliance, and freight rate transparency
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('transport_services')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>State Transport Directory</span>
              </button>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                {vehicles?.filter(v => v.currentStatus === 'Available').length || 0} Ready
              </span>
            </div>
          </div>

          {/* Search & State Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search fleet by plate number, driver, model, state, or transporter..."
                value={vehicleFilterQuery}
                onChange={e => setVehicleFilterQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <select
                value={adminStateFilter}
                onChange={e => setAdminStateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="all">🇮🇳 All States ({vehicles.length})</option>
                {['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'West Bengal', 'Bihar', 'Kerala', 'Odisha', 'Assam', 'Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir', 'Jharkhand', 'Chhattisgarh', 'Goa', 'Delhi-NCR'].map(st => (
                  <option key={st} value={st}>📍 {st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Vehicle Plate No</th>
                  <th className="py-3 px-4">State & Hub</th>
                  <th className="py-3 px-4">Truck Model & Body</th>
                  <th className="py-3 px-4">Transporter Agency</th>
                  <th className="py-3 px-4">Driver & Contact</th>
                  <th className="py-3 px-4">Driver License</th>
                  <th className="py-3 px-4">Freight Rate</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No vehicles found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(veh => (
                    <tr key={veh.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">{veh.vehicleNo}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 block w-fit">
                          {veh.state}
                        </span>
                        {veh.cityHub && <span className="text-[10px] text-slate-400 block mt-0.5">{veh.cityHub} Hub</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{veh.modelName || veh.vehicleType}</div>
                        <div className="text-[10px] text-slate-400">{veh.capacityTons} Tons Capacity</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{veh.transporterName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{veh.driverName}</div>
                        <a href={`tel:${veh.driverPhone}`} className="text-[11px] font-mono text-emerald-700 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {veh.driverPhone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{veh.driverLicenseNo || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-900 font-bold">₹{veh.ratePerKm || 28}/km</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{veh.temperatureCelsius || 14.0}°C</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          veh.currentStatus === 'Available'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : veh.currentStatus === 'On Trip'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {veh.currentStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Database & Audit Trail Sub-View */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Database Storage & System Audit Logs
              </h2>
              <p className="text-xs text-slate-500">
                Immutable activity records stored in <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">data/farm2future_db.json</code>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportDb}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear audit history logs? This cannot be undone.')) {
                    clearActivityHistory();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search audit log by user, order, produce, description..."
                value={auditSearchQuery}
                onChange={e => setAuditSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={auditActionFilter}
                onChange={e => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Actions</option>
                <option value="register">Registration</option>
                <option value="login">Login / Auth</option>
                <option value="add_produce">Produce Listing</option>
                <option value="order_placed">Orders Placed</option>
                <option value="stage_update">Stage Updates</option>
                <option value="qc_certified">QC Certification</option>
                <option value="dispatched">Dispatch / Transit</option>
                <option value="delivered">Delivery & Escrow Release</option>
                <option value="admin_action">Admin Master Actions</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Stakeholder</th>
                  <th className="py-3 px-4">Event Title & Details</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="space-y-2">
                        <Database className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold">No activity logs match your filter criteria.</p>
                        <p className="text-[11px] text-slate-400">As actions are performed across the platform, they are recorded to the database in real-time.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(log.actionType)}`}>
                          {log.actionType.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.userName || 'System'}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{log.userRole || 'system'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.title}</div>
                        <div className="text-slate-600 text-[11px]">{log.description}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {JSON.stringify(log.metadata).slice(0, 45)}
                            {JSON.stringify(log.metadata).length > 45 ? '...' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stakeholders Sub-View */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Verified Registered Stakeholders ({registeredUsers.length} in Database)
              </h2>
              <p className="text-xs text-slate-500">Persistent database of registered farmers, buyers, collection hubs, and administrators</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {registeredUsers.length} Stored Accounts
              </span>
              {registeredUsers.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete all ${registeredUsers.length} saved profiles? This will wipe user records from database.`)) {
                      clearAllUsers();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All {registeredUsers.length} Profiles</span>
                </button>
              )}
            </div>
          </div>

          {/* Role Filter Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  userRoleFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({registeredUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('farmer')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  userRoleFilter === 'farmer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>🌾 Farmers</span>
                <span className="text-[10px] opacity-80">({registeredUsers.filter(u => u.role === 'farmer').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('buyer')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  userRoleFilter === 'buyer'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-800 hover:bg-blue-50'
                }`}
              >
                <span>🏢 Buyers</span>
                <span className="text-[10px] opacity-80">({registeredUsers.filter(u => u.role === 'buyer').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('collection_centre')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  userRoleFilter === 'collection_centre'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span>🏬 Hubs</span>
                <span className="text-[10px] opacity-80">({registeredUsers.filter(u => u.role === 'collection_centre').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  userRoleFilter === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-800 hover:bg-purple-50'
                }`}
              >
                <span>🏛️ Admins</span>
                <span className="text-[10px] opacity-80">({registeredUsers.filter(u => u.role === 'admin').length})</span>
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search name, phone, district..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Registered Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Stakeholder Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Farm / Enterprise Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Mobile Phone</th>
                  <th className="py-3 px-4">KYC Compliance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(() => {
                  const filtered = registeredUsers.filter(u => {
                    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                    const q = userSearchQuery.toLowerCase().trim();
                    if (!q) return matchRole;
                    const matchQuery = (
                      (u.name && u.name.toLowerCase().includes(q)) ||
                      (u.phone && u.phone.includes(q)) ||
                      (u.district && u.district.toLowerCase().includes(q)) ||
                      (u.state && u.state.toLowerCase().includes(q)) ||
                      (u.businessName && u.businessName.toLowerCase().includes(q)) ||
                      (u.hubName && u.hubName.toLowerCase().includes(q))
                    );
                    return matchRole && matchQuery;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400">
                          <div className="space-y-1.5">
                            <Users className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="font-semibold text-slate-600">
                              {registeredUsers.length === 0 
                                ? 'No registered stakeholder accounts found in database.'
                                : 'No registered users match your search/filter.'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              When farmers and buyers register on the login page, their accounts are automatically stored and listed here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <img 
                          src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'} 
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          u.role === 'buyer' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          u.role === 'collection_centre' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {u.role === 'farmer' ? '🌾 Farmer' : u.role === 'buyer' ? '🏢 Buyer' : u.role === 'collection_centre' ? '🏬 Hub' : '🏛️ Admin'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.role === 'farmer' && (
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            🌾 {u.farmSizeAcres || 5} Acres Farm
                          </span>
                        )}
                        {u.role === 'buyer' && (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-blue-900">{u.businessName || u.name}</div>
                            {u.gstin && <div className="text-[10px] text-slate-400 font-mono">GST: {u.gstin}</div>}
                          </div>
                        )}
                        {u.role === 'collection_centre' && (
                          <span className="font-semibold text-amber-800">
                            🏬 {u.hubName || 'APMC Hub'}
                          </span>
                        )}
                        {u.role === 'admin' && (
                          <span className="font-mono text-[10px] text-purple-700 font-bold">
                            🏛️ Govt Oversight
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{u.district || 'Nashik'}, {u.state || 'Maharashtra'}</div>
                        <div className="text-[10px] text-slate-400">{u.location}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">{u.phone}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aadhaar KYC Verified
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete profile for ${u.name} (${u.role})?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Listings Moderation Sub-View */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-600" />
                All Mandi Crop Listings Moderation
              </h2>
              <p className="text-xs text-slate-500">Persistent crop lots saved in database</p>
            </div>
            <span className="text-xs font-bold text-slate-600">{listings.length} Active Listings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Lot ID</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Expected Price</th>
                  <th className="py-3 px-4">Quality Grade</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No active crop listings in database currently.
                    </td>
                  </tr>
                ) : (
                  listings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{l.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{l.farmerName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{l.cropName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{l.category}</td>
                      <td className="py-3.5 px-4 font-semibold">{l.quantity} {l.unit || 'Quintals'}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">₹{l.pricePerUnit.toLocaleString('en-IN')}/{(l.unit || 'Quintals').slice(0, -1)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {l.qualityGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedListingModal(l)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delist this crop listing?')) {
                                deleteListing(l.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Remove Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Sub-View */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Active Supply Chain Consignments & Escrow Oversight
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No active orders or consignments saved in database.
                    </td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="py-3.5 px-4">{o.farmerName}</td>
                      <td className="py-3.5 px-4 font-semibold">{o.buyerOrg || o.buyerName}</td>
                      <td className="py-3.5 px-4">{o.cropName} ({o.quantity} {o.unit})</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {o.currentStage.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {o.paymentStatus.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            setActiveTrackingOrderId(o.id);
                            setActiveTab('track_delivery');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3 text-emerald-400" />
                          <span>Live Track</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collection Centres Sub-View */}
      {activeTab === 'collection_centres' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Regional Aggregation Hubs Network (48 Active Stations)
              </h2>
              <p className="text-xs text-slate-500">Cold chain and weighbridge integrity status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionHubs.map(hub => (
              <div key={hub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="text-sm">{hub.name}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    ONLINE
                  </span>
                </div>
                <p className="text-slate-500">{hub.address}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Occupancy:</span>
                    <strong className="text-slate-900">{hub.currentOccupancyTons}/{hub.capacityTons} T</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chamber Temp:</span>
                    <strong className="text-emerald-700">{hub.temperatureCelsius}°C</strong>
                  </div>
                </div>
                <div className="pt-2 flex justify-between text-[11px] text-slate-500">
                  <span>Manager: {hub.operatorName}</span>
                  <span className="font-mono">{hub.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Sub-View */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              Farm2Future Smart Escrow Audit Ledger
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              100% Cryptographically Reconciled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Txn Hash</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Buyer Entity</th>
                  <th className="py-3 px-4">Gross GMV</th>
                  <th className="py-3 px-4">Platform Fee (1.5%)</th>
                  <th className="py-3 px-4">Farmer Payout</th>
                  <th className="py-3 px-4">Settlement State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No escrow transactions recorded in database yet.
                    </td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.transactionId}</td>
                      <td className="py-3.5 px-4 font-semibold">{o.orderNumber}</td>
                      <td className="py-3.5 px-4">{o.buyerOrg || o.buyerName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">+₹{o.platformFee.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">₹{o.farmerPayout.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {o.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'ESCROW LOCKED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Analytics Overview Charts (Shown on Overview & Analytics) */}
      {(activeTab === 'overview' || activeTab === 'analytics') && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Gross Merchandise Value (GMV) Growth</h2>
                  <p className="text-xs text-slate-500">Transparent trading volume bypassing commission agents</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  1.5% Platform Tech Fee
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminGmvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                    <Tooltip
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'GMV Transacted']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="gmv" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#adminGmvGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
              <h2 className="text-base font-bold text-slate-900">Volume by Category (Quintals)</h2>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={volumeByCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="volume"
                    >
                      {volumeByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Qtl`, 'Volume']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {volumeByCategoryData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.volume} Qtl</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Stakeholder Onboarding (Farmers vs Buyers)</h2>
                <span className="text-xs font-bold text-slate-500">Month-on-Month KYC Verified</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="farmers" name="Farmers" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="buyers" name="Buyers" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Regional Collection Hubs
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {collectionHubs.map(hub => (
                  <div key={hub.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="truncate">{hub.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        ONLINE
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>{hub.district}, {hub.state}</span>
                      <span className="font-semibold text-slate-800">{hub.currentOccupancyTons}/{hub.capacityTons} T</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                      <span>Temp: {hub.temperatureCelsius}°C</span>
                      <span>Operator: {hub.operatorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
