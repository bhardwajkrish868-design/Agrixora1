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
  BadgePercent
} from 'lucide-react';
import { RouteTripTracker } from '../components/RouteTripTracker';

export const FarmerOrdersView: React.FC = () => {
  const { 
    currentUser,
    orders, 
    setActiveTab, 
    setActiveTrackingOrderId, 
    navigateBack 
  } = useAgri();

  const [filterStage, setFilterStage] = useState<'all' | 'in_transit' | 'collected_at_hub' | 'delivered'>('all');
  const [search, setSearch] = useState('');

  const myOrders = orders.filter(o => o.farmerId === currentUser.id);

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
            </h1>
            <p className="text-xs text-slate-500">
              Direct procurement orders placed on your verified produce listings • Transport paid 100% by buyer
            </p>
          </div>
        </div>
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
            onClick={() => setFilterStage('in_transit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStage === 'in_transit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            In Transit ({myOrders.filter(o => o.currentStage === 'in_transit').length})
          </button>
          <button
            onClick={() => setFilterStage('collected_at_hub')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStage === 'collected_at_hub' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            At Hub ({myOrders.filter(o => o.currentStage === 'collected_at_hub' || o.currentStage === 'quality_verified').length})
          </button>
          <button
            onClick={() => setFilterStage('delivered')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStage === 'delivered' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Delivered ({myOrders.filter(o => o.currentStage === 'delivered').length})
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
