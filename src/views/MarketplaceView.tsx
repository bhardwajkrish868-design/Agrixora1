import React, { useState, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import { CropCategory, QualityGrade, CropListing } from '../types';
import { 
  Store, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Eye, 
  ShoppingBag, 
  ArrowUpDown,
  Sparkles,
  Award,
  Zap,
  Radio,
  Clock,
  Boxes,
  ArrowRight,
  Building2,
  Truck
} from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { HyperlocalRadar, ProcurementRangeMode } from '../components/HyperlocalRadar';
import { calculateDistanceKm, geocodeLocation, getHyperlocalDispatchEstimate, isWithinSameState } from '../utils/geoUtils';
import { ALL_INDIAN_STATES, getDistrictsForState } from '../data/indiaLocations';

export const MarketplaceView: React.FC = () => {
  const { listings, selectedListingModal, setSelectedListingModal, userLocation, collectionHubs, bulkDemands, setActiveTab, currentUser, setActiveTrackingOrderId, language, stats } = useAgri();

  const isHindi = language === 'hi';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'price_desc' | 'freshness' | 'quantity'>('distance');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(9999);
  const [isHyperlocalOnly, setIsHyperlocalOnly] = useState<boolean>(true);
  const [rangeMode, setRangeMode] = useState<ProcurementRangeMode>('state');

  const buyerState = currentUser?.state || userLocation.state || 'Maharashtra';

  const categories = ['All', 'Vegetables', 'Cereals & Grains', 'Fruits', 'Pulses', 'Oilseeds', 'Spices'];
  const grades = ['All', 'Grade A+', 'Grade A', 'Grade B', 'Organic Certified', 'Fair'];

  // Dependent districts for chosen state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'All') return [];
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict('All');
  };

  // Enrich listings with live distance & dispatch estimates
  const enrichedListings = useMemo(() => {
    return listings.map(item => {
      let lat = item.latitude;
      let lng = item.longitude;
      const itemState = item.farmerState || item.state || '';
      if (!lat || !lng) {
        const geo = geocodeLocation(item.farmerLocation || item.location || '', itemState, item.pincode || '');
        lat = geo.lat;
        lng = geo.lng;
      }
      const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
      const isSameState = isWithinSameState(buyerState, itemState);
      const isHyperlocal = distanceKm <= 15;
      const dispatchInfo = getHyperlocalDispatchEstimate(distanceKm);

      return {
        ...item,
        latitude: lat,
        longitude: lng,
        distanceKm,
        isSameState,
        isHyperlocal,
        dispatchInfo
      };
    });
  }, [listings, userLocation, buyerState]);

  // Count hubs & farmers within selected state-wide / radius scope
  const connectedFarmersCount = useMemo(() => {
    let count = 0;
    if (rangeMode === 'state') {
      count = enrichedListings.filter(l => l.isSameState).length;
    } else if (rangeMode === 'district') {
      count = enrichedListings.filter(l => l.distanceKm <= 50).length;
    } else if (rangeMode === 'regional') {
      count = enrichedListings.filter(l => l.distanceKm <= 150).length;
    } else {
      count = enrichedListings.length;
    }

    if (count === 0 && rangeMode === 'all' && enrichedListings.length > 0) {
      count = enrichedListings.length;
    } else if (count === 0 && enrichedListings.length === 0) {
      count = stats?.registeredFarmersNow || stats?.verifiedFarmersCount || 8;
    }
    return count;
  }, [enrichedListings, rangeMode, stats]);

  const connectedHubsCount = useMemo(() => {
    if (rangeMode === 'state') {
      return collectionHubs.filter(h => isWithinSameState(buyerState, h.state)).length;
    } else if (rangeMode === 'district') {
      return collectionHubs.filter(h => calculateDistanceKm(userLocation.lat, userLocation.lng, h.latitude, h.longitude) <= 50).length;
    } else if (rangeMode === 'regional') {
      return collectionHubs.filter(h => calculateDistanceKm(userLocation.lat, userLocation.lng, h.latitude, h.longitude) <= 150).length;
    }
    return collectionHubs.length;
  }, [collectionHubs, rangeMode, buyerState, userLocation]);

  const filteredListings = enrichedListings.filter(item => {
    if (item.status && item.status !== 'Active') return false;
    if (item.quantity !== undefined && item.quantity <= 0) return false;
    
    // State-Wide & Range procurement filtering
    if (selectedState === 'All') {
      if (rangeMode === 'state') {
        if (!item.isSameState) return false;
      } else if (rangeMode === 'district') {
        if (item.distanceKm > 50) return false;
      } else if (rangeMode === 'regional') {
        if (item.distanceKm > 150) return false;
      }
    }

    const itemLoc = item.farmerLocation || item.location || '';
    const itemSt = item.farmerState || item.state || '';
    const itemDist = item.district || '';
    const cropName = item.cropName || '';
    const variety = item.variety || '';
    const farmerName = item.farmerName || '';
    const matchesSearch = 
      cropName.toLowerCase().includes(search.toLowerCase()) ||
      variety.toLowerCase().includes(search.toLowerCase()) ||
      farmerName.toLowerCase().includes(search.toLowerCase()) ||
      itemLoc.toLowerCase().includes(search.toLowerCase()) ||
      itemSt.toLowerCase().includes(search.toLowerCase()) ||
      itemDist.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesGrade = selectedGrade === 'All' || item.qualityGrade === selectedGrade;
    const matchesState = selectedState === 'All' || itemSt.toLowerCase() === selectedState.toLowerCase();
    const matchesDistrict = selectedDistrict === 'All' || 
      itemDist.toLowerCase() === selectedDistrict.toLowerCase() ||
      itemLoc.toLowerCase().includes(selectedDistrict.toLowerCase());
    const matchesPrice = item.pricePerUnit <= maxPrice;

    return matchesSearch && matchesCat && matchesGrade && matchesState && matchesDistrict && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'price_asc') return a.pricePerUnit - b.pricePerUnit;
    if (sortBy === 'price_desc') return b.pricePerUnit - a.pricePerUnit;
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Active Intra-State Trade Corridor based on active location/state
  const activeTradeCorridor = useMemo(() => {
    const st = buyerState || userLocation.state || 'Maharashtra';
    if (st === 'Bihar') {
      return {
        badgeEn: 'Live Proof: Within-State Direct Trade',
        badgeHi: 'लाइव प्रमाण: राज्य के भीतर प्रत्यक्ष कृषि व्यापार',
        corridorBadgeEn: '● 100% Intra-State Direct Transit',
        corridorBadgeHi: '● १००% राज्य के भीतर सीधा गलियारा',
        titleEn: '🍌 Active Trade: Hajipur (Vaishali) ➔ Patna Mandi Corridor',
        titleHi: '🍌 सक्रिय व्यापार: हाजीपुर (वैशाली) ➔ पटना मंडी कृषि गलियारा',
        farmerLabelEn: 'Farmer: Mukesh Kumar (Vaishali)',
        farmerLabelHi: 'किसान: मुकेश कुमार (वैशाली)',
        buyerLabelEn: 'Buyer: Patna Fresh Mart (Patna)',
        buyerLabelHi: 'खरीदार: पटना फ्रेश मार्ट (पटना)',
        produceLabelEn: 'Produce: 50 Qtl Fresh Banana & Veggies (₹1,07,500 Escrow Locked)',
        produceLabelHi: 'फसल: ५० क्विंटल केला व ताज़ा सब्ज़ियाँ (₹१,०७,५०० एस्क्रो सुरक्षित)',
        distanceLabelEn: 'Distance: 28 km within Bihar',
        distanceLabelHi: 'दूरी: २८ किमी बिहार के अंदर',
        vehicleLabelEn: 'Vehicle: Tata 407 (BR-01-GB-4421) live on JP Ganga Path',
        vehicleLabelHi: 'वाहन: टाटा ४०७ (BR-01-GB-4421) जेपी गंगा पथ पर सक्रिय',
        trackBtnEn: 'Track Live Truck',
        trackBtnHi: 'लाइव वाहन ट्रैक करें',
        viewVegBtnEn: 'View State Produce',
        viewVegBtnHi: 'राज्य की उपज देखें',
        orderId: 'ORD-INTRA-BR-2026'
      };
    }
    return {
      badgeEn: 'Live Proof: Within-State Direct Trade',
      badgeHi: 'लाइव प्रमाण: राज्य के भीतर प्रत्यक्ष कृषि व्यापार',
      corridorBadgeEn: '● 100% Intra-State Direct Transit',
      corridorBadgeHi: '● १००% राज्य के भीतर सीधा गलियारा',
      titleEn: '🍅 Active Trade: Manchar (Pune District) ➔ Navi Mumbai, Maharashtra',
      titleHi: '🍅 सक्रिय व्यापार: मंचर (पुणे जिला) ➔ वाशी, नवी मुंबई, महाराष्ट्र',
      farmerLabelEn: 'Farmer: Dnyaneshwar Shinde (Pune)',
      farmerLabelHi: 'किसान: ज्ञानेश्वर शिंदे (पुणे)',
      buyerLabelEn: 'Buyer: AgroFresh Retail (Thane/Mumbai)',
      buyerLabelHi: 'खरीदार: एग्रोफ्रेश रिटेल (ठाणे/मुंबई)',
      produceLabelEn: 'Produce: 40 Quintals Tomato (₹89,820 Escrow Locked)',
      produceLabelHi: 'फसल: ४० क्विंटल हाइब्रिड टमाटर (₹८९,८२० एस्क्रो सुरक्षित)',
      distanceLabelEn: 'Distance: 138 km within Maharashtra',
      distanceLabelHi: 'दूरी: १३८ किमी महाराष्ट्र के अंदर',
      vehicleLabelEn: 'Vehicle: Tata 407 (MH-14-BT-9142) live on Highway',
      vehicleLabelHi: 'वाहन: टाटा ४०७ (MH-14-BT-9142) लाइव हाईवे पर सक्रिय',
      trackBtnEn: 'Track Live Truck',
      trackBtnHi: 'लाइव वाहन ट्रैक करें',
      viewVegBtnEn: 'View State Produce',
      viewVegBtnHi: 'राज्य की उपज देखें',
      orderId: 'ORD-INTRA-MH-2026'
    };
  }, [buyerState, userLocation.state]);

  return (
    <div className="space-y-6">
      {/* Clean Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-600" />
            <span>Farmgate Produce Marketplace</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procure farm-fresh harvest directly from verified farmers with transparent grading and escrow.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{filteredListings.length} Active Lots Available</span>
        </div>
      </div>

      {/* 🏢 Institutional Bulk Demands Banner */}
      {bulkDemands && bulkDemands.length > 0 && (
        <div 
          onClick={() => setActiveTab('bulk_pooling')}
          className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-xl shadow-xs">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bulk Pools Open ({bulkDemands.length})
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  ⚡ 4-Month Advance Contracts
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-medium">
                {bulkDemands.map(b => `${b.demandNumber}: ${b.cropName} (${b.targetQuantityTons}T @ ₹${b.pricePerTon.toLocaleString('en-IN')}/T)`).join(' • ')}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Boxes className="w-4 h-4" />
            <span>Open Bulk Pooling Bay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 🏛️ Live Proof Banner: Intra-State Direct Agricultural Trade */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 border border-emerald-500/40 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isHindi ? activeTradeCorridor.badgeHi : activeTradeCorridor.badgeEn}
              </span>
              <span className="text-xs text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {isHindi ? activeTradeCorridor.corridorBadgeHi : activeTradeCorridor.corridorBadgeEn}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{isHindi ? activeTradeCorridor.titleHi : activeTradeCorridor.titleEn}</span>
            </h2>

            <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap text-xs text-slate-300">
              <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                {isHindi ? activeTradeCorridor.farmerLabelHi : activeTradeCorridor.farmerLabelEn}
              </span>
              <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                {isHindi ? activeTradeCorridor.buyerLabelHi : activeTradeCorridor.buyerLabelEn}
              </span>
              <span className="bg-emerald-500/15 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-400/30 font-bold">
                {isHindi ? activeTradeCorridor.produceLabelHi : activeTradeCorridor.produceLabelEn}
              </span>
              <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-medium text-slate-300">
                {isHindi ? activeTradeCorridor.distanceLabelHi : activeTradeCorridor.distanceLabelEn}
              </span>
              <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-medium text-emerald-400">
                {isHindi ? activeTradeCorridor.vehicleLabelHi : activeTradeCorridor.vehicleLabelEn}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTrackingOrderId(activeTradeCorridor.orderId);
                setActiveTab('track_delivery');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{isHindi ? activeTradeCorridor.trackBtnHi : activeTradeCorridor.trackBtnEn}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Vegetables');
                setRangeMode('state');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{isHindi ? activeTradeCorridor.viewVegBtnHi : activeTradeCorridor.viewVegBtnEn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🏛️ State-Wide Farmgate Procurement Radar */}
      <HyperlocalRadar
        selectedRadiusKm={selectedRadiusKm}
        onRadiusChange={setSelectedRadiusKm}
        isHyperlocalOnly={isHyperlocalOnly}
        onToggleHyperlocal={setIsHyperlocalOnly}
        rangeMode={rangeMode}
        onRangeModeChange={setRangeMode}
        connectedFarmersCount={connectedFarmersCount}
        connectedHubsCount={connectedHubsCount}
        buyerState={buyerState}
      />

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by crop (e.g. Basmati Rice, Onion, Tomato), variety, farmer or mandi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Quick Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Quality Grades</option>
              {grades.slice(1).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={e => handleStateChange(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All India (All States)</option>
              {ALL_INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Dependent District Filter - Active when a State is chosen */}
            {selectedState !== 'All' && (
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="px-3 py-2.5 rounded-2xl border border-emerald-400 text-xs font-bold text-emerald-800 bg-emerald-50/70 focus:ring-2 focus:ring-emerald-500 animate-in fade-in duration-150"
              >
                <option value="All">All Districts in {selectedState}</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="distance">🏛️ Distance: Nearest Farm First (State-Wide Auto-Match)</option>
              <option value="freshness">Freshness (Newest Harvest)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="quantity">Largest Quantity</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-900">{filteredListings.length}</strong> available crop lots {isHyperlocalOnly && <span className="text-emerald-700 font-bold">(Within {selectedRadiusKm} km)</span>}</span>
        <span>Secure Escrow Protection Included on all orders</span>
      </div>

      {/* Product Cards Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-soft space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">
            {isHindi ? 'कोई उपज नहीं मिली' : 'No Produce Matches Your Filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isHindi 
              ? (rangeMode === 'state' 
                  ? `वर्तमान में आपके राज्य (${buyerState}) में सक्रिय फसल लिस्टिंग नहीं है। आप पूरे भारत से खरीद सकते हैं।` 
                  : 'खोज शब्द रीसेट करें या कोई अन्य श्रेणी/स्थान फ़िल्टर चुनें।')
              : (rangeMode === 'state'
                  ? `No active produce in your state (${buyerState}) right now. You can procure nationwide.`
                  : 'Try resetting your search query or selecting a different category/location filter.')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedGrade('All');
                setSelectedState('All');
                setSelectedDistrict('All');
                setIsHyperlocalOnly(false);
                setSelectedRadiusKm(9999);
                setRangeMode('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>{isHindi ? 'अखिल भारतीय फसलें देखें (All-India)' : 'Show All-India Produce'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl overflow-hidden border shadow-soft hover:shadow-card transition-all flex flex-col justify-between group ${
                item.isHyperlocal ? 'border-emerald-300/80 ring-1 ring-emerald-400/20' : 'border-slate-100'
              }`}
            >
              <div>
                {/* Crop Image & Quality Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={(item.images && item.images[0]) || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                    alt={item.cropName || 'Crop'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                      {item.qualityGrade}
                    </span>
                    {item.organicCertified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Organic
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-extrabold shadow-sm backdrop-blur-xs">
                    {item.quantity} {item.unit || 'Quintals'} Left
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{item.cropName}</h3>
                    <p className="text-xs text-slate-500 truncate">{item.variety}</p>
                  </div>

                  {/* 📍 State-Wide Procurement & Distance Strip */}
                  <div className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
                    item.isSameState 
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                      : 'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${item.isSameState ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{item.distanceKm <= 0 ? 'Local Hub (< 1 km)' : `${item.distanceKm} km away`}</span>
                    </div>

                    {item.isSameState ? (
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-xs">
                        <Building2 className="w-2.5 h-2.5" /> 🏛️ State-Wide Delivery Ready
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-200/80 px-2 py-0.5 rounded-full">Interstate Freight</span>
                    )}
                  </div>

                  {/* 🏛️ Detected FCI Procurement Hub */}
                  <div className="p-2 rounded-2xl bg-sky-50/90 border border-sky-200/90 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sky-950 text-[11px] truncate">
                            {item.fciHubName || 'FCI Procurement Hub'}
                          </span>
                        </div>
                        <p className="text-[10px] text-sky-800 font-medium truncate">
                          {item.fciHubCode ? `Code: ${item.fciHubCode}` : 'Depot'} • {item.fciHubDistanceKm !== undefined ? `${item.fciHubDistanceKm} km from farm` : 'Local Hub'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-950 font-extrabold text-[9px] shrink-0 border border-sky-300">
                      FCI Depot
                    </span>
                  </div>

                  {/* Quick Dispatch Info */}
                  {item.dispatchInfo && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold px-1">
                      <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{item.dispatchInfo.label}</span>
                    </div>
                  )}

                  {/* Price Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-baseline justify-between border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Price / {item.unit || 'Kg'}</span>
                      <span className="text-lg font-extrabold text-emerald-700">
                        ₹{item.pricePerUnit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mandi Benchmark</span>
                      <span className="text-xs font-bold text-slate-500 line-through">
                        ₹{item.mandiBenchmarkPrice}
                      </span>
                    </div>
                  </div>

                  {/* Farmer and Location */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.farmerLocation || item.location || ''}, {item.farmerState || item.state || ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Farmer: <strong>{item.farmerName}</strong></span>
                      <span>Harvest: {item.harvestDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t border-slate-50 flex items-center gap-2 mt-2">
                <button
                  onClick={() => setSelectedListingModal(item)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => setSelectedListingModal(item)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal />
    </div>
  );
};
