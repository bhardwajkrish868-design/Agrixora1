import React from 'react';
import { useAgri } from '../context/AgriContext';
import { OrderStage } from '../types';
import { RouteTripTracker } from '../components/RouteTripTracker';
import { 
  Truck, 
  Sprout, 
  Building2, 
  Warehouse, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  Droplets, 
  Navigation, 
  FileText, 
  QrCode, 
  ArrowRight,
  Sparkles,
  MapPin, 
  RotateCw,
  ArrowLeft,
  FileCheck,
  Bot,
  Zap,
  Leaf,
  BadgePercent
} from 'lucide-react';

export const SupplyChainTracker: React.FC = () => {
  const { 
    orders, 
    activeTrackingOrderId, 
    setActiveTrackingOrderId, 
    updateOrderStage,
    updateTripProgress,
    markOrderDelivered,
    currentUser,
    activeRole,
    navigateBack
  } = useAgri();

  const userTrackableOrders = orders.filter(o => {
    if (activeRole === 'farmer') return o.farmerId === currentUser.id;
    if (activeRole === 'buyer') return o.buyerId === currentUser.id;
    return true; // Hub operator and Govt Admin view all/assigned
  });

  const selectedOrder = userTrackableOrders.find(o => o.id === activeTrackingOrderId) || userTrackableOrders[0];

  if (!selectedOrder) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft space-y-3">
        <Truck className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-800 text-lg">No Active Consignments to Track</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {activeRole === 'farmer' 
            ? 'When buyers place orders on your produce lots, live consignment tracking will appear here.'
            : 'Place an order on the marketplace to watch the transparent supply chain pipeline.'}
        </p>
      </div>
    );
  }

  // Stages pipeline configuration
  const stages: { key: OrderStage; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    { key: 'order_placed', label: 'Farmer Farmgate', icon: Sprout, desc: 'Harvest & Escrow Lock' },
    { key: 'collected_at_hub', label: 'Collection Centre', icon: Building2, desc: 'Weighbridge & Sorting' },
    { key: 'quality_verified', label: 'QC Lab Certified', icon: ShieldCheck, desc: 'Grade & Moisture Tag' },
    { key: 'in_transit', label: 'AI Cold Fleet', icon: Truck, desc: 'GPS & Telemetry Active' },
    { key: 'delivered', label: 'Buyer Intake', icon: Warehouse, desc: 'Escrow Settlement' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === selectedOrder.currentStage);

  // Fast forward demo simulation action
  const handleSimulateNextStage = () => {
    if (selectedOrder.currentStage === 'order_placed') {
      updateOrderStage(selectedOrder.id, 'collected_at_hub');
    } else if (selectedOrder.currentStage === 'collected_at_hub') {
      updateOrderStage(selectedOrder.id, 'quality_verified');
    } else if (selectedOrder.currentStage === 'quality_verified') {
      updateOrderStage(selectedOrder.id, 'in_transit');
    } else if (selectedOrder.currentStage === 'in_transit') {
      markOrderDelivered(selectedOrder.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Consignment Header & Order Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={navigateBack}
              className="mt-1 p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                  {selectedOrder.orderNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOrder.currentStage === 'delivered'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedOrder.currentStage.replace(/_/g, ' ').toUpperCase()}
                </span>
                {selectedOrder.aiAllocation && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-indigo-600" />
                    AI Assigned ({selectedOrder.aiAllocation.aiMatchScore}%)
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                {selectedOrder.cropName} ({selectedOrder.quantity} {selectedOrder.unit})
              </h1>
              <p className="text-xs text-slate-500">
                Farmer: <strong className="text-slate-800">{selectedOrder.farmerName}</strong> • Buyer: <strong className="text-slate-800">{selectedOrder.buyerOrg || selectedOrder.buyerName}</strong> • Delivery: <strong className="text-emerald-700 font-semibold">₹{selectedOrder.logisticsFee || 35} (Paid by Buyer)</strong>
              </p>
            </div>
          </div>

          {/* Consignment Switcher & Demo Advance button */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedOrder.id}
              onChange={e => setActiveTrackingOrderId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-emerald-500"
            >
              {userTrackableOrders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.cropName} ({o.currentStage})
                </option>
              ))}
            </select>

            {selectedOrder.currentStage !== 'delivered' && (
              <button
                onClick={handleSimulateNextStage}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Simulate Next Step</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual 5-Stage Interactive Pipeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-8">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Transparent Supply Chain Lifecycle
          </h2>
          <p className="text-xs text-slate-500">
            Cryptographically sealed checkpoints from seed harvest to final buyer intake with AI fleet telematics
          </p>
        </div>

        {/* Horizontal Stepper (Desktop/Tablet) */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-100 z-0">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (currentStageIndex / (stages.length - 1)) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div 
                  key={stage.key}
                  className={`flex md:flex-col items-center md:text-center p-3 rounded-2xl transition-all ${
                    isCurrent ? 'bg-emerald-50/70 border border-emerald-300 md:border-transparent' : ''
                  }`}
                >
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 mb-0 md:mb-3 mr-3 md:mr-0 transition-all
                    ${isPast 
                      ? 'bg-emerald-600 text-white shadow-emerald-200' 
                      : isCurrent
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }
                  `}>
                    {isPast ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>

                  <div className="text-left md:text-center">
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-emerald-900 font-extrabold' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>
                      {stage.label}
                    </h4>
                    <p className="text-[11px] text-slate-500">{stage.desc}</p>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isPast 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isCurrent
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isPast ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : 'UPCOMING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Route Trip Tracker with Animated Truck Symbol & Covered Km */}
      <RouteTripTracker
        order={selectedOrder}
        onUpdateTripProgress={(km) => updateTripProgress(selectedOrder.id, km)}
        showControls={true}
      />

      {/* Verified Event Timestamp Log, Vehicle Specs & QC Lab Certificate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Transport Specs & Checkpoint Timeline Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* 🤖 AI Assigned Transport & Driver Details Card */}
          {selectedOrder.dispatchDetails && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{selectedOrder.dispatchDetails.transporterName}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                        🤖 AI Auto-Assigned
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedOrder.dispatchDetails.modelName || selectedOrder.dispatchDetails.vehicleType} • eWay Bill: <strong className="font-mono text-emerald-700">{selectedOrder.dispatchDetails.eWayBillNo}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    GPS Telemetry Active
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    Delivery Paid by Buyer (₹{selectedOrder.logisticsFee || 35})
                  </span>
                </div>
              </div>

              {/* AI Rationale & Optimization Badges */}
              {selectedOrder.aiAllocation && selectedOrder.aiAllocation.aiRationale && (
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Route & Vehicle Optimization Rationale
                    </span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                      {selectedOrder.aiAllocation.aiModelUsed}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    {selectedOrder.aiAllocation.aiRationale.map((rationale, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{rationale}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Leaf className="w-3 h-3 text-emerald-400" />
                      Carbon Savings: ~{selectedOrder.aiAllocation.carbonSavedKg} kg CO₂
                    </span>
                    <span className="text-indigo-300">
                      Cost Efficiency: {selectedOrder.aiAllocation.costOptimizedPercent}% Optimized
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Plate Number</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{selectedOrder.dispatchDetails.vehicleNo}</span>
                  {selectedOrder.dispatchDetails.rcNumber && (
                    <span className="text-[10px] text-slate-400 block truncate">{selectedOrder.dispatchDetails.rcNumber}</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-emerald-600" /> Chamber Temp
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {selectedOrder.dispatchDetails.temperatureCelsius}°C
                  </span>
                  <span className="text-[10px] text-slate-400 block">Cold Chain Active</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-600" /> GPS Unit ID
                  </span>
                  <span className="text-xs font-bold text-blue-800 font-mono truncate block">
                    {selectedOrder.dispatchDetails.gpsDeviceId || 'GPS-UNIT-ACTIVE'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">99.4% Signal</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Assigned Driver</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {selectedOrder.dispatchDetails.driverName}
                  </span>
                  <a 
                    href={`tel:${selectedOrder.dispatchDetails.driverPhone}`} 
                    className="text-[11px] text-emerald-700 hover:underline font-mono font-semibold block"
                  >
                    📞 {selectedOrder.dispatchDetails.driverPhone}
                  </a>
                  {selectedOrder.dispatchDetails.driverLicenseNo && (
                    <span className="text-[9px] text-slate-400 block font-mono truncate">
                      DL: {selectedOrder.dispatchDetails.driverLicenseNo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checkpoint Timeline Log */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Verified Event Timestamp Log
            </h3>

            <div className="space-y-4">
              {selectedOrder.trackingSteps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    step.completed
                      ? 'bg-emerald-600 text-white'
                      : step.current
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-200'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                      <span className="text-xs font-medium text-slate-500">{step.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{step.subtitle}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {step.location}
                    </p>

                    {step.details && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                        {step.details.verifiedWeight && (
                          <div><strong>Verified Weight:</strong> {step.details.verifiedWeight}</div>
                        )}
                        {step.details.vehicleNumber && (
                          <div><strong>Assigned Vehicle:</strong> {step.details.vehicleNumber} ({step.details.driverName})</div>
                        )}
                        {step.details.gradeAssigned && (
                          <div><strong>Grade Assigned:</strong> {step.details.gradeAssigned}</div>
                        )}
                        {step.details.digitalSignature && (
                          <div className="font-mono text-[10px] text-slate-500">
                            <strong>Signature:</strong> {step.details.digitalSignature}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quality Inspection Certificate & QR Digital Pass */}
        <div className="space-y-6">
          {/* Quality Inspection Certificate Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                QC Lab Certificate
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                NABL Standard
              </span>
            </div>

            {selectedOrder.qualityInspection ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500">Quality Grade Assigned:</span>
                    <span className="font-extrabold text-emerald-800 text-sm">
                      {selectedOrder.qualityInspection.assignedGrade}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Visual Quality Score:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedOrder.qualityInspection.visualQualityScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Moisture Content:</span>
                    <strong className="text-slate-900">{selectedOrder.qualityInspection.moisturePercent}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Foreign Matter:</span>
                    <strong className="text-slate-900">{selectedOrder.qualityInspection.foreignMatterPercent}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pest / Bug Infestation:</span>
                    <strong className="text-emerald-700">0.0% (Zero)</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <p><strong>Inspector:</strong> {selectedOrder.qualityInspection.inspectorName}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-1">
                    Cert #{selectedOrder.qualityInspection.certificateId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Produce currently awaiting collection centre lab screening.</p>
              </div>
            )}
          </div>

          {/* QR Digital Batch Pass */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900">QR Digital Batch Pass</span>
              <span className="text-[10px] text-slate-400 font-mono">{selectedOrder.orderNumber}</span>
            </div>

            <div className="w-36 h-36 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center border-2 border-dashed border-slate-200 p-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://farm2future.gov.in/verify/${selectedOrder.orderNumber}`}
                alt="Consignment QR"
                className="w-full h-full rounded-lg"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Scan with any smartphone or mandi scanner to verify lab origin & escrow settlement status.
            </p>

            <button
              type="button"
              onClick={() => {
                const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Farm2Future Digital QR Gate Pass</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; background: #f8fafc; color: #0f172a; }
  .pass { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; border: 2px solid #10b981; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
  .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px; margin-bottom: 20px; }
  .badge { display: inline-block; background: #ecfdf5; color: #065f46; font-weight: bold; padding: 4px 12px; border-radius: 999px; font-size: 11px; border: 1px solid #a7f3d0; }
  @media print { body { padding: 0; background: white; } .pass { border: none; box-shadow: none; } }
</style>
</head>
<body>
<div class="pass">
  <div class="header">
    <span class="badge">NATIONAL DIGITAL TRANSIT PERMIT</span>
    <h2 style="margin: 10px 0 4px; color: #065f46;">🌱 Farm2Future Digital Gate Pass</h2>
    <p style="font-size: 12px; color: #64748b; margin: 0;">UIDAI Aadhaar Verified & Mandi QC Authorized Transit Permit</p>
  </div>
  <div class="grid">
    <div><span style="color:#64748b;font-size:11px;display:block;">VEHICLE NO</span><strong>MH-15-EG-4412</strong></div>
    <div><span style="color:#64748b;font-size:11px;display:block;">DRIVER</span><strong>Rameshwar (+91 98231 44512)</strong></div>
    <div><span style="color:#64748b;font-size:11px;display:block;">COMMODITY</span><strong>Nashik Red Onions (Grade A)</strong></div>
    <div><span style="color:#64748b;font-size:11px;display:block;">CONSIGNMENT WEIGHT</span><strong>120 Quintals</strong></div>
    <div><span style="color:#64748b;font-size:11px;display:block;">DISPATCH ORIGIN</span><strong>Nashik APMC Aggregation Hub</strong></div>
    <div><span style="color:#64748b;font-size:11px;display:block;">DELIVERY DESTINATION</span><strong>Mumbai Central Hub</strong></div>
    <div><span style="color:#64748b;font-size:11px;display:block;">ESCROW STATUS</span><strong style="color:#059669;">PROTECTED & VERIFIED</strong></div>
    <div><span style="color:#64748b;font-size:11px;display:block;">PERMIT ID</span><strong>GP-F2F-${Date.now().toString().slice(-6)}</strong></div>
  </div>
  <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
    Valid for green-channel interstate transport under National Digital Agriculture Mission.
  </div>
</div>
</body>
</html>`;
                const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Farm2Future_Digital_Gate_Pass_${Date.now().toString().slice(-6)}.html`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="w-full py-2 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Download Gate Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
