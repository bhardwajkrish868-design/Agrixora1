import React, { useState } from 'react';
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
  ArrowLeft
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

export const MarketPriceIntelligenceView: React.FC = () => {
  const { mandiPrices, setActiveTab, navigateBack } = useAgri();

  const [selectedCrop, setSelectedCrop] = useState<MandiPriceTrend>(mandiPrices[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [chartMode, setChartMode] = useState<'7days' | '30days'>('7days');

  // Interactive AI Price calculator state
  const [calcQty, setCalcQty] = useState(100);
  const [calcUnit, setCalcUnit] = useState('Quintals');

  const filteredCrops = mandiPrices.filter(c => 
    c.cropName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.mandiName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const estimatedMandiTotal = calcQty * selectedCrop.currentPrice;
  const estimatedPlatformTotal = calcQty * selectedCrop.recommendedFarmerSellingPrice;
  const estimatedGain = estimatedPlatformTotal - estimatedMandiTotal;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-xl">
          <button
            type="button"
            onClick={navigateBack}
            className="mt-1 p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs border border-white/30 transition-all cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Farm2Future AI Intelligence Hub
              </span>
              <span className="text-xs text-amber-100">Live AGMARKNET & Mandi Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Real-Time Agricultural Market Intelligence
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
              Eliminate information asymmetry. Compare spot mandi rates, track 30-day trends, and receive AI-backed selling recommendations before harvesting.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('add_produce')}
          className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm hover:bg-amber-50 transition-all shadow-lg hover:scale-105 self-start md:self-auto flex items-center gap-2"
        >
          <span>List at Recommended Rate</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-700" />
        </button>
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
              const isSelected = selectedCrop.cropName === crop.cropName;
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
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">{selectedCrop.cropName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {selectedCrop.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benchmark APMC: <span className="font-semibold text-slate-700">{selectedCrop.mandiName} ({selectedCrop.state})</span>
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
                <span className="text-base font-extrabold text-slate-900">₹{selectedCrop.currentPrice}/Q</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block">AI Recommended</span>
                <span className="text-base font-extrabold text-emerald-700">₹{selectedCrop.recommendedFarmerSellingPrice}/Q</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Min - Max Range</span>
                <span className="text-sm font-bold text-slate-800">₹{selectedCrop.minPrice} - ₹{selectedCrop.maxPrice}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Demand / Supply</span>
                <span className="text-xs font-bold text-slate-800">{selectedCrop.demandTrend} / {selectedCrop.supplyTrend}</span>
              </div>
            </div>

            {/* Interactive Price Trend Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === '7days' ? (
                  <LineChart data={selectedCrop.historical7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <LineChart data={selectedCrop.historical30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <p className="text-xs text-slate-500">Calculate extra revenue by selling on Farm2Future vs local middlemen</p>
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
                <span className="text-[10px] text-slate-500 block">@ ₹{selectedCrop.currentPrice}/Q</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                <span className="text-emerald-800 block uppercase font-bold text-[10px]">Farm2Future Direct Return:</span>
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
