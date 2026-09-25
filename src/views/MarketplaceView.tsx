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
  ArrowRight
} from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { HyperlocalRadar } from '../components/HyperlocalRadar';
import { calculateDistanceKm, geocodeLocation, getHyperlocalDispatchEstimate } from '../utils/geoUtils';
import { ALL_INDIAN_STATES, getDistrictsForState } from '../data/indiaLocations';

export const MarketplaceView: React.FC = () => {
  const { listings, selectedListingModal, setSelectedListingModal, userLocation, collectionHubs, bulkDemands, setActiveTab } = useAgri();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'price_desc' | 'freshness' | 'quantity'>('distance');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(10);
  const [isHyperlocalOnly, setIsHyperlocalOnly] = useState<boolean>(true);

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
      if (!lat || !lng) {
        const geo = geocodeLocation(item.farmerLocation || item.location || '', item.farmerState || item.state || '', item.pincode || '');
        lat = geo.lat;
        lng = geo.lng;
      }
      const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
      const isHyperlocal = distanceKm <= 10;
      const dispatchInfo = getHyperlocalDispatchEstimate(distanceKm);

      return {
        ...item,
        latitude: lat,
        longitude: lng,
        distanceKm,
        isHyperlocal,
        dispatchInfo
      };
    });
  }, [listings, userLocation]);

  // Count hubs & farmers within selected radius
  const connectedFarmersCount = enrichedListings.filter(l => l.distanceKm <= selectedRadiusKm).length;
  const connectedHubsCount = collectionHubs.filter(h => {
    const d = calculateDistanceKm(userLocation.lat, userLocation.lng, h.latitude, h.longitude);
    return d <= selectedRadiusKm;
  }).length;

  const filteredListings = enrichedListings.filter(item => {
    if (item.status !== 'Active' && item.quantity <= 0) return false;
    
    // Hyperlocal 10km filter
    if (isHyperlocalOnly && item.distanceKm > selectedRadiusKm) {
      return false;
    }

    const itemLoc = item.farmerLocation || item.location || '';
    const itemSt = item.farmerState || item.state || '';
    const itemDist = item.district || '';
    const matchesSearch = 
      item.cropName.toLowerCase().includes(search.toLowerCase()) ||
      item.variety.toLowerCase().includes(search.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(search.toLowerCase()) ||
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

      {/* 📍 10 KM Hyper-Local Auto-Connect Radar */}
      <HyperlocalRadar
        selectedRadiusKm={selectedRadiusKm}
        onRadiusChange={setSelectedRadiusKm}
        isHyperlocalOnly={isHyperlocalOnly}
        onToggleHyperlocal={setIsHyperlocalOnly}
        connectedFarmersCount={connectedFarmersCount}
        connectedHubsCount={connectedHubsCount}
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
              <option value="distance">📍 Distance: Nearest First (10 KM Auto-Match)</option>
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
          <h3 className="font-bold text-slate-800 text-lg">No Produce Matches Your Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isHyperlocalOnly 
              ? `No farms found strictly within ${selectedRadiusKm} km of your location. Try selecting '25 KM' or 'All India' in the radar above.`
              : 'Try resetting your search query or selecting a different category/location filter.'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedGrade('All');
              setSelectedState('All');
              setSelectedDistrict('All');
              setIsHyperlocalOnly(false);
              setSelectedRadiusKm(9999);
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Show All-India Produce
          </button>
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
                    src={item.images[0]}
                    alt={item.cropName}
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

                  {/* 📍 Hyper-Local Distance & 10 KM Auto-Connect Strip */}
                  <div className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
                    item.isHyperlocal 
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                      : 'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${item.isHyperlocal ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{item.distanceKm <= 0 ? 'Local Hub (< 1 km)' : `${item.distanceKm} km away`}</span>
                    </div>

                    {item.isHyperlocal ? (
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-xs">
                        <Zap className="w-2.5 h-2.5" /> 10 KM Auto-Match
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Regional Mandi</span>
                    )}
                  </div>

                  {/* Quick Dispatch Info if within 10 km */}
                  {item.dispatchInfo && item.isHyperlocal && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold px-1">
                      <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{item.dispatchInfo.label}</span>
                    </div>
                  )}

                  {/* Price Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-baseline justify-between border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Price / {(item.unit || 'Quintals').slice(0, -1)}</span>
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
