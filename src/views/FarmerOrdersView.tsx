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
  Sparkles,
  QrCode,
  Printer,
  Trash2,
  X
} from 'lucide-react';
import { RouteTripTracker } from '../components/RouteTripTracker';

export const FarmerOrdersView: React.FC = () => {
  const { 
    currentUser,
    orders, 
    bulkDemands,
    isFarmerOrder,
    updateOrderStage,
    deleteOrder,
    activeRole,
    setActiveTab, 
    setActiveTrackingOrderId, 
    navigateBack,
    language
  } = useAgri();

  const [filterStage, setFilterStage] = useState<'all' | 'order_placed' | 'in_transit' | 'collected_at_hub' | 'delivered'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrderGatePass, setSelectedOrderGatePass] = useState<any | null>(null);
  const isAdmin = activeRole === 'admin' || currentUser?.role === 'admin';

  const myOrders = orders.filter(o => isFarmerOrder(o, currentUser));

  const newOrdersCount = myOrders.filter(o => o.currentStage === 'order_placed').length;

  const filteredOrders = myOrders.filter(order => {
    if (filterStage !== 'all' && order.currentStage !== filterStage) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        (order.orderNumber || '').toLowerCase().includes(q) ||
        (order.cropName || '').toLowerCase().includes(q) ||
        (order.buyerName || '').toLowerCase().includes(q) ||
        (order.transactionId || '').toLowerCase().includes(q) ||
        (order.dispatchDetails && (order.dispatchDetails.vehicleNo || '').toLowerCase().includes(q))
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
                    ₹{(pool.pricePerTon || 0).toLocaleString('en-IN')}/Ton • Target: {pool.targetQuantityTons || 0}T • 🏢 {pool.buyerOrg || pool.buyerName || 'Corporate Buyer'}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">
                    📍 {pool.deliveryCity || 'Hub'}, {pool.deliveryState || 'State'} • Quota: {pool.committedQuantityTons || 0}/{pool.targetQuantityTons || 0}T
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
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                      <div>
                        <span className="font-extrabold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                          <span>🎉 {language === 'hi' ? 'नया ऑर्डर प्राप्त हुआ!' : 'New Order Received!'}</span>
                          <span className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 text-xs font-mono font-bold">
                            ₹{order.farmerPayout.toLocaleString('en-IN')} {language === 'hi' ? 'एस्क्रो सुरक्षित' : 'Escrow Secured'}
                          </span>
                        </span>
                        <p className="text-[11px] text-amber-900 mt-0.5">
                          {language === 'hi'
                            ? `उपज: ${order.quantity} ${order.unit} ${order.cropName} • खरीददार: ${order.buyerOrg || order.buyerName}`
                            : `Produce: ${order.quantity} ${order.unit} ${order.cropName} • Buyer: ${order.buyerOrg || order.buyerName}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderGatePass(order)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'hi' ? 'डिजिटल गेट पास' : 'Gate Pass E-Slip'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateOrderStage(order.id, 'collected_at_hub')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'हैंडओवर / हब डिस्पैच पुष्टि' : 'Confirm Handover to Hub'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2 Ways to Dispatch this Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 flex items-start gap-2">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block text-[11px]">
                          {language === 'hi' ? 'विकल्प 1: फार्मगेट पिकअप (₹0)' : 'Option 1: Farmgate Pickup (₹0)'}
                        </strong>
                        <span className="text-[11px] text-slate-600">
                          {order.dispatchDetails?.driverName 
                            ? `चालक ${order.dispatchDetails.driverName} (${order.dispatchDetails.vehicleNo}) आपके खेत पर वजन हेतु आएगा। 📞 ${order.dispatchDetails.driverPhone}`
                            : 'प्लेटफ़ॉर्म रीफर ट्रक आपके खेत पर आकर डिजिटल कांटे से वजन करेगा।'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block text-[11px]">
                          {language === 'hi' ? 'विकल्प 2: स्वयं हब पर ले जाएं' : 'Option 2: Direct Hub Self-Drop'}
                        </strong>
                        <span className="text-[11px] text-slate-600">
                          नजदीकी <strong>{order.collectionHubName}</strong> पर डिजिटल गेट पास दिखाकर सीधे कांटे पर वजन कराएं।
                        </span>
                      </div>
                    </div>
                  </div>
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

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = typeof window !== 'undefined' && window.confirm
                          ? window.confirm(language === 'hi' 
                              ? `क्या आप वाकई ऑर्डर #${order.orderNumber} (${order.cropName}) को डेटाबेस से स्थायी रूप से हटाना चाहते हैं? यह वापस नहीं लाया जा सकता।` 
                              : `Are you sure you want to permanently delete order #${order.orderNumber} (${order.cropName}) as Admin? This cannot be undone.`)
                          : true;
                        if (confirmed) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={language === 'hi' ? "ऑर्डर हटाएं (Admin)" : "Delete Order (Admin)"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'हटाएं (Admin)' : 'Delete (Admin)'}</span>
                    </button>
                  )}

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
            </div>
          ))
        )}
      </div>

      {/* 🎫 MODAL: Order-Specific Digital Gate Pass Slip */}
      {selectedOrderGatePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {language === 'hi' ? 'डिजिटल गेट पास व वे-ब्रिज पर्ची' : 'Digital Gate Intake E-Pass'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Order #{selectedOrderGatePass.orderNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderGatePass(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-500 space-y-4 text-slate-900" id="order-gate-pass">
              <div className="text-center pb-3 border-b border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  FOOD CORPORATION OF INDIA & AGRIXORA AGRI-DIRECT
                </span>
                <h4 className="text-base font-black text-emerald-800 tracking-tight">
                  DIGITAL GATE INTAKE & WEIGHBRIDGE PASS
                </h4>
                <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                  ✓ PRIORITY GREEN CHANNEL ENTRY GRANTED
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-center sm:text-left space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Gate Pass Token ID</span>
                  <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
                    GATE-FCI-{selectedOrderGatePass.orderNumber.replace(/\D/g, '').slice(-6) || '884920'}
                  </span>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Order Ref: {selectedOrderGatePass.orderNumber}
                  </p>
                </div>

                <div className="p-2 bg-slate-900 rounded-xl text-white flex flex-col items-center justify-center shadow-xs shrink-0">
                  <QrCode className="w-16 h-16 text-emerald-400" />
                  <span className="text-[8px] font-mono text-slate-300 mt-0.5">SCAN AT ENTRY</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Farmer Name</span>
                  <strong className="text-slate-900">{selectedOrderGatePass.farmerName}</strong>
                  <span className="text-slate-500 block text-[10px]">{selectedOrderGatePass.farmerPhone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Hub</span>
                  <strong className="text-slate-900 truncate block">{selectedOrderGatePass.collectionHubName}</strong>
                  <span className="text-slate-500 block text-[10px] truncate">{selectedOrderGatePass.collectionHubAddress}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Produce & Volume</span>
                  <strong className="text-slate-900">{selectedOrderGatePass.cropName}</strong>
                  <span className="text-slate-700 block text-[10px] font-bold">{selectedOrderGatePass.quantity} {selectedOrderGatePass.unit}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Allocated Vehicle / Driver</span>
                  <strong className="text-slate-900 font-mono">{selectedOrderGatePass.dispatchDetails?.vehicleNo || 'Tractor Self-Drop'}</strong>
                  <span className="text-slate-500 block text-[10px]">{selectedOrderGatePass.dispatchDetails?.driverName || currentUser?.name}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Weighbridge Bay</span>
                  <strong>BAY #01 (ELECTRONIC PITLESS SCALE)</strong>
                </div>
                <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  ₹{selectedOrderGatePass.farmerPayout.toLocaleString('en-IN')} ESCROW
                </span>
              </div>

              <p className="text-[10px] text-slate-500 text-center italic">
                {language === 'hi'
                  ? 'सुरक्षा गार्ड को यह QR कोड दिखाएं • इलेक्ट्रॉनिक कांटे पर वजन के बाद 2 घंटे में भुगतान सीधे बैंक खाते में।'
                  : 'Show this QR pass at the security gate. Funds released to bank within 2 hours of weighment.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'hi' ? 'प्रिंट / डाउनलोड पर्ची' : 'Print / Download Pass'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderGatePass(null)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
