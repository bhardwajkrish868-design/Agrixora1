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
  ArrowRight,
  Store,
  SendHorizontal
} from 'lucide-react';
import { getNearestTargetMandi } from '../data/indiaLocations';
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
    isFarmerOrder,
    isFarmerListing,
    setActiveTab, 
    setSelectedListingModal,
    setActiveTrackingOrderId 
  } = useAgri();

  const myListings = listings.filter(l => isFarmerListing(l, currentUser));
  const myOrders = orders.filter(o => isFarmerOrder(o, currentUser));
  
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
      {/* Clean Compact Greeting Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Namaste, {currentUser.name}! 🌾
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              Verified Farmer
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kisan ID: MH-NSK-2024-8819 • Direct marketplace access with guaranteed escrow payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('add_produce')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Harvest</span>
          </button>
          <button
            onClick={() => setActiveTab('market_prices')}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Check APMC Rates</span>
          </button>
        </div>
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

      {/* 📥 Live Institutional Bulk Procurement Demands (500T+ Mega Pools) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Boxes className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                <span>Direct Bulk Demands & Pooled Orders (थोक मांग पूल)</span>
                {bulkDemands.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black animate-pulse">
                    {bulkDemands.length} LIVE
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Institutional buyers placing 500T+ advance orders with 100% pre-funded Escrow. Supply produce directly to earn guaranteed payouts.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('bulk_pooling')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>View All Bulk Orders ({bulkDemands.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {bulkDemands.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-xs">No Bulk Demand Pools at this moment</h4>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              When institutional buyers (millers, exporters, processors) place large pooled demand contracts, they will appear here live for direct farmer acceptance and supply allocation.
            </p>
            <button
              onClick={() => setActiveTab('bulk_pooling')}
              className="mt-2 px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Bulk Pooling Bay</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bulkDemands.slice(0, 3).map((demand) => {
              const committedPct = Math.min(100, Math.round((demand.committedQuantityTons / demand.targetQuantityTons) * 100));
              const isFull = demand.committedQuantityTons >= demand.targetQuantityTons;
              return (
                <div
                  key={demand.id}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {demand.demandNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFull 
                          ? 'bg-slate-100 text-slate-600' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isFull ? 'Quota Full' : 'Open for Farmers'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{demand.cropName}</h4>
                      <p className="text-[11px] text-slate-500">{demand.variety} • {demand.category}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-800 font-medium block">Price Guaranteed</span>
                        <span className="text-xs font-black text-emerald-700">₹{demand.pricePerTon.toLocaleString('en-IN')}/Ton</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-800 font-medium block">Target Volume</span>
                        <span className="text-xs font-black text-slate-900">{demand.targetQuantityTons} Tons</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                        <span>Committed: {demand.committedQuantityTons}T</span>
                        <span>{committedPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${committedPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span className="truncate">🏢 {demand.buyerOrg || demand.buyerName}</span>
                      <span className="shrink-0 font-medium">📍 {demand.deliveryCity}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('bulk_pooling')}
                    disabled={isFull}
                    className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <SendHorizontal className="w-3.5 h-3.5" />
                    <span>{isFull ? 'Quota Filled' : '📥 Accept & Supply Produce'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
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

            {/* 🎯 Nearest Target APMC Mandi according to location */}
            <div className="mb-4 p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Nearest Target APMC Mandi</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {currentUser.preferredMandi || getNearestTargetMandi(currentUser.state || 'Maharashtra', currentUser.district || 'Nashik')}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300 self-start sm:self-center shadow-xs">
                📍 Matched to {currentUser.district || 'Nashik'}, {currentUser.state || 'Maharashtra'}
              </span>
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
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Orders Received & Dispatches</span>
                {myOrders.filter(o => o.currentStage === 'order_placed').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                    {myOrders.filter(o => o.currentStage === 'order_placed').length} NEW
                  </span>
                )}
              </h2>
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
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      order.currentStage === 'order_placed'
                        ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50 shadow-xs'
                        : 'border-slate-100 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-800">{order.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.currentStage === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.currentStage === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : order.currentStage === 'order_placed'
                              ? 'bg-amber-500 text-white font-extrabold animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.currentStage === 'order_placed' ? 'NEW ORDER RECEIVED' : order.currentStage.replace(/_/g, ' ').toUpperCase()}
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
