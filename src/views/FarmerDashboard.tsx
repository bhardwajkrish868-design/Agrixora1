import React, { useState, useMemo } from 'react';
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
  Mic,
  Store,
  SendHorizontal,
  CheckCircle2,
  Building2,
  QrCode,
  FileText,
  Phone,
  Navigation,
  Printer,
  X,
  Info,
  Warehouse
} from 'lucide-react';
import { findNearestFciHub } from '../utils/geoUtils';
import { getNearestTargetMandi } from '../data/indiaLocations';
import { calculateProduceSummary } from '../utils/unitUtils';
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
    setActiveTrackingOrderId,
    collectionHubs,
    addNotification,
    logActivity,
    language,
    openVoiceAssistant
  } = useAgri();

  const myListings = listings.filter(l => isFarmerListing(l, currentUser));
  const myOrders = orders.filter(o => isFarmerOrder(o, currentUser));
  
  const produceSummary = useMemo(() => {
    return calculateProduceSummary(myListings);
  }, [myListings]);
  const activeOrdersCount = myOrders.filter(o => o.currentStage !== 'delivered').length;
  const totalEarnings = myOrders.filter(o => o.paymentStatus === 'disbursed_to_farmer').reduce((sum, o) => sum + o.farmerPayout, 0);
  const pendingEscrowPayout = myOrders.filter(o => o.paymentStatus === 'escrow_locked').reduce((sum, o) => sum + o.farmerPayout, 0);

  // 📍 Nearest FCI Modern Steel Silo / Aggregation Hub for this farmer
  const nearestHubMatch = useMemo(() => {
    return findNearestFciHub(
      currentUser?.location,
      currentUser?.state,
      currentUser?.district,
      currentUser?.pincode,
      collectionHubs
    );
  }, [currentUser?.location, currentUser?.state, currentUser?.district, currentUser?.pincode, collectionHubs]);

  const nearestHub = nearestHubMatch?.hub || collectionHubs[0];
  const nearestHubDistance = nearestHubMatch?.distanceKm !== undefined ? Number(nearestHubMatch.distanceKm.toFixed(1)) : 8.4;

  // 🎫 Digital Gate Entry E-Slip & Weighbridge Pass Generator State
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [gatePassCrop, setGatePassCrop] = useState(myListings[0]?.cropName || 'Sharbati Wheat (शरबती गेहूँ)');
  const [gatePassQty, setGatePassQty] = useState<number>(myListings[0]?.quantity || 50);
  const [gatePassUnit, setGatePassUnit] = useState<string>(myListings[0]?.unit || 'Quintals');
  const [gatePassVehicleType, setGatePassVehicleType] = useState<string>('Tractor Trolley (ट्रैक्टर ट्रॉली)');
  const [gatePassVehicleNo, setGatePassVehicleNo] = useState<string>(currentUser?.district === 'Ludhiana' ? 'PB-10-TR-4910' : 'MH-15-TR-2024');
  const [gatePassSlot, setGatePassSlot] = useState<string>('Morning: 07:00 AM - 10:00 AM (प्रातः सत्र)');
  const [generatedGatePass, setGeneratedGatePass] = useState<{
    tokenNo: string;
    cropName: string;
    quantity: number;
    unit: string;
    vehicleType: string;
    vehicleNo: string;
    slotTime: string;
    hubName: string;
    hubCode: string;
    hubAddress: string;
    hubDistance: number;
    generatedAt: string;
    farmerName: string;
    farmerPhone: string;
  } | null>(null);

  const handleOpenGatePassModal = () => {
    if (myListings.length > 0) {
      setGatePassCrop(myListings[0].cropName);
      setGatePassQty(myListings[0].quantity);
      setGatePassUnit(myListings[0].unit || 'Quintals');
    }
    setGeneratedGatePass(null);
    setIsGatePassModalOpen(true);
  };

  const handleGenerateGatePass = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenNo = 'GATE-FCI-' + Math.floor(100000 + Math.random() * 900000);
    const pass = {
      tokenNo,
      cropName: gatePassCrop,
      quantity: gatePassQty,
      unit: gatePassUnit,
      vehicleType: gatePassVehicleType,
      vehicleNo: gatePassVehicleNo,
      slotTime: gatePassSlot,
      hubName: nearestHub?.name || 'FCI Modern Steel Silo',
      hubCode: nearestHub?.code || 'FCI-HUB-01',
      hubAddress: nearestHub?.address || 'Industrial Agro Corridor',
      hubDistance: nearestHubDistance,
      generatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      farmerName: currentUser.name || 'Verified Farmer',
      farmerPhone: currentUser.phone || '+91 98000 00000'
    };
    setGeneratedGatePass(pass);

    addNotification({
      recipientRole: 'farmer',
      recipientId: currentUser.id,
      title: `🎫 डिजिटल गेट पास जारी: ${tokenNo}`,
      message: `${gatePassCrop} (${gatePassQty} ${gatePassUnit}) के लिए ${nearestHub.name} का गेट पास तैयार है। ग्रीन चैनल प्राथमिकता प्रवेश मान्य।`,
      type: 'dispatch',
      linkTab: 'overview'
    });

    addNotification({
      recipientRole: 'collection_centre',
      title: `🚜 किसान आगमन पर्ची: ${tokenNo}`,
      message: `${currentUser.name} (${gatePassVehicleNo}) द्वारा ${gatePassQty} ${gatePassUnit} ${gatePassCrop} की हब डिलीवरी निर्धारित।`,
      type: 'dispatch',
      linkTab: 'incoming'
    });

    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'farmer',
      actionType: 'dispatch',
      title: `Generated Hub Gate Pass (${tokenNo})`,
      description: `Generated self-drop gate entry pass for ${gatePassQty} ${gatePassUnit} ${gatePassCrop} at ${nearestHub.name}.`
    });
  };

  const earningsChartData = [
    { month: 'Apr', earnings: 145000 },
    { month: 'May', earnings: 210000 },
    { month: 'Jun', earnings: 185000 },
    { month: 'Jul', earnings: 320000 },
    { month: 'Aug', earnings: 460688 },
  ];

  return (
    <div className="space-y-6">
      {/* Clean Compact Greeting Card with Profile Photo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('profile')}
            className="relative shrink-0 cursor-pointer group"
            title="View Profile Details / अपनी प्रोफ़ाइल देखें"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md border-2 border-emerald-400 group-hover:scale-105 transition-transform"
            />
            {currentUser.verified && (
              <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-emerald-600 text-white rounded-full shadow-xs border-2 border-white" title="Verified Farmer">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                Namaste, {currentUser.name}! 🌾
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                Verified Farmer
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Kisan ID: MH-NSK-2024-8819 • 📍 {currentUser.district || 'Nashik'}, {currentUser.state || 'Maharashtra'} • Guaranteed escrow payouts.
            </p>
          </div>
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

      {/* 🌟 DUAL HERO FEATURE BANNERS (Kisan Voice AI + Live GPS Reefer) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 🎙️ 1. Kisan AI Voice Assistant Banner */}
        <div 
          onClick={() => openVoiceAssistant()}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-xl transition-all border border-emerald-500/40 group relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-300/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-emerald-900/50">
              <Mic className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                  {language === 'hi' ? '🎙️ कृषि वाणी AI सहायक' : '🎙️ Kisan AI Voice Assistant'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  VOICE AI
                </span>
              </div>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                {language === 'hi'
                  ? 'बोलकर पूछें: आज का मंडी भाव, 3-दिन का मौसम, फसल रोग व सरकारी योजनाएं'
                  : 'Speak to ask: Live Mandi rates, 3-day weather, crop remedies & PM-Kisan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-900/60 px-4 py-2 rounded-xl border border-emerald-500/40 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
            <span>{language === 'hi' ? 'बोलकर पूछें' : 'Start Voice'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 🚛 2. Live GPS Reefer Radar Banner */}
        <div 
          onClick={() => setActiveTab('tracker')}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-xl transition-all border border-cyan-500/30 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {language === 'hi' ? 'लाइव जीपीएस रीफर फ्लीट' : 'Live GPS Reefer Fleet'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950 animate-pulse">
                  LIVE RADAR
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'hi'
                  ? '4.1°C कोल्ड-चेन तापमान, राजमार्ग चेकपॉइंट और ई-वे बिल लाइव देखें'
                  : 'Monitor 4.1°C cold-chain sensors, toll checkpoints & e-Way bill in real-time'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-950/60 px-4 py-2 rounded-xl border border-cyan-600/40 group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0">
            <span>{language === 'hi' ? 'मैप खोलें' : 'Open GPS Radar'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Produce Listed"
          value={produceSummary.displayValue}
          subtitle={produceSummary.lotSubtitle}
          actionText="View quantity by unit →"
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
                <span>Direct Bulk Demands & Pooled Orders</span>
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

      {/* 🚚 How Farmers Send Produce to Collection Hub / FCI Silo (Actionable Dispatch Guide) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/20 space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hi' ? 'हब लॉजिस्टिक्स व डिस्पैच गाइड' : 'Hub Logistics & Dispatch Guide'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-bold">
                {language === 'hi' ? '100% निःशुल्क फार्मगेट पिकअप या त्वरित सेल्फ-ड्रॉप' : '100% Free Farmgate Pickup or Instant Self-Drop'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <span>{language === 'hi' ? 'खेत से कलेक्शन हब में फसल कैसे भेजें?' : 'How to Send Harvest to Collection Hub'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi' 
                ? 'किसान अपनी उपज को दो आसान तरीकों से सुरक्षित रूप से पहुंचा सकते हैं—घर बैठे मुफ्त फार्मगेट रीफर पिकअप द्वारा, या नजदीकी एफसीआई साइलो पर डिजिटल गेट पास से स्वयं ड्रॉप करके।'
                : 'Farmers can dispatch their produce in two frictionless ways—via 100% Free Farmgate Reefer Truck Pickup, or by Self-Dropping directly at the nearest FCI Silo with an instant Digital Gate Pass.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenGatePassModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 shrink-0 cursor-pointer self-start md:self-auto"
          >
            <QrCode className="w-4 h-4" />
            <span>{language === 'hi' ? '🎫 डिजिटल गेट पास जनरेट करें' : '🎫 Generate Digital Gate Pass'}</span>
          </button>
        </div>

        {/* 2 Clear Dispatch Methods Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Method 1: Free Farmgate Pickup */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 space-y-4 hover:border-emerald-400/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] flex items-center gap-1.5 border border-emerald-400/30">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'विधि 1: निःशुल्क फार्मगेट पिकअप' : 'Method 1: Free Farmgate Pickup'}</span>
                </span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {language === 'hi' ? '₹0 किसान खर्च (खरीददार द्वारा वहन)' : '₹0 Farmer Cost (Buyer Paid)'}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white">
                {language === 'hi' ? 'ट्रक सीधे आपके खेत पर आएगा' : 'AI Dispatches Reefer Truck to Your Farm'}
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    {language === 'hi' 
                      ? 'जब खरीददार आपकी फसल खरीदता है, तो हमारा AI इंजन पास के तापमान-नियंत्रित रीफर या EV ट्रक को आपके खेत का पता भेजता है।'
                      : 'When a buyer places an order, platform AI dispatches an optimal temperature-controlled Reefer or EV truck to your farmgate.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    {language === 'hi' 
                      ? 'ड्राइवर खेत पर ही प्रमाणित डिजिटल कांटे से वजन करता है और मौके पर डिजिटल लोडिंग पर्ची (e-Way Bill) जारी करता है।'
                      : 'The driver weighs produce on-site using portable calibrated digital scales and issues a digital e-Way Bill.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    {language === 'hi' 
                      ? 'फसल सीधे नजदीकी साइलो/हब पर पहुँचती है। जैसे ही डिलीवरी पूरी होती है, एस्क्रो से पैसा सीधे आपके बैंक खाते में जमा हो जाता है।'
                      : 'Truck delivers directly to the designated FCI Silo. 100% Escrow payout is transferred to your bank account within 2 hours of delivery.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {language === 'hi' ? 'चालक व जीपीएस लाइव ट्रैक करें' : 'Live GPS & Reefer Monitoring'}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{language === 'hi' ? 'सक्रिय ऑर्डर्स देखें' : 'View Orders'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Method 2: Self-Drop at Collection Hub with Digital Gate Pass */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 space-y-4 hover:border-emerald-400/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-[11px] flex items-center gap-1.5 border border-teal-400/30">
                  <Warehouse className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'विधि 2: स्वयं हब पर डिलीवरी' : 'Method 2: Self-Drop at FCI Silo'}</span>
                </span>
                <span className="text-[11px] font-black text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  {language === 'hi' ? 'ग्रीन लेन प्राथमिकता प्रवेश' : 'Green Channel Priority Entry'}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white">
                {language === 'hi' ? 'ट्रैक्टर-ट्रॉली से स्वयं ले जाएं (डिजिटल गेट पास)' : 'Self Delivery via Tractor / Tempo with Gate E-Pass'}
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    {language === 'hi' 
                      ? 'नीचे दिए गए बटन से अपने वाहन (ट्रैक्टर ट्रॉली/पिकअप) का डिजिटल गेट पास व समय स्लॉट जनरेट करें।'
                      : 'Generate your instant Digital Gate Pass & Token with your vehicle number and preferred arrival slot.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    {language === 'hi' 
                      ? 'हब प्रवेश द्वार पर मोबाइल में क्यूआर कोड दिखाएं—बिना मंडी की 4 घंटे लंबी लाइन में लगे ग्रीन लेन से अंदर जाएं।'
                      : 'Show the QR pass at the security gate to bypass long queues through the automated Green Channel.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    {language === 'hi' 
                      ? '100 MT इलेक्ट्रॉनिक वे-ब्रिज पर ग्रॉस-टेयर ऑटोमेटिक माप और 10 मिनट में NABL नमी/गुणवत्ता प्रमाणन।'
                      : 'Automatic weighbridge measurement (Gross - Tare) and 10-minute automated NABL moisture and QC certification.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-teal-300 font-semibold">
                {language === 'hi' ? '2 घंटे में प्रत्यक्ष बैंक क्रेडिट' : 'Bank Credit in 2 Hours'}
              </span>
              <button
                type="button"
                onClick={handleOpenGatePassModal}
                className="px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पास जनरेट करें' : 'Generate Pass'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🏬 Nearest Assigned FCI Silo & Aggregation Hub Live Details */}
        <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                  {nearestHub?.code || 'FCI-DEPOT-01'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                  {language === 'hi' ? 'आपका नजदीकी कलेक्शन हब' : 'Your Nearest Collection Silo'}
                </span>
                <span className="text-[10px] font-extrabold text-amber-300">
                  📍 {nearestHubDistance} km {language === 'hi' ? 'दूरी' : 'away'}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">
                {nearestHub?.name || 'FCI Modern Silo & APMC Aggregation Center'}
              </h4>
              <p className="text-[11px] text-slate-300">
                {nearestHub?.address || `${currentUser?.district || 'Nashik'}, ${currentUser?.state || 'Maharashtra'}`} • ⏰ {nearestHub?.operatingHours || '06:00 AM - 08:00 PM'} • 📞 {nearestHub?.phone || '+91 98000 00000'} ({nearestHub?.operatorName || 'FCI Depot In-Charge'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <a
              href={`tel:${nearestHub?.phone || '+919800000000'}`}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'हब इन-चार्ज कॉल करें' : 'Call Manager'}</span>
            </a>
            <button
              type="button"
              onClick={handleOpenGatePassModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'गेट पास बनाएं' : 'Get Pass'}</span>
            </button>
          </div>
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
                      src={(item.images && item.images[0]) || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                      alt={item.cropName || 'Crop'}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.cropName}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          {item.qualityGrade}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.variety} • {item.quantity} {item.unit || 'Kg'}</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">₹{item.pricePerUnit.toLocaleString('en-IN')}/{item.unit || 'Kg'}</p>
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

      {/* 🎫 MODAL: Digital Gate Entry E-Slip & Weighbridge Pass Generator */}
      {isGatePassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {language === 'hi' ? 'डिजिटल गेट पास व वे-ब्रिज पर्ची' : 'Digital Gate Pass & Weighbridge E-Slip'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi' ? 'FCI साइलो व कलेक्शन हब प्राथमिकता ग्रीन लेन प्रवेश' : 'FCI Silo & Hub Priority Green Lane Entry'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGatePassModalOpen(false);
                  setGeneratedGatePass(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedGatePass ? (
              <form onSubmit={handleGenerateGatePass} className="space-y-4 text-xs">
                {/* Nearest Hub Info Banner */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>{nearestHub?.name}</span>
                    </span>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-emerald-800 border border-emerald-300">
                      {nearestHubDistance} km away
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    📍 {nearestHub?.address} • ⏰ {nearestHub?.operatingHours}
                  </p>
                </div>

                {/* Crop & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'hi' ? 'फसल का नाम (Crop)' : 'Crop Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={gatePassCrop}
                      onChange={e => setGatePassCrop(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Wheat, Tomato, Paddy..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'hi' ? 'मात्रा (Quantity)' : 'Estimated Quantity'} *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        value={gatePassQty}
                        onChange={e => setGatePassQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={gatePassUnit}
                        onChange={e => setGatePassUnit(e.target.value)}
                        className="px-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
                      >
                        <option value="Quintals">Quintals</option>
                        <option value="Tons">Tons</option>
                        <option value="KG">KG</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Transport Mode & Vehicle No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'hi' ? 'वाहन का प्रकार (Vehicle Type)' : 'Vehicle Type'} *
                    </label>
                    <select
                      value={gatePassVehicleType}
                      onChange={e => setGatePassVehicleType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="Tractor Trolley (ट्रैक्टर ट्रॉली)">Tractor Trolley (ट्रैक्टर ट्रॉली)</option>
                      <option value="Mahindra Bolero Pickup (पिकअप)">Mahindra Bolero Pickup (पिकअप)</option>
                      <option value="Tata Ace / Chota Hathi (छोटा हाथी)">Tata Ace / Chota Hathi (छोटा हाथी)</option>
                      <option value="E-Rickshaw Loader (ई-लोडर)">E-Rickshaw Loader (ई-लोडर)</option>
                      <option value="Mini Truck / Tempo (मिनी ट्रक)">Mini Truck / Tempo (मिनी ट्रक)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'hi' ? 'वाहन नंबर (Vehicle Reg No)' : 'Vehicle Registration No'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={gatePassVehicleNo}
                      onChange={e => setGatePassVehicleNo(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500 uppercase"
                      placeholder="e.g. MH-15-TR-2024"
                    />
                  </div>
                </div>

                {/* Preferred Arrival Slot */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'हब पहुंचने का समय स्लॉट (Arrival Time Slot)' : 'Preferred Arrival Slot'} *
                  </label>
                  <select
                    value={gatePassSlot}
                    onChange={e => setGatePassSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Morning: 07:00 AM - 10:00 AM (प्रातः सत्र)">Morning: 07:00 AM - 10:00 AM (प्रातः सत्र - ग्रीन लेन)</option>
                    <option value="Noon: 11:00 AM - 02:00 PM (दोपहर सत्र)">Noon: 11:00 AM - 02:00 PM (दोपहर सत्र - सामान्य लेन)</option>
                    <option value="Evening: 03:00 PM - 06:00 PM (सायं सत्र)">Evening: 03:00 PM - 06:00 PM (सायं सत्र - त्वरित लेन)</option>
                  </select>
                </div>

                {/* Green Channel Notice */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    {language === 'hi'
                      ? 'गेट पास जनरेट करने के बाद आपको एक डिजिटल QR कोड मिलेगा। हब सुरक्षा द्वार पर इसे स्कैन कराएं और बिना लाइन के सीधे कांटे पर वजन कराएं।'
                      : 'After generating the pass, you will receive a digital QR code. Present it at the hub gate scanner for instant queue bypass.'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{language === 'hi' ? 'डिजिटल गेट पास बनाएं' : 'Generate Digital Gate Pass'}</span>
                </button>
              </form>
            ) : (
              /* Printable Digital E-Slip */
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-500 space-y-4 text-slate-900" id="printable-gate-pass">
                  {/* Slip Header */}
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

                  {/* QR Code & Token Box */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-center sm:text-left space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Gate Pass Token ID</span>
                      <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
                        {generatedGatePass.tokenNo}
                      </span>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Valid for Date: {generatedGatePass.generatedAt}
                      </p>
                    </div>

                    {/* Visual QR Code Display */}
                    <div className="p-2 bg-slate-900 rounded-xl text-white flex flex-col items-center justify-center shadow-xs shrink-0">
                      <QrCode className="w-16 h-16 text-emerald-400" />
                      <span className="text-[8px] font-mono text-slate-300 mt-0.5">SCAN AT ENTRY</span>
                    </div>
                  </div>

                  {/* Slip Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Farmer Name</span>
                      <strong className="text-slate-900">{generatedGatePass.farmerName}</strong>
                      <span className="text-slate-500 block text-[10px]">{generatedGatePass.farmerPhone}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Destination Hub</span>
                      <strong className="text-slate-900 truncate block">{generatedGatePass.hubName}</strong>
                      <span className="text-emerald-700 block text-[10px] font-semibold">Code: {generatedGatePass.hubCode}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Produce & Volume</span>
                      <strong className="text-slate-900">{generatedGatePass.cropName}</strong>
                      <span className="text-slate-700 block text-[10px] font-bold">{generatedGatePass.quantity} {generatedGatePass.unit}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Details</span>
                      <strong className="text-slate-900 font-mono">{generatedGatePass.vehicleNo}</strong>
                      <span className="text-slate-500 block text-[10px]">{generatedGatePass.vehicleType.split('(')[0]}</span>
                    </div>
                  </div>

                  {/* Slot & Weighbridge Bay */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">Assigned Slot & Bay</span>
                      <strong>{generatedGatePass.slotTime}</strong>
                    </div>
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-amber-200 text-amber-900">
                      BAY #02 (WEIGHBRIDGE)
                    </span>
                  </div>

                  {/* Instructions */}
                  <p className="text-[10px] text-slate-500 text-center italic">
                    सुरक्षा गार्ड को यह QR कोड दिखाएं • इलेक्ट्रॉनिक कांटे पर वजन के बाद 2 घंटे में भुगतान सीधे बैंक खाते में।
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
                    <span>{language === 'hi' ? 'प्रिंट / डाउनलोड पर्ची' : 'Print / Download Slip'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGatePassModalOpen(false);
                      setGeneratedGatePass(null);
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? 'पूर्ण (Done)' : 'Done'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
