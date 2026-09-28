import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  Navigation, 
  MapPin, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  Sliders, 
  Zap, 
  Truck, 
  Building2, 
  Users,
  ChevronDown
} from 'lucide-react';
import { KNOWN_AGRI_LOCATIONS, GeoCoordinate, calculateDistanceKm } from '../utils/geoUtils';

export type ProcurementRangeMode = 'state' | 'district' | 'regional' | 'all';

interface HyperlocalRadarProps {
  selectedRadiusKm: number;
  onRadiusChange: (radius: number) => void;
  isHyperlocalOnly: boolean;
  onToggleHyperlocal: (active: boolean) => void;
  rangeMode?: ProcurementRangeMode;
  onRangeModeChange?: (mode: ProcurementRangeMode) => void;
  connectedFarmersCount?: number;
  connectedHubsCount?: number;
  buyerState?: string;
}

export const HyperlocalRadar: React.FC<HyperlocalRadarProps> = ({
  selectedRadiusKm,
  onRadiusChange,
  isHyperlocalOnly,
  onToggleHyperlocal,
  rangeMode = 'state',
  onRangeModeChange,
  connectedFarmersCount = 0,
  connectedHubsCount = 0,
  buyerState
}) => {
  const { userLocation, setUserLocation, detectLiveLocation, language } = useAgri();
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [detectSuccess, setDetectSuccess] = useState(false);

  const isHindi = language === 'hi';
  const activeState = buyerState || userLocation.state || 'Maharashtra';

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setDetectSuccess(false);
    try {
      await detectLiveLocation();
      setDetectSuccess(true);
      setTimeout(() => setDetectSuccess(false), 3000);
    } catch (err) {
      console.warn('GPS detection error', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectLocation = (loc: GeoCoordinate) => {
    setUserLocation(loc);
    setIsLocDropdownOpen(false);
  };

  const handleModeSelect = (mode: ProcurementRangeMode, radius: number) => {
    if (onRangeModeChange) {
      onRangeModeChange(mode);
    }
    onRadiusChange(radius);
    if (mode === 'all') {
      onToggleHyperlocal(false);
    } else {
      onToggleHyperlocal(true);
    }
  };

  // Clean deduplicated location title display (never repeats district/state)
  const getLocationDisplay = () => {
    const name = (userLocation.name || '').trim();
    const dist = (userLocation.district || '').trim();
    const st = (userLocation.state || '').trim();
    const pin = (userLocation.pincode || '').trim();

    const parts: string[] = [];
    if (name) parts.push(name);
    if (dist && !name.toLowerCase().includes(dist.toLowerCase())) {
      parts.push(dist);
    }
    if (st && !name.toLowerCase().includes(st.toLowerCase())) {
      parts.push(st);
    }
    const main = parts.length > 0 ? parts.join(', ') : (isHindi ? 'स्थान चुनें' : 'Select Location');
    return pin ? `${main} (PIN ${pin})` : main;
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-emerald-500/30 space-y-4 relative">
      {/* Background Decorative Rings (isolated in clipped background layer) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />
      </div>

      {/* Top Bar: Location & GPS Detection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
            <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {isHindi ? '🏛️ राज्यव्यापी किसान खरीद रडार' : '🏛️ State-Wide Procurement Radar'}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {rangeMode === 'state'
                  ? (isHindi ? `संपूर्ण राज्य सक्रिय (${activeState})` : `Entire State Active (${activeState})`)
                  : (isHindi ? 'लाइव रडार' : 'Live Radar')}
              </span>
            </div>

            {/* Location Selector Dropdown */}
            <div className="relative mt-1">
              <button
                type="button"
                onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white hover:text-emerald-300 transition-colors text-left group cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[280px] sm:max-w-md">{getLocationDisplay()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLocDropdownOpen ? 'rotate-180 text-emerald-300' : ''}`} />
              </button>

              {isLocDropdownOpen && (
                <>
                  {/* Backdrop to dismiss when clicking anywhere outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLocDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-80 max-w-[92vw] bg-slate-900/98 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl z-50 max-h-72 overflow-y-auto space-y-1 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 flex items-center justify-between border-b border-white/10 mb-1">
                      <span>{isHindi ? 'मंडी / कृषि केंद्र चुनें' : 'Select Farm / Mandi Center'}</span>
                      <span className="text-[9px] text-emerald-400 font-mono">({Object.keys(KNOWN_AGRI_LOCATIONS).length} Hubs)</span>
                    </div>
                    {Object.values(KNOWN_AGRI_LOCATIONS).map(loc => (
                      <button
                        key={loc.pincode}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          userLocation.pincode === loc.pincode
                            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/50'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{loc.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {loc.district && !loc.name.includes(loc.district) ? `${loc.district}, ` : ''}{loc.state} • PIN {loc.pincode}
                          </div>
                        </div>
                        {userLocation.pincode === loc.pincode && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: GPS Detect & State-Wide Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs shadow-sm hover:scale-[1.02]"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>
              {isDetecting
                ? (isHindi ? 'जीपीएस पता लगा रहे हैं...' : 'Detecting GPS...')
                : detectSuccess
                ? (isHindi ? '✓ जीपीएस प्राप्त!' : '✓ GPS Fed!')
                : (isHindi ? 'लाइव जीपीएस जोड़ें' : 'Feed Live GPS')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (rangeMode === 'state') {
                handleModeSelect('all', 9999);
              } else {
                handleModeSelect('state', 9999);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] ${
              rangeMode === 'state'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-300/40'
                : 'bg-white/15 hover:bg-white/20 text-slate-200 border border-white/20'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {rangeMode === 'state'
                ? (isHindi ? `🏛️ संपूर्ण राज्य: चालू (${activeState})` : `🏛️ Entire State: ON (${activeState})`)
                : (isHindi ? '🏛️ संपूर्ण राज्य फ़िल्टर करें' : '🏛️ Filter Entire State')}
            </span>
          </button>
        </div>
      </div>

      {/* Scope Range Bar & Auto-Match Metrics */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Scope Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">
            {isHindi ? 'खरीद का दायरा:' : 'Procurement Scope:'}
          </span>
          {[
            { label: isHindi ? `🏛️ संपूर्ण राज्य (${activeState})` : `🏛️ Entire State (${activeState})`, mode: 'state' as ProcurementRangeMode, radius: 9999 },
            { label: isHindi ? '📍 जिला (50 किमी)' : '📍 District (50 KM)', mode: 'district' as ProcurementRangeMode, radius: 50 },
            { label: isHindi ? '🚛 क्षेत्रीय (150 किमी)' : '🚛 Regional (150 KM)', mode: 'regional' as ProcurementRangeMode, radius: 150 },
            { label: isHindi ? '🇮🇳 संपूर्ण भारत' : '🇮🇳 All India', mode: 'all' as ProcurementRangeMode, radius: 9999 }
          ].map(r => (
            <button
              key={r.mode}
              type="button"
              onClick={() => handleModeSelect(r.mode, r.radius)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                rangeMode === r.mode
                  ? 'bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-300 font-extrabold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Live Auto-Connected Count Badge */}
        <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-400/20 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {rangeMode === 'state'
              ? (isHindi
                  ? `🏛️ राज्य स्तर: ${connectedFarmersCount} सत्यापित किसान (${activeState}) • ${connectedHubsCount} एफसीआई हब`
                  : `🏛️ State-Wide: ${connectedFarmersCount} Verified Farmers in ${activeState} • ${connectedHubsCount} FCI Hubs`)
              : rangeMode === 'district'
              ? (isHindi
                  ? `📍 जिला दायरा: ${connectedFarmersCount} किसान • ${connectedHubsCount} हब (50 किमी के भीतर)`
                  : `📍 District Range: ${connectedFarmersCount} Farmers • ${connectedHubsCount} Hubs within 50 KM`)
              : rangeMode === 'regional'
              ? (isHindi
                  ? `🚛 क्षेत्रीय दायरा: ${connectedFarmersCount} किसान • ${connectedHubsCount} हब (150 किमी के भीतर)`
                  : `🚛 Regional Range: ${connectedFarmersCount} Farmers • ${connectedHubsCount} Hubs within 150 KM`)
              : (isHindi
                  ? `🎯 संपूर्ण भारत: ${connectedFarmersCount} किसान उपलब्ध`
                  : `🎯 All India: ${connectedFarmersCount} Farmers Ready Across India`)}
          </span>
        </div>
      </div>
    </div>
  );
};
