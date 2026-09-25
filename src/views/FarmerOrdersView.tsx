import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  Building2, 
  ArrowRight, 
  MapPin, 
  Download, 
  Search, 
  Filter,
  ArrowLeft,
  Bot,
  Phone,
  CheckCircle2,
  BadgePercent,
  Boxes,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { RouteTripTracker } from '../components/RouteTripTracker';

export const FarmerOrdersView: React.FC = () => {
  const { 
    currentUser,
    orders, 
    bulkDemands,
    isFarmerOrder,
    updateOrderStage,
    setActiveTab, 
    setActiveTrackingOrderId, 
    navigateBack 
  } = useAgri();

  const [filterStage, setFilterStage] = useState<'all' | 'order_placed' | 'in_transit' | 'collected_at_hub' | 'delivered'>('all');
  const [search, setSearch] = useState('');

  const myOrders = orders.filter(o => isFarmerOrder(o, currentUser));

  const newOrdersCount = myOrders.filter(o => o.currentStage === 'order_placed').length;

  const filteredOrders = myOrders.filter(order => {
    if (filterStage !== 'all' && order.currentStage !== filterStage) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.cropName.toLowerCase().includes(q) ||
        order.buyerName.toLowerCase().includes(q) ||
        order.transactionId.toLowerCase().includes(q) ||
        (order.dispatchDetails && order.dispatchDetails.vehicleNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={navigateBack}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              <span>Received Buyer Orders</span>
              {newOrdersCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black animate-pulse">
                  {newOrdersCount} NEW
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Direct procurement orders placed on your verified produce listings • Transport paid 100% by buyer
            </p>
          </div>
        </div>
      </div>

      {/* ⚡ Institutional Bulk Demands & Pooled Orders Highlight */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                ⚡ 4-Month Advance Contracts
              </span>
              <span className="text-xs font-semibold text-emerald-200">
                {bulkDemands.length} Live Bulk Demands Open
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black">
              Institutional Bulk Orders (थोक खरीदार मांग पूल)
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Large institutional buyers (like Prashant, ITC) have pre-funded 100% Escrow for bulk procurement. Open directly to accept tonnage!
            </p>
          </div>

          <button
            onClick={() => setActiveTab('bulk_pooling')}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Boxes className="w-4 h-4" />
            <span>Open Bulk Pooling Bay ({bulkDemands.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {bulkDemands.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 relative z-10">
            {bulkDemands.map(pool => (
              <div 
                key={pool.id}
                onClick={() => setActiveTab('bulk_pooling')}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">
                      {pool.demandNumber}
                    </span>
                    <span className="text-xs font-black text-emerald-300">
                      {pool.cropName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    ₹{pool.pricePerTon.toLocaleString('en-IN')}/Ton • Target: {pool.targetQuantityTons}T • 🏢 {pool.buyerOrg || pool.buyerName}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">
                    📍 {pool.deliveryCity}, {pool.deliveryState} • Quota: {pool.committedQuantityTons}/{pool.targetQuantityTons}T
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-sm"
                >
                  Accept & Supply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-soft">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStage('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStage === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({myOrders.length})
          </button>
          <button
            onClick={() => setFilterStage('order_placed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStage === 'order_placed' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : newOrdersCount > 0 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {newOrdersCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>}
            <span>New Orders ({newOrdersCount})</span>
          </button>
          <button
            onClick={() => setFilterStage('collected_at_hub')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStage === 'collected_at_hub' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            At Hub ({myOrders.filter(o => o.currentStage === 'collected_at_hub' || o.currentStage === 'quality_verified').length})
          </button>
          <button
            onClick={() => setFilterStage('in_transit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStage === 'in_transit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            In Transit ({myOrders.filter(o => o.currentStage === 'in_transit').length})
          </button>
          <button
            onClick={() => setFilterStage('delivered')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStage === 'delivered' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Delivered & Paid ({myOrders.filter(o => o.currentStage === 'delivered').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search crop, order #, truck..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Orders in this Status</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When buyers purchase your listed produce lots, the dispatch and payout orders will appear here.
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft hover:shadow-card transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    order.currentStage === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.currentStage === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.currentStage.replace(/_/g, ' ').toUpperCase()}
                  </span>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    order.paymentStatus === 'disbursed_to_farmer'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {order.paymentStatus === 'disbursed_to_farmer' ? 'PAID OUT' : 'ESCROW SECURED'}
                  </span>
                </div>
              </div>

              {order.currentStage === 'order_placed' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <div>
                      <span className="font-extrabold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>🎉 New Order Received!</span>
                        <span className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 text-xs font-mono">₹{order.farmerPayout.toLocaleString('en-IN')} Escrow-Secured</span>
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Assigned Driver: <strong>{order.dispatchDetails?.driverName || 'Prakash Shinde'}</strong> ({order.dispatchDetails?.vehicleNo || 'MH-15-EG-4401'}) is allocated for pickup.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => updateOrderStage(order.id, 'collected_at_hub')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Handover / Dispatch to Hub</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Crop Details</span>
                  <h4 className="font-bold text-slate-900 text-base">{order.cropName}</h4>
                  <p className="text-xs text-slate-600">{order.variety}</p>
                  <p className="text-xs font-bold text-slate-800">{order.quantity} {order.unit} @ ₹{order.pricePerUnit}/{order.unit.slice(0, -1)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyer Entity</span>
                  <h4 className="font-bold text-slate-900 text-sm">{order.buyerOrg || order.buyerName}</h4>
                  <p className="text-xs text-slate-500">{order.deliveryAddress}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Collection Hub</span>
                  <div className="flex items-start gap-1.5 text-xs text-slate-700 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{order.collectionHubName}</span>
                  </div>
                  {order.qualityInspection && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      QC Certified: {order.qualityInspection.assignedGrade}
                    </span>
                  )}
                </div>

                {/* Farmer Net Realization & Zero Transport Cost Highlight */}
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex flex-col justify-between space-y-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Net Farmer Payout</span>
                    <h3 className="text-lg font-extrabold text-emerald-700">₹{order.farmerPayout.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className="text-[10px] text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-emerald-200/50">
                    <span>🚚 Transport: </span>
                    <strong className="text-emerald-700">₹0 (Paid by Buyer)</strong>
                  </div>
                </div>
              </div>

              {/* 🤖 AI Assigned Truck Pickup Notice */}
              {order.dispatchDetails && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">
                        AI Dispatched Truck: {order.dispatchDetails.vehicleNo} ({order.dispatchDetails.modelName || order.dispatchDetails.vehicleType})
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Assigned Driver: <strong>{order.dispatchDetails.driverName}</strong> • <a href={`tel:${order.dispatchDetails.driverPhone}`} className="text-emerald-700 hover:underline font-mono">📞 {order.dispatchDetails.driverPhone}</a>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                    100% Direct Farmgate / Hub Pickup
                  </span>
                </div>
              )}

              {/* In-Transit Mini Highway Progress Bar with Truck Symbol */}
              {order.currentStage === 'in_transit' && (
                <div className="pt-2">
                  <RouteTripTracker order={order} compact={true} showControls={false} />
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est. Delivery: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => {
                    setActiveTrackingOrderId(order.id);
                    setActiveTab('track_delivery');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Full Supply Chain Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
