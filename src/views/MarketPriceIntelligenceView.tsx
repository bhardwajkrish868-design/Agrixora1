import React, { useState, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { MandiPriceTrend } from '../types';
import { 
  TrendingUp, 
  Search, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  BarChart2, 
  Calculator,
  Info,
  ShieldCheck,
  ArrowLeft,
  Store,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  ALL_INDIAN_STATES, 
  getDistrictsForState, 
  getDefaultDistrictForState, 
  getNearestTargetMandi 
} from '../data/indiaLocations';

export const MarketPriceIntelligenceView: React.FC = () => {
  const { mandiPrices, refreshMandiPrices, currentUser, userLocation, setActiveTab, navigateBack } = useAgri();

  const profileState = currentUser?.state || userLocation.state || 'Maharashtra';
  const profileDistrict = currentUser?.district || userLocation.district || 'Nashik';

  const [viewState, setViewState] = useState<string>(profileState);
  const [viewDistrict, setViewDistrict] = useState<string>(profileDistrict);

  const [selectedCrop, setSelectedCrop] = useState<MandiPriceTrend>(mandiPrices[0] || ({} as MandiPriceTrend));
  const [searchFilter, setSearchFilter] = useState('');
  const [chartMode, setChartMode] = useState<'7days' | '30days'>('7days');

  // Interactive AI Price calculator state
  const [calcQty, setCalcQty] = useState(100);
  const [calcUnit, setCalcUnit] = useState('Quintals');

  // Keep location synced with logged-in user profile
  useEffect(() => {
    const s = currentUser?.state || userLocation.state || 'Maharashtra';
    const d = currentUser?.district || userLocation.district || 'Nashik';
    setViewState(s);
    setViewDistrict(d);
  }, [currentUser?.id, currentUser?.state, currentUser?.district]);

  // Keep selectedCrop updated whenever mandiPrices array changes
  useEffect(() => {
    if (mandiPrices && mandiPrices.length > 0) {
      setSelectedCrop(prev => {
        const found = mandiPrices.find(c => c.cropName === prev?.cropName);
        return found || mandiPrices[0];
      });
    }
  }, [mandiPrices]);

  const handleStateChange = (newState: string) => {
    setViewState(newState);
    const districts = getDistrictsForState(newState);
    const defaultDist = getDefaultDistrictForState(newState) || districts[0] || '';
    setViewDistrict(defaultDist);
    refreshMandiPrices(newState, defaultDist);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setViewDistrict(newDistrict);
    refreshMandiPrices(viewState, newDistrict);
  };

  const handleResetToProfile = () => {
    setViewState(profileState);
    setViewDistrict(profileDistrict);
    refreshMandiPrices(profileState, profileDistrict);
  };

  const activeMandiName = getNearestTargetMandi(viewState, viewDistrict);
  const isProfileLocation = (viewState.toLowerCase() === profileState.toLowerCase()) && 
                            (viewDistrict.toLowerCase() === profileDistrict.toLowerCase());
  const availableDistricts = getDistrictsForState(viewState);

  const filteredCrops = mandiPrices.filter(c => 
    c.cropName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.mandiName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const currentSelectedCrop = selectedCrop?.cropName ? selectedCrop : (mandiPrices[0] || ({} as MandiPriceTrend));
  const estimatedMandiTotal = calcQty * (currentSelectedCrop.currentPrice || 0);
  const estimatedPlatformTotal = calcQty * (currentSelectedCrop.recommendedFarmerSellingPrice || 0);
  const estimatedGain = estimatedPlatformTotal - estimatedMandiTotal;

  return (
    <div className="space-y-6">
      {/* Clean Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={navigateBack}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span>Agricultural Market Price Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live AGMARKNET & Mandi modal rates, daily arrival volumes, and Government MSP benchmarks.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('add_produce')}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>List at Recommended Rate</span>
          <ArrowUpRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 📍 Current APMC Mandi & Location Intelligence Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Store className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Benchmark APMC Krishi Mandi
                </span>
                {isProfileLocation ? (
                  <span className="text-[11px] font-semibold text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    Matched to your Profile ({currentUser.name || 'You'})
                  </span>
                ) : (
                  <button
                    onClick={handleResetToProfile}
                    className="text-[11px] font-bold text-amber-200 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-0.5 rounded-full border border-amber-400/40 flex items-center gap-1 transition-colors cursor-pointer"
                    title={`Reset to profile location: ${profileDistrict}, ${profileState}`}
                  >
                    <RotateCcw className="w-3 h-3 text-amber-300" />
                    Reset to Profile ({profileDistrict})
                  </button>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white mt-1">
                {activeMandiName}
              </h2>
              <p className="text-xs text-emerald-100/80 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{viewDistrict}, {viewState}</span>
                <span className="mx-1">•</span>
                <span>Live 2026 AGMARKNET / eNAM Modal Rates</span>
              </p>
            </div>
          </div>

          {/* Location Filters / Dropdowns */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-emerald-200 block px-1">State</label>
              <select
                value={viewState}
                onChange={e => handleStateChange(e.target.value)}
                className="bg-slate-900/90 text-white font-semibold text-xs rounded-xl px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {ALL_INDIAN_STATES.map(s => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-emerald-200 block px-1">District</label>
              <select
                value={viewDistrict}
                onChange={e => handleDistrictChange(e.target.value)}
                className="bg-slate-900/90 text-white font-semibold text-xs rounded-xl px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer max-w-[180px] truncate"
              >
                {availableDistricts.map(d => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Crop Selector + Price Graph & AI Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Searchable Crop Mandi Ticker */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Mandi Spot Prices
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search crop, state or APMC..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredCrops.map(crop => {
              const isSelected = currentSelectedCrop.cropName === crop.cropName;
              return (
                <div
                  key={crop.cropName}
                  onClick={() => setSelectedCrop(crop)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-400/30'
                      : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{crop.cropName}</h4>
                      <p className="text-[11px] text-slate-500">{crop.mandiName}, {crop.state}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                      crop.change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {crop.change >= 0 ? '▲ +' : '▼ '}{crop.changePercent}%
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-slate-200/50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Modal APMC:</span>
                      <span className="font-extrabold text-slate-900 block">₹{crop.currentPrice}/Q</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase">Platform AI Price:</span>
                      <span className="font-extrabold text-emerald-700 block">₹{crop.recommendedFarmerSellingPrice}/Q</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Interactive Graph & AI Recommendation Engine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Crop Deep Dive Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">{currentSelectedCrop.cropName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {currentSelectedCrop.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benchmark APMC: <span className="font-semibold text-slate-700">{currentSelectedCrop.mandiName} ({currentSelectedCrop.state})</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartMode('7days')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    chartMode === '7days' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  7-Day Trend
                </button>
                <button
                  onClick={() => setChartMode('30days')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    chartMode === '30days' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  30-Day Range
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Modal Rate</span>
                <span className="text-base font-extrabold text-slate-900">₹{currentSelectedCrop.currentPrice}/Q</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block">AI Recommended</span>
                <span className="text-base font-extrabold text-emerald-700">₹{currentSelectedCrop.recommendedFarmerSellingPrice}/Q</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Min - Max Range</span>
                <span className="text-sm font-bold text-slate-800">₹{currentSelectedCrop.minPrice} - ₹{currentSelectedCrop.maxPrice}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Demand / Supply</span>
                <span className="text-xs font-bold text-slate-800">{currentSelectedCrop.demandTrend} / {currentSelectedCrop.supplyTrend}</span>
              </div>
            </div>

            {/* Interactive Price Trend Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === '7days' ? (
                  <LineChart data={currentSelectedCrop.historical7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(value: any) => [`₹${value}/Q`, 'Modal Price']}
                      contentStyle={{ backgroundColor: '#064e3b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} activeDot={{ r: 6 }} />
                  </LineChart>
                ) : (
                  <LineChart data={currentSelectedCrop.historical30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(value: any, name: any) => [`₹${value}/Q`, name === 'modalPrice' ? 'Modal Price' : name === 'minPrice' ? 'Min Price' : 'Max Price']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="maxPrice" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" name="Max Price" dot={false} />
                    <Line type="monotone" dataKey="modalPrice" stroke="#059669" strokeWidth={3} name="Modal Price" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="minPrice" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" name="Min Price" dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Profit & Selling Price Calculator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Direct Selling Net Gain Calculator</h3>
                <p className="text-xs text-slate-500">Calculate extra revenue by selling on Agrixora vs local middlemen</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Harvest Volume (Quintals)</label>
                <input
                  type="number"
                  min="1"
                  value={calcQty}
                  onChange={e => setCalcQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Local Mandi Return:</span>
                <span className="text-base font-bold text-slate-700">₹{estimatedMandiTotal.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-500 block">@ ₹{currentSelectedCrop.currentPrice || 0}/Q</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                <span className="text-emerald-800 block uppercase font-bold text-[10px]">Agrixora Direct Return:</span>
                <span className="text-base font-extrabold text-emerald-700">₹{estimatedPlatformTotal.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold text-emerald-800 block">
                  + ₹{estimatedGain.toLocaleString('en-IN')} Extra Profit!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
