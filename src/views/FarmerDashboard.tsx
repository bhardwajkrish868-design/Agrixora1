import React from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  Sprout, 
  ShoppingBag, 
  Wallet, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  ChevronRight, 
  MapPin, 
  Calendar,
  Sparkles,
  Award,
  Package,
  Truck,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const FarmerDashboard: React.FC = () => {
  const { 
    currentUser, 
    listings, 
    orders, 
    bulkDemands,
    mandiPrices, 
    setActiveTab, 
    setSelectedListingModal,
    setActiveTrackingOrderId 
  } = useAgri();

  const myListings = listings.filter(l => l.farmerId === currentUser.id);
  const myOrders = orders.filter(o => o.farmerId === currentUser.id);
  
  const totalProduceListed = myListings.reduce((sum, l) => sum + l.quantity, 0);
  const activeOrdersCount = myOrders.filter(o => o.currentStage !== 'delivered').length;
  const totalEarnings = myOrders.filter(o => o.paymentStatus === 'disbursed_to_farmer').reduce((sum, o) => sum + o.farmerPayout, 0);
  const pendingEscrowPayout = myOrders.filter(o => o.paymentStatus === 'escrow_locked').reduce((sum, o) => sum + o.farmerPayout, 0);

  const earningsChartData = [
    { month: 'Apr', earnings: 145000 },
    { month: 'May', earnings: 210000 },
    { month: 'Jun', earnings: 185000 },
    { month: 'Jul', earnings: 320000 },
    { month: 'Aug', earnings: 460688 },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Verified Progressive Farmer
              </span>
              <span className="text-xs text-emerald-200">Kisan ID: MH-NSK-2024-8819</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Namaste, {currentUser.name}! 🌾
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Direct marketplace access is live. You have saved <span className="font-bold text-white">~₹28,400</span> in intermediary commission this season with guaranteed escrow payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('add_produce')}
              className="px-5 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>List New Harvest</span>
            </button>

            <button
              onClick={() => setActiveTab('market_prices')}
              className="px-4 py-3 rounded-2xl bg-emerald-900/40 border border-white/20 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-900/60 transition-all flex items-center gap-2 backdrop-blur-xs"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>Check APMC Rates</span>
            </button>
          </div>
        </div>
        <Sprout className="absolute -right-8 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Produce Listed"
          value={`${totalProduceListed} Qtl`}
          subtitle={`${myListings.length} Active Crop Lots`}
          icon={Sprout}
          trend={{ value: '18%', isPositive: true }}
          colorScheme="emerald"
          onClick={() => setActiveTab('my_listings')}
        />
        <StatCard
          title="Active Orders"
          value={activeOrdersCount}
          subtitle="In Transit / Hub Verification"
          icon={ShoppingBag}
          colorScheme="blue"
          onClick={() => setActiveTab('orders')}
        />
        <StatCard
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString('en-IN')}`}
          subtitle="Settled Directly to Bank"
          icon={Wallet}
          trend={{ value: '24%', isPositive: true }}
          colorScheme="amber"
          onClick={() => setActiveTab('earnings')}
        />
        <StatCard
          title="Pending Escrow"
          value={`₹${pendingEscrowPayout.toLocaleString('en-IN')}`}
          subtitle="Locked in Secure Escrow"
          icon={Clock}
          colorScheme="purple"
          onClick={() => setActiveTab('orders')}
        />
      </div>

      {/* 📥 4-Month Advance Corporate Bulk Orders Callout & Opportunities */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-500/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] tracking-wider uppercase border border-emerald-400/20">
                  📥 4-Month Advance Corporate Orders
                </span>
                <span className="text-xs text-amber-300 font-bold">● Guaranteed Future Buyback</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold mt-1">
                Receive Advance Bulk Contracts (ITC, Reliance, BigBasket 500T+)
              </h3>
              <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
                कंपनियां 4 महीने पहले फसल का भाव और आर्डर लॉक करती हैं। आप अपनी आगामी फसल की मात्रा (10T, 25T, 50T) दर्ज करके 100% एस्क्रो गारंटी प्राप्त करें।
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('bulk_pooling')}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            <span>📥 Receive Bulk Orders (आर्डर स्वीकारें)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Open Demands Mini Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs">
          {bulkDemands.slice(0, 3).map(pool => (
            <div 
              key={pool.id}
              onClick={() => setActiveTab('bulk_pooling')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-300 truncate max-w-[150px]">{pool.buyerOrg || pool.buyerName}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold font-mono">
                  ₹{pool.pricePerTon.toLocaleString('en-IN')}/T
                </span>
              </div>
              <div className="font-bold text-white text-sm">
                {pool.targetQuantityTons}T {pool.cropName}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>Dispatch: <strong>{pool.expectedDispatchStart}</strong></span>
                <span className="text-emerald-400 font-bold">Accept 10T–50T →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📍 10 KM Hyper-Local Auto-Connect Strip for Farmer */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-400/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <MapPin className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] tracking-wider uppercase border border-emerald-400/20">
                10 KM Hyper-Local Auto-Connect (10 किमी स्वतः कनेक्ट)
              </span>
              <span className="text-xs text-amber-300 font-bold">● Live GPS Active</span>
            </div>
            <h3 className="text-base font-extrabold mt-0.5 text-white">
              Nearby Local Buyers & Quality Hubs Within 10 KM
            </h3>
            <p className="text-slate-300 text-xs max-w-xl">
              फसल लिस्ट करते ही 10 किमी के भीतर के सभी नजदीकी खरीदार, FPO और कलेक्शन हब तुरंत खुद कनेक्ट हो जाते हैं। जीरो ट्रांसपोर्ट वेस्टेज।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('add_produce')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List & Auto-Connect (फसल बेचें)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Mandi Benchmark vs Recommended Selling Price
                </h2>
                <p className="text-xs text-slate-500">Live price intelligence powered by eNAM & APMC feeds</p>
              </div>
              <button
                onClick={() => setActiveTab('market_prices')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                View all mandis <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {mandiPrices.slice(0, 4).map((crop) => (
                <div 
                  key={crop.cropName}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{crop.cropName}</h4>
                      <p className="text-xs text-slate-500">{crop.mandiName}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      crop.change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {crop.change >= 0 ? '▲ +' : '▼ '}{crop.changePercent}%
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Current Modal:</span>
                      <span className="font-bold text-slate-900 text-sm">₹{crop.currentPrice}/Q</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">AI Target Price:</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{crop.recommendedFarmerSellingPrice}/Q</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Direct Farmer Payouts Growth</h2>
                <p className="text-xs text-slate-500">Monthly net revenue received without middlemen deductions</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                +100% Escrow Protected
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="farmerEarningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Net Payout']}
                    contentStyle={{ backgroundColor: '#064e3b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#farmerEarningsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">My Active Lots</h2>
              <button
                onClick={() => setActiveTab('my_listings')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View all ({myListings.length})
              </button>
            </div>

            <div className="space-y-3">
              {myListings.length === 0 ? (
                <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">No produce listed yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">List your harvested crops to start receiving direct buyer orders.</p>
                </div>
              ) : (
                myListings.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListingModal(item)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 bg-slate-50/50"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.cropName}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.cropName}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          {item.qualityGrade}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.variety} • {item.quantity} {item.unit || 'Quintals'}</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">₹{item.pricePerUnit}/{(item.unit || 'Quintals').slice(0, -1)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setActiveTab('add_produce')}
              className="w-full mt-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Another Crop</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Dispatches</h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                All Orders ({myOrders.length})
              </button>
            </div>

            <div className="space-y-3">
              {myOrders.length === 0 ? (
                <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">No orders received yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Orders placed by verified buyers will appear here with live tracking.</p>
                </div>
              ) : (
                myOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setActiveTrackingOrderId(order.id);
                      setActiveTab('track_delivery');
                    }}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-800">{order.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.currentStage === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.currentStage === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.currentStage.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">
                      {order.cropName} ({order.quantity} {order.unit})
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Buyer: {order.buyerOrg || order.buyerName}</span>
                      <span className="font-bold text-emerald-700">₹{order.farmerPayout.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
