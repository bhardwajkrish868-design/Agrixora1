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
  ChevronRight,
  Building2,
  Award
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
    setSelectedListingModal,
    language,
    isBuyerOrder
  } = useAgri();

  let myBuyerOrders = orders.filter(o => isBuyerOrder(o, currentUser));
  if (myBuyerOrders.length === 0 && orders.length > 0 && (!currentUser?.phone || currentUser.id === 'usr_guest' || currentUser.id === 'usr_buyer')) {
    myBuyerOrders = orders;
  }

  const activeOrders = myBuyerOrders.filter(o => o.currentStage !== 'delivered');
  const deliveredOrders = myBuyerOrders.filter(o => o.currentStage === 'delivered');
  const inTransitOrders = myBuyerOrders.filter(o => o.currentStage === 'in_transit');
  
  const totalSpend = myBuyerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const escrowLocked = myBuyerOrders.filter(o => o.paymentStatus === 'escrow_locked').reduce((sum, o) => sum + o.totalAmount, 0);
  
  const featuredListings = listings.filter(l => l.status === 'Active').slice(0, 4);

  const categories = [
    { 
      name: language === 'hi' ? 'सब्जियां' : 'Vegetables', 
      catKey: 'Vegetables', 
      count: listings.filter(l => l.category === 'Vegetables').length, 
      icon: '🥦', 
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200' 
    },
    { 
      name: language === 'hi' ? 'अनाज' : 'Cereals & Grains', 
      catKey: 'Cereals & Grains', 
      count: listings.filter(l => l.category === 'Cereals & Grains').length, 
      icon: '🌾', 
      color: 'bg-amber-50 text-amber-800 border-amber-200' 
    },
    { 
      name: language === 'hi' ? 'फल' : 'Fruits', 
      catKey: 'Fruits', 
      count: listings.filter(l => l.category === 'Fruits').length, 
      icon: '🍎', 
      color: 'bg-rose-50 text-rose-800 border-rose-200' 
    },
    { 
      name: language === 'hi' ? 'दालें' : 'Pulses', 
      catKey: 'Pulses', 
      count: listings.filter(l => l.category === 'Pulses').length, 
      icon: '🫘', 
      color: 'bg-blue-50 text-blue-800 border-blue-200' 
    },
    { 
      name: language === 'hi' ? 'तिलहन' : 'Oilseeds', 
      catKey: 'Oilseeds', 
      count: listings.filter(l => l.category === 'Oilseeds').length, 
      icon: '🌻', 
      color: 'bg-purple-50 text-purple-800 border-purple-200' 
    },
    { 
      name: language === 'hi' ? 'मसाले' : 'Spices', 
      catKey: 'Spices', 
      count: listings.filter(l => l.category === 'Spices').length, 
      icon: '🌶️', 
      color: 'bg-orange-50 text-orange-800 border-orange-200' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Clean Compact Header with Profile Photo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('profile')}
            className="relative shrink-0 cursor-pointer group"
            title={language === 'hi' ? 'अपनी प्रोफ़ाइल देखें' : 'View Profile Details'}
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md border-2 border-blue-400 group-hover:scale-105 transition-transform"
            />
            {currentUser.verified && (
              <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-blue-600 text-white rounded-full shadow-xs border-2 border-white" title="Verified Bulk Buyer">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                {language === 'hi' ? `स्वागत है, ${currentUser.name} 🏢` : `Welcome, ${currentUser.name} 🏢`}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                {language === 'hi' ? 'सत्यापित थोक खरीदार' : 'Verified Bulk Buyer'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{language === 'hi' ? 'राज्यव्यापी खरीद अधिकृत' : 'State-Wide Access'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentUser.businessName ? `Org: ${currentUser.businessName} • ` : ''}GSTIN: 27AABCA1234F1Z9 • 📍 {currentUser.district || 'Nashik'}, {currentUser.state || 'Maharashtra'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('bulk_pooling')}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Boxes className="w-4 h-4 text-amber-300" />
            <span>{language === 'hi' ? '+ थोक मांग दर्ज करें' : '+ Create Bulk Demand'}</span>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>{language === 'hi' ? 'सीधे किसान लॉट' : 'Direct Lots'}</span>
          </button>
          <button
            onClick={() => setActiveTab('track_delivery')}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'वाहन ट्रैकिंग' : 'Fleet Telemetry'}</span>
          </button>
          <button
            onClick={() => setActiveTab('market_prices')}
            className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-700" />
            <span>{language === 'hi' ? 'मंडी भाव विश्लेषण' : 'Mandi Rates'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={language === 'hi' ? 'सक्रिय खरीद' : 'Active Procurements'}
          value={activeOrders.length}
          subtitle={language === 'hi' ? `${inTransitOrders.length} वाहन शीत परिवहन में` : `${inTransitOrders.length} in cold transit fleet`}
          icon={ShoppingBag}
          colorScheme="blue"
          onClick={() => setActiveTab('my_orders')}
        />

        <StatCard
          title={language === 'hi' ? 'एस्क्रो सुरक्षित राशि' : 'Locked in Escrow'}
          value={'₹' + escrowLocked.toLocaleString('en-IN')}
          subtitle={language === 'hi' ? 'हब पर जांच व रसीद के बाद जारी' : 'Released upon physical intake'}
          icon={CreditCard}
          colorScheme="amber"
          onClick={() => setActiveTab('payments')}
        />

        <StatCard
          title={language === 'hi' ? 'कुल खरीद (FY26)' : 'Total Procured (FY26)'}
          value={'₹' + totalSpend.toLocaleString('en-IN')}
          subtitle={language === 'hi' ? '0% बिचौलिया कमीशन' : 'Zero middleman commission'}
          icon={TrendingUp}
          trend={{ value: '22.8%', isPositive: true }}
          colorScheme="emerald"
          onClick={() => setActiveTab('payments')}
        />

        <StatCard
          title={language === 'hi' ? 'सफल डिलीवरी' : 'Completed Deliveries'}
          value={deliveredOrders.length}
          subtitle={language === 'hi' ? '100% समय पर डिलीवरी रिकॉर्ड' : '100% On-Time SLA Record'}
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
                {language === 'hi' ? '⚡ 4-माह अग्रिम कॉर्पोरेट खरीद' : '⚡ 4-Month Advance Corporate Procurement'}
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                {language === 'hi' ? '● 100% खरीदार द्वारा भुगतान किया गया परिवहन एस्क्रो' : '● 100% Buyer-Paid Transport Escrow'}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-400" />
              <span>{language === 'hi' ? 'सक्रिय 4-माह अग्रिम कॉर्पोरेट मांग (50T – 500T+)' : 'Active 4-Month Advance Corporate Demands (50T – 500T+)'}</span>
            </h2>
            <p className="text-xs text-slate-300">
              {language === 'hi'
                ? 'कटाई से 120 दिन पहले किसानों से सीधा अनुबंध करें। गारंटीशुदा फसल मात्रा, पूर्व-निर्धारित खरीद मूल्य और कलेक्शन हब के लिए स्वचालित एआई ट्रक डिस्पैच।'
                : 'Contract farmers 120 days prior to harvest. Guaranteed crop volume, pre-set purchase prices, and automated AI truck dispatch to collection hubs.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('bulk_pooling')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-all hover:scale-105"
          >
            <span>{language === 'hi' ? 'नई 4-माह मांग शुरू करें' : 'Launch New 4-Mo Demand'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {bulkDemands.length === 0 ? (
            <div className="col-span-full py-6 text-center text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 p-4">
              <Boxes className="w-8 h-8 mx-auto mb-2 text-indigo-400 stroke-1" />
              <p className="text-xs font-semibold text-slate-200">
                {language === 'hi' ? 'वर्तमान में कोई सक्रिय थोक पूल नहीं है' : 'No active bulk pools at the moment'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'hi' 
                  ? 'आप थोक कृषि उपज (50T – 500T+) के लिए एक नई 4-माह की कॉर्पोरेट मांग शुरू कर सकते हैं।' 
                  : 'You can launch a new 4-month corporate demand for bulk agricultural commodities (50T – 500T+).'}
              </p>
            </div>
          ) : (
            bulkDemands.slice(0, 3).map(pool => {
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
                      {fillPct}% {language === 'hi' ? 'पूर्ण' : 'Filled'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{language === 'hi' ? 'लक्ष्य:' : 'Target:'} <strong>{pool.targetQuantityTons} {language === 'hi' ? 'टन' : 'Tons'}</strong></span>
                      <span>{language === 'hi' ? 'प्राप्त:' : 'Committed:'} <strong>{pool.committedQuantityTons} {language === 'hi' ? 'टन' : 'Tons'}</strong></span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="text-amber-300 font-extrabold">₹{pool.pricePerTon.toLocaleString('en-IN')}/{language === 'hi' ? 'टन' : 'Ton'}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{language === 'hi' ? 'डिस्पैच:' : 'Pickup:'} {pool.expectedDispatchStart}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Category Procurement Navigator */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'सीधी कृषि उपज श्रेणियां' : 'Direct Farmgate Crop Categories'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi' 
                ? 'कटाई की तारीख और गुणवत्ता के अनुसार सत्यापित कृषि लॉट तक सीधी पहुंच' 
                : 'Instant access to verified farm lots sorted by harvest date'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'hi' ? `सभी ${listings.length} लॉट देखें` : `View All ${listings.length} Lots`}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <button
              key={cat.catKey}
              onClick={() => setActiveTab('marketplace')}
              className={'p-3.5 rounded-2xl border ' + cat.color + ' hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer'}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <div>
                <strong className="text-xs font-bold block truncate">{cat.name}</strong>
                <span className="text-[10px] opacity-80">
                  {cat.count} {language === 'hi' ? 'लॉट तैयार' : 'Lots Ready'}
                </span>
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
              <span>{language === 'hi' ? 'सक्रिय खेप (परिवहन व गुणवत्ता जांच)' : 'Active Consignments in Transit & QC'}</span>
            </h2>
            <button
              onClick={() => setActiveTab('my_orders')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {language === 'hi' ? `सभी ऑर्डर (${myBuyerOrders.length}) →` : `All Orders (${myBuyerOrders.length}) →`}
            </button>
          </div>

          <div className="space-y-3">
            {myBuyerOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">
                  {language === 'hi' ? 'वर्तमान में कोई सक्रिय खेप नहीं है' : 'No active consignments'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'hi' 
                    ? 'सत्यापित कृषि उपज खरीदने के लिए मार्केटप्लेस देखें।' 
                    : 'Explore the marketplace to procure verified farm produce.'}
                </p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'कृषि लॉट ब्राउज़ करें' : 'Browse Farmgate Lots'}</span>
                </button>
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
                        {order.currentStage === 'delivered'
                          ? (language === 'hi' ? 'डिलीवर संपन्न' : 'DELIVERED')
                          : order.currentStage === 'in_transit'
                            ? (language === 'hi' ? 'रास्ते में' : 'IN TRANSIT')
                            : (language === 'hi' ? 'ऑर्डर दर्ज' : order.currentStage.replace(/_/g, ' ').toUpperCase())}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {order.cropName} ({order.quantity} {order.unit})
                    </h4>
                    <p className="text-xs text-slate-500">
                      {language === 'hi' ? 'उत्पत्ति / किसान:' : 'Origin:'} {order.farmerName}, {order.farmerLocation}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        {language === 'hi' ? 'एस्क्रो मूल्य' : 'Escrow Value'}
                      </span>
                      <strong className="text-sm font-extrabold text-emerald-700">₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTrackingOrderId(order.id);
                        setActiveTab('track_delivery');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{language === 'hi' ? 'जीपीएस ट्रैक' : 'Track GPS'}</span>
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
                <span>{language === 'hi' ? 'लाइव सेंसर टेलीमेट्री' : 'Live Sensor Feed'}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">ORD-2026-9812</span>
            </div>

            <h3 className="text-lg font-bold">
              {language === 'hi' ? 'नासिक लाल प्याज (गरवा)' : 'Nashik Red Onion (Garwa)'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'रीफर ट्रक MH-15-EG-4401 नवी मुंबई हब की ओर अग्रसर'
                : 'Reefer Truck MH-15-EG-4401 en route to Navi Mumbai Hub'}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">
                  {language === 'hi' ? 'चैंबर तापमान' : 'Chamber Temp'}
                </span>
                <strong className="text-base font-extrabold text-emerald-400 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" /> 19.5 °C
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">
                  {language === 'hi' ? 'जीपीएस गति' : 'GPS Speed'}
                </span>
                <strong className="text-base font-extrabold text-blue-400">42 km/h</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTrackingOrderId('ORD-2026-9812');
              setActiveTab('track_delivery');
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{language === 'hi' ? 'पूर्ण लाइव पाइपलाइन खोलें' : 'Open Full Interactive Pipeline'}</span>
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
              <span>{language === 'hi' ? 'आज बिक्री के लिए उपलब्ध मुख्य कृषि फसलें' : 'Featured Farmgate Harvests Available Today'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'कलेक्शन सेंटरों पर 100% गुणवत्ता-परीक्षित और प्रमाणित'
                : '100% Quality Inspected & Cured at Collection Centers'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'सभी फसलें देखें →' : 'Browse All Crops →'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredListings.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Store className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">
                {language === 'hi' ? 'मार्केटप्लेस में अभी कोई लॉट उपलब्ध नहीं है' : 'No produce lots available in marketplace currently'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'hi'
                  ? 'पंजीकृत किसानों द्वारा नई लिस्टेड फसलें यहाँ स्वतः दिखाई देंगी।'
                  : 'Newly listed harvests by registered farmers will automatically appear here.'}
              </p>
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
                      src={(item.images && item.images[0]) || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                      alt={item.cropName || 'Crop'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[9px] font-bold">
                      {item.qualityGrade || 'Grade A'}
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
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                  >
                    {language === 'hi' ? 'लॉट खरीदें' : 'Buy Lot'}
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
