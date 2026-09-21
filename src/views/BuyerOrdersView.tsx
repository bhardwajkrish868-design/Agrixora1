import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  FileCheck,
  Download,
  Search,
  Filter,
  ArrowLeft,
  Bot,
  Phone,
  Thermometer,
  Zap,
  Lock
} from 'lucide-react';
import { RouteTripTracker } from '../components/RouteTripTracker';

export const BuyerOrdersView: React.FC = () => {
  const { 
    currentUser,
    orders, 
    setActiveTab, 
    setActiveTrackingOrderId, 
    markOrderDelivered,
    navigateBack
  } = useAgri();

  const [filterStage, setFilterStage] = useState<'all' | 'in_transit' | 'collected_at_hub' | 'delivered'>('all');
  const [search, setSearch] = useState('');

  const myBuyerOrders = orders.filter(o => o.buyerId === currentUser.id);

  const filteredOrders = myBuyerOrders.filter(order => {
    if (filterStage !== 'all' && order.currentStage !== filterStage) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.cropName.toLowerCase().includes(q) ||
        order.farmerName.toLowerCase().includes(q) ||
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
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <span>My Purchase Orders</span>
            </h1>
            <p className="text-xs text-slate-500">
              Live tracking from harvest intake to AI-assigned cold chain transit & escrow disbursement
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            + New Procurement
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-soft">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStage('all')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}
          >
            All Orders ({myBuyerOrders.length})
          </button>
          <button
            onClick={() => setFilterStage('in_transit')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'in_transit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-800 hover:bg-blue-100')}
          >
            In Transit ({myBuyerOrders.filter(o => o.currentStage === 'in_transit').length})
          </button>
          <button
            onClick={() => setFilterStage('collected_at_hub')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'collected_at_hub' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100')}
          >
            At Hub / QC ({myBuyerOrders.filter(o => o.currentStage === 'collected_at_hub' || o.currentStage === 'quality_verified').length})
          </button>
          <button
            onClick={() => setFilterStage('delivered')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'delivered' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100')}
          >
            Delivered ({myBuyerOrders.filter(o => o.currentStage === 'delivered').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search orders, crop, truck plate..."
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
            <h3 className="font-bold text-slate-800 text-base">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any active or past orders matching your criteria.
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
                  <span className="text-xs text-slate-500">Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                  <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">Txn: {order.transactionId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={'text-xs font-bold px-3 py-1 rounded-full ' + (
                    order.currentStage === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.currentStage === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                  )}>
                    {order.currentStage.replace(/_/g, ' ').toUpperCase()}
                  </span>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                    {order.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'ESCROW LOCKED'}
                  </span>
                </div>
              </div>

              {/* Main 4-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Produce Details</span>
                  <h4 className="font-bold text-slate-900 text-base">{order.cropName}</h4>
                  <p className="text-xs text-slate-600">{order.variety}</p>
                  <p className="text-xs font-bold text-slate-800">{order.quantity} {order.unit} @ ₹{order.pricePerUnit}/{order.unit.slice(0, -1)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Origin Farmer</span>
                  <h4 className="font-bold text-slate-900 text-sm">{order.farmerName}</h4>
                  <p className="text-xs text-slate-500">{order.farmerLocation}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aadhaar Verified
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Hub & Lab</span>
                  <div className="flex items-start gap-1.5 text-xs text-slate-700 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{order.collectionHubName}</span>
                  </div>
                  {order.qualityInspection && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Grade: {order.qualityInspection.assignedGrade} (Moisture: {order.qualityInspection.moisturePercent}%)
                    </span>
                  )}
                </div>

                {/* Itemized Payment Breakdown (Buyer Paid Delivery) */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Paid (Escrow)</span>
                      <h3 className="text-base font-extrabold text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</h3>
                    </div>
                    
                    <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] space-y-0.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Produce:</span>
                        <span className="font-semibold text-slate-800">₹{(order.produceAmount || (order.quantity * order.pricePerUnit)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Delivery (Paid by You):</span>
                        <span>₹{order.logisticsFee || 35}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Escrow Safe Payout
                    </span>
                    <span className="text-slate-500 font-bold truncate max-w-[120px]" title={order.paymentMethod}>
                      {order.paymentMethod || 'UPI QR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🤖 AI Auto-Assigned Fleet Card */}
              {order.dispatchDetails && (
                <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shrink-0">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white font-mono">{order.dispatchDetails.vehicleNo}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                          {order.aiAllocation?.aiMatchScore || 99.2}% AI Match
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {order.dispatchDetails.modelName || order.dispatchDetails.vehicleType}
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-200 flex items-center gap-2 mt-0.5">
                        <span>Driver: <strong>{order.dispatchDetails.driverName}</strong></span>
                        <a 
                          href={`tel:${order.dispatchDetails.driverPhone}`} 
                          className="text-emerald-400 hover:underline font-mono font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> {order.dispatchDetails.driverPhone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">Chamber Temp</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {order.dispatchDetails.temperatureCelsius}°C Active
                      </span>
                    </div>

                    <div className="text-left sm:text-right pl-3 border-l border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Delivery Fee</span>
                      <span className="text-xs font-bold text-emerald-400">
                        ₹{order.logisticsFee || 35} Paid
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* In-Transit Mini Highway Progress Bar with Truck Symbol */}
              {order.currentStage === 'in_transit' && (
                <div className="pt-1">
                  <RouteTripTracker order={order} compact={true} showControls={false} />
                </div>
              )}

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est. Delivery: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
                  
                  <button
                    onClick={() => alert('NABL Lab QC Certificate downloaded for ' + order.orderNumber)}
                    className="ml-2 text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>View Lab Certificate</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {order.currentStage !== 'delivered' && (
                    <button
                      onClick={() => {
                        markOrderDelivered(order.id);
                        alert('Consignment ' + order.orderNumber + ' marked as received! Escrow ₹' + order.farmerPayout.toLocaleString('en-IN') + ' released to ' + order.farmerName + ' & delivery fee ₹' + (order.logisticsFee || 35) + ' disbursed to driver.');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Intake & Release Escrow</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTrackingOrderId(order.id);
                      setActiveTab('track_delivery');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Live GPS Telematics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
