import React, { useState, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { calculateOrderFees } from '../utils/pricingUtils';
import { calculateDistanceKm, geocodeLocation, getHyperlocalDispatchEstimate } from '../utils/geoUtils';
import { getAILogisticsPreview } from '../utils/aiLogisticsEngine';
import { 
  X, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Award, 
  Truck, 
  Lock, 
  CheckCircle2, 
  ShoppingBag, 
  Building2, 
  Sparkles, 
  Phone,
  Scale,
  Plus,
  Minus,
  CreditCard,
  Check,
  Zap,
  Clock,
  Bot,
  Thermometer,
  FileText,
  BadgePercent
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedListingModal, 
    setSelectedListingModal, 
    currentUser, 
    userLocation,
    vehicles,
    orders,
    placeOrder, 
    setActiveTab,
    setActiveTrackingOrderId 
  } = useAgri();

  const [orderQty, setOrderQty] = useState<number>(50);
  const [deliveryAddress, setDeliveryAddress] = useState('AgroFresh Central Fulfilment Hub, Sector 18, Navi Mumbai, Maharashtra');
  const [pincode, setPincode] = useState('400705');
  const [paymentMethod, setPaymentMethod] = useState('Escrow Bank Transfer / UPI');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderRef, setCreatedOrderRef] = useState('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);

  useEffect(() => {
    if (selectedListingModal) {
      setOrderSuccess(false);
      setIsOrdering(false);
      const initialQty = Math.min(50, selectedListingModal.quantity);
      setOrderQty(initialQty > 0 ? initialQty : 1);
    }
  }, [selectedListingModal]);

  if (!selectedListingModal) return null;

  const item = selectedListingModal;
  const maxAvailable = item.quantity;
  const currentOrderQty = Math.min(Math.max(1, orderQty), maxAvailable);

  const {
    produceAmount,
    platformFee,
    collectionFee,
    logisticsFee,
    logisticsLabel,
    totalPayable,
    farmerPayout,
    effectiveKg
  } = calculateOrderFees(currentOrderQty, item.pricePerUnit, item.unit || 'Quintals');

  const itemLat = item.latitude || geocodeLocation(item.farmerLocation || item.location || '', item.farmerState || item.state || '').lat;
  const itemLng = item.longitude || geocodeLocation(item.farmerLocation || item.location || '', item.farmerState || item.state || '').lng;
  const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, itemLat, itemLng);
  const isHyperlocal = distanceKm <= 10;
  const dispatchEstimate = getHyperlocalDispatchEstimate(distanceKm);

  const isPerishable = 
    item.category === 'Vegetables' || 
    item.category === 'Fruits' || 
    item.cropName.toLowerCase().includes('tomato') || 
    item.cropName.toLowerCase().includes('onion') ||
    item.storageCondition === 'Cold Storage';

  const aiPreview = getAILogisticsPreview(
    effectiveKg,
    item.cropName,
    isPerishable,
    item.farmerLocation || item.location || '',
    vehicles
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);

    setTimeout(() => {
      const newOrder = placeOrder({
        listing: item,
        quantity: currentOrderQty,
        deliveryAddress,
        pincode,
        buyerOrg: currentUser.businessName || currentUser.name,
        paymentMethod
      });
      setLastCreatedOrder(newOrder);
      setCreatedOrderRef(newOrder.orderNumber);
      setIsOrdering(false);
      setOrderSuccess(true);
    }, 600);
  };

  const handleFinishAndTrack = () => {
    setSelectedListingModal(null);
    setOrderSuccess(false);
    setActiveTab('track_delivery');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setSelectedListingModal(null)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 border border-slate-100 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 font-mono">
              {item.id}
            </span>
            <h3 className="font-bold text-base">{item.cropName} ({item.variety})</h3>
          </div>

          <button
            onClick={() => setSelectedListingModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {orderSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                  {createdOrderRef}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Escrow Locked & AI Fleet Auto-Assigned!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  ₹{totalPayable.toLocaleString('en-IN')} is locked securely in Farm2Future Escrow Vault. Buyer paid ₹{logisticsFee} for delivery, which will be disbursed to driver upon successful delivery.
                </p>
              </div>

              {/* 🤖 AI Assigned Fleet Box */}
              {lastCreatedOrder && lastCreatedOrder.dispatchDetails && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl text-left max-w-md mx-auto space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Bot className="w-4 h-4" />
                      AI Auto-Assigned Carrier
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                      {lastCreatedOrder.aiAllocation?.aiMatchScore || 99.2}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vehicle & Model</span>
                      <span className="font-bold text-white font-mono">{lastCreatedOrder.dispatchDetails.vehicleNo}</span>
                      <span className="text-[10px] text-slate-300 block truncate">{lastCreatedOrder.dispatchDetails.modelName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Driver & Contact</span>
                      <span className="font-bold text-white truncate block">{lastCreatedOrder.dispatchDetails.driverName}</span>
                      <span className="text-[10px] text-emerald-300 font-mono block">📞 {lastCreatedOrder.dispatchDetails.driverPhone}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Cold Chamber Temp</span>
                      <span className="font-bold text-emerald-400">{lastCreatedOrder.dispatchDetails.temperatureCelsius}°C Active</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Buyer Delivery Fee</span>
                      <span className="font-bold text-emerald-400">₹{logisticsFee} (Escrowed)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Ordered Produce:</span>
                  <span>{currentOrderQty} {item.unit} {item.cropName} (₹{produceAmount.toLocaleString('en-IN')})</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Delivery Logistics (Paid by Buyer):</span>
                  <span className="text-emerald-800 font-bold">₹{logisticsFee}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Farmer Payout (100% Realization):</span>
                  <span className="text-slate-900 font-bold">₹{farmerPayout.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-900 pt-2 border-t border-emerald-200 text-sm">
                  <span>Total Amount Paid by Buyer:</span>
                  <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleFinishAndTrack}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Open Live GPS Telematics & Highway Tracker</span>
                </button>
                <button
                  onClick={() => setSelectedListingModal(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Product Gallery & Core Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                    <img
                      src={item.images[0]}
                      alt={item.cropName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                        {item.qualityGrade}
                      </span>
                      {item.organicCertified && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                          Organic Certified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Farmer Credibility Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
                        👨‍🌾
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900">{item.farmerName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <p className="text-[11px] text-slate-500">Aadhaar & Land KYC Verified</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-amber-600">★ 4.9 Rating</span>
                      <span className="text-[10px] text-slate-400 block">{item.farmerLocation || item.location || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Specs and Pricing Breakdown */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      {item.category}
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900">{item.cropName}</h2>
                    <p className="text-xs text-slate-500">{item.variety} • Cured & Stored at Farmgate</p>
                  </div>

                  {/* Specifications Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Lot</span>
                      <span className="font-bold text-slate-900 text-sm">{item.quantity} {item.unit || 'Quintals'}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Moisture Content</span>
                      <span className="font-bold text-slate-900 text-sm">{item.moisturePercent}% (Tested)</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Harvest Date</span>
                      <span className="font-bold text-slate-900">{item.harvestDate}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Direct Farm Price</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{item.pricePerUnit.toLocaleString('en-IN')}/{(item.unit || 'Quintals').slice(0, -1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Order Placement Form */}
              <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    Configure Procurement & Escrow
                  </h4>
                  <span className="text-xs text-slate-500">Available: <strong className="text-slate-800">{maxAvailable} {item.unit || 'Quintals'}</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity Stepper & Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Procurement Quantity ({item.unit || 'Quintals'}) *
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, orderQty - 10))}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={maxAvailable}
                        required
                        value={orderQty}
                        onChange={e => setOrderQty(Math.min(maxAvailable, Math.max(1, Number(e.target.value))))}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 text-center focus:ring-2 focus:ring-emerald-500"
                      />

                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.min(maxAvailable, orderQty + 10))}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick percentage buttons */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, Math.round(maxAvailable * 0.25)))}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, Math.round(maxAvailable * 0.5)))}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, Math.round(maxAvailable * 0.75)))}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderQty(maxAvailable)}
                        className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold cursor-pointer"
                      >
                        Full Lot ({maxAvailable})
                      </button>
                    </div>
                  </div>

                  {/* Payment Gateway */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Escrow Gateway *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Escrow Bank Transfer / UPI">Farm2Future Instant UPI / Escrow</option>
                      <option value="NEFT / RTGS Corporate Escrow">NEFT / RTGS Corporate Escrow</option>
                      <option value="Agri-Credit 30-Day Line">Agri-Credit Line (Pre-approved)</option>
                    </select>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      Funds safely held in Escrow until quality intake.
                    </span>
                  </div>

                  {/* Delivery Location */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Buyer Warehouse Destination Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 🤖 AI Logistics & Automated Truck Dispatch Preview Card */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-800/50 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                        <Bot className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white">AI Automated Truck Dispatch</span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                            {aiPreview.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-indigo-200">
                          {aiPreview.modelName} • {aiPreview.perishabilityHandling}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold block">{aiPreview.temperature}</span>
                      <span className="text-[9px] text-slate-400">{aiPreview.carbonSaving}</span>
                    </div>
                  </div>

                  {/* Transparent Buyer Delivery Cost Callout */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span><strong>Delivery Fee (₹{logisticsFee}):</strong> Paid 100% by Buyer</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                      👨‍🌾 Farmer Pays ₹0 Transport
                    </span>
                  </div>
                </div>

                {/* ⚡ 10 KM Hyper-Local Advantage Callout */}
                {isHyperlocal && (
                  <div className="p-3 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 rounded-2xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-950 font-bold">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Zap className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900">10 KM Auto-Connected Farm ({distanceKm <= 0 ? '< 1' : distanceKm} km away)</span>
                        <p className="text-[11px] text-emerald-800 font-medium">{dispatchEstimate.label} • Direct Farmgate Freshness</p>
                      </div>
                    </div>
                    <span className="text-[11px] bg-emerald-600 text-white px-2.5 py-1 rounded-xl font-extrabold shadow-xs shrink-0">
                      ₹{logisticsFee} Delivery
                    </span>
                  </div>
                )}

                {/* Transparent Escrow Breakdown */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Produce Cost ({currentOrderQty} {item.unit || 'Quintals'} × ₹{item.pricePerUnit}):</span>
                    <span className="font-semibold text-slate-900">₹{produceAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Collection Hub Aggregation & QC (1%):</span>
                    <span className="font-semibold text-slate-900">₹{collectionFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200/60">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{logisticsLabel} (Buyer Delivery Fee):</span>
                    </span>
                    <span>₹{logisticsFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Farm2Future Tech Platform Fee (1.5%):</span>
                    <span className="font-semibold text-slate-900">₹{platformFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                    <div>
                      <span>Total Amount Payable (Escrow Locked):</span>
                      <span className="text-[10px] text-slate-500 font-normal block">Produce ₹{produceAmount.toLocaleString('en-IN')} + Delivery ₹{logisticsFee} + Fees</span>
                    </div>
                    <span className="text-base text-emerald-700 font-extrabold">₹{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isOrdering}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isOrdering ? '🤖 AI Assigning Truck & Securing Escrow...' : 'Confirm Order & Lock Escrow (₹' + totalPayable.toLocaleString('en-IN') + ')'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
