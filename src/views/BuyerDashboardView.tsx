import React from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  ShoppingBag, 
  Store, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Boxes,
  Thermometer,
  Layers,
  ChevronRight
} from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const BuyerDashboardView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    listings, 
    bulkDemands,
    setActiveTab, 
    setActiveTrackingOrderId, 
    setSelectedListingModal 
  } = useAgri();

  const myBuyerOrders = orders.filter(o => o.buyerId === currentUser.id);
  const activeOrders = myBuyerOrders.filter(o => o.currentStage !== 'delivered');
  const deliveredOrders = myBuyerOrders.filter(o => o.currentStage === 'delivered');
  const inTransitOrders = myBuyerOrders.filter(o => o.currentStage === 'in_transit');
  
  const totalSpend = myBuyerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const escrowLocked = myBuyerOrders.filter(o => o.paymentStatus === 'escrow_locked').reduce((sum, o) => sum + o.totalAmount, 0);
  
  const featuredListings = listings.filter(l => l.status === 'Active').slice(0, 4);

  const categories = [
    { name: 'Vegetables', count: listings.filter(l => l.category === 'Vegetables').length, icon: '🥦', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { name: 'Cereals & Grains', count: listings.filter(l => l.category === 'Cereals & Grains').length, icon: '🌾', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'Fruits', count: listings.filter(l => l.category === 'Fruits').length, icon: '🍎', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    { name: 'Pulses', count: listings.filter(l => l.category === 'Pulses').length, icon: '🫘', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { name: 'Oilseeds', count: listings.filter(l => l.category === 'Oilseeds').length, icon: '🌻', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { name: 'Spices', count: listings.filter(l => l.category === 'Spices').length, icon: '🌶️', color: 'bg-orange-50 text-orange-800 border-orange-200' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Verified Institutional Bulk Buyer
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                4-Month Advance Procurement Model
              </span>
              <span className="text-xs text-slate-300">GSTIN: 27AABCA1234F1Z9</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              4-Month Advance Bulk Procurement Hub
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Place corporate bulk demands (50T – 500T+) with 4 months advance notice for pre-harvest farmer aggregation. Buyer pays 100% transport fee in advance into Escrow with zero farmer deduction and automated AI truck dispatch.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('bulk_pooling')}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer border border-indigo-400/30"
            >
              <Boxes className="w-4 h-4 text-amber-300" />
              <span>+ Create 4-Mo Bulk Demand</span>
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Direct Lots</span>
            </button>
            <button
              onClick={() => setActiveTab('track_delivery')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>AI Fleet Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Procurements"
          value={activeOrders.length}
          subtitle={inTransitOrders.length + ' in cold transit fleet'}
          icon={ShoppingBag}
          colorScheme="blue"
          onClick={() => setActiveTab('my_orders')}
        />

        <StatCard
          title="Locked in Escrow"
          value={'₹' + escrowLocked.toLocaleString('en-IN')}
          subtitle="Released upon physical intake"
          icon={CreditCard}
          colorScheme="amber"
          onClick={() => setActiveTab('payments')}
        />

        <StatCard
          title="Total Procured (FY26)"
          value={'₹' + totalSpend.toLocaleString('en-IN')}
          subtitle="Zero middleman commission"
          icon={TrendingUp}
          trend={{ value: '22.8%', isPositive: true }}
          colorScheme="emerald"
          onClick={() => setActiveTab('payments')}
        />

        <StatCard
          title="Completed Deliveries"
          value={deliveredOrders.length}
          subtitle="100% On-Time SLA Record"
          icon={CheckCircle2}
          colorScheme="purple"
          onClick={() => setActiveTab('my_orders')}
        />
      </div>

      {/* ⚡ 4-Month Advance Corporate Bulk Demands & Pools Showcase */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase border border-indigo-400/30">
                ⚡ 4-Month Advance Corporate Procurement
              </span>
              <span className="text-xs text-emerald-400 font-bold">● 100% Buyer-Paid Transport Escrow</span>
            </div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-400" />
              Active 4-Month Advance Corporate Demands (50T – 500T+)
            </h2>
            <p className="text-xs text-slate-300">
              Contract farmers 120 days prior to harvest. Guaranteed crop volume, pre-set purchase prices, and automated AI truck dispatch to collection hubs.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('bulk_pooling')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-all hover:scale-105"
          >
            <span>Launch New 4-Mo Demand</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {bulkDemands.slice(0, 3).map(pool => {
            const fillPct = Math.min(100, Math.round((pool.committedQuantityTons / pool.targetQuantityTons) * 100));
            return (
              <div
                key={pool.id}
                onClick={() => setActiveTab('bulk_pooling')}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-semibold">{pool.buyerOrg}</span>
                    <h3 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {pool.cropName} ({pool.variety})
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {fillPct}% Filled
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Target: <strong>{pool.targetQuantityTons} Tons</strong></span>
                    <span>Committed: <strong>{pool.committedQuantityTons} Tons</strong></span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="text-amber-300 font-extrabold">₹{pool.pricePerTon.toLocaleString('en-IN')}/Ton</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    Pickup: {pool.expectedDispatchStart}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Category Procurement Navigator */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              Direct Farmgate Crop Categories
            </h2>
            <p className="text-xs text-slate-500">Instant access to verified farm lots sorted by harvest date</p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All {listings.length} Lots</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveTab('marketplace')}
              className={'p-3.5 rounded-2xl border ' + cat.color + ' hover:shadow-md transition-all text-left flex flex-col justify-between'}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <div>
                <strong className="text-xs font-bold block truncate">{cat.name}</strong>
                <span className="text-[10px] opacity-80">{cat.count} Lots Ready</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Active Consignments & Telemetry Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Active Consignments in Transit & QC
            </h2>
            <button
              onClick={() => setActiveTab('my_orders')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              All Orders ({myBuyerOrders.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {myBuyerOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">No active consignments</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Explore the marketplace to procure verified farm produce.</p>
              </div>
            ) : (
              myBuyerOrders.slice(0, 3).map(order => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                      <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (
                        order.currentStage === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.currentStage === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                      )}>
                        {order.currentStage.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {order.cropName} ({order.quantity} {order.unit})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Origin: {order.farmerName}, {order.farmerLocation}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Escrow Value</span>
                      <strong className="text-sm font-extrabold text-emerald-700">₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTrackingOrderId(order.id);
                        setActiveTab('track_delivery');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Track GPS</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Cold Telemetry Widget */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Sensor Feed
              </span>
              <span className="text-xs text-slate-400 font-mono">ORD-2026-9812</span>
            </div>

            <h3 className="text-lg font-bold">Nashik Red Onion (Garwa)</h3>
            <p className="text-xs text-slate-400">Reefer Truck MH-15-EG-4401 en route to Navi Mumbai Hub</p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Chamber Temp</span>
                <strong className="text-base font-extrabold text-emerald-400 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" /> 19.5 °C
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">GPS Speed</span>
                <strong className="text-base font-extrabold text-blue-400">42 km/h</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTrackingOrderId('ORD-2026-9812');
              setActiveTab('track_delivery');
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>Open Full Interactive Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured Farmgate Lots on Sale */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Featured Farmgate Harvests Available Today
            </h2>
            <p className="text-xs text-slate-500">100% Quality Inspected & Cured at Collection Centers</p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Browse All Crops →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredListings.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Store className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">No produce lots available in marketplace currently</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Newly listed harvests by registered farmers will automatically appear here.</p>
            </div>
          ) : (
            featuredListings.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="h-32 rounded-xl overflow-hidden bg-slate-200 relative">
                    <img
                      src={item.images[0]}
                      alt={item.cropName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[9px] font-bold">
                      {item.qualityGrade}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.cropName}</h4>
                    <p className="text-[11px] text-slate-500">{item.farmerName} • {item.farmerLocation || item.location || 'India'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="font-extrabold text-sm text-emerald-700">₹{item.pricePerUnit}/{(item.unit || 'Quintals').slice(0, -1)}</span>
                  <button
                    onClick={() => setSelectedListingModal(item)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs"
                  >
                    Buy Lot
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
