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

interface HyperlocalRadarProps {
  selectedRadiusKm: number;
  onRadiusChange: (radius: number) => void;
  isHyperlocalOnly: boolean;
  onToggleHyperlocal: (active: boolean) => void;
  connectedFarmersCount?: number;
  connectedHubsCount?: number;
}

export const HyperlocalRadar: React.FC<HyperlocalRadarProps> = ({
  selectedRadiusKm,
  onRadiusChange,
  isHyperlocalOnly,
  onToggleHyperlocal,
  connectedFarmersCount = 0,
  connectedHubsCount = 0
}) => {
  const { userLocation, setUserLocation, detectLiveLocation } = useAgri();
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [detectSuccess, setDetectSuccess] = useState(false);

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

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-emerald-500/30 space-y-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Location & GPS Detection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                10 KM Auto-Connect Radar (10 किमी स्वतः कनेक्ट)
              </span>
              {isHyperlocalOnly && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Auto-Matching
                </span>
              )}
            </div>

            {/* Location Selector Dropdown */}
            <div className="relative mt-1">
              <button
                onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white hover:text-emerald-300 transition-colors text-left"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{userLocation.name} ({userLocation.pincode}), {userLocation.district}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isLocDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 max-h-60 overflow-y-auto space-y-1 text-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Select Farm / Mandi Center</p>
                  {Object.values(KNOWN_AGRI_LOCATIONS).map(loc => (
                    <button
                      key={loc.pincode}
                      onClick={() => handleSelectLocation(loc)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                        userLocation.pincode === loc.pincode
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{loc.name}</div>
                        <div className="text-[10px] text-slate-400">{loc.district}, {loc.state} (PIN {loc.pincode})</div>
                      </div>
                      {userLocation.pincode === loc.pincode && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: GPS Detect & 10KM Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detecting GPS...' : detectSuccess ? '✓ GPS Fed!' : 'Feed Live GPS'}</span>
          </button>

          <button
            onClick={() => onToggleHyperlocal(!isHyperlocalOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isHyperlocalOnly
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-300/40'
                : 'bg-white/15 hover:bg-white/20 text-slate-200 border border-white/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{isHyperlocalOnly ? '10 KM Filter: ON (सक्रिय)' : 'Filter 10 KM (चालू करें)'}</span>
          </button>
        </div>
      </div>

      {/* Radius Range Bar & Auto-Match Metrics */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Radius Chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Auto-Connect Radius:</span>
          {[
            { label: '5 KM (Micro)', value: 5 },
            { label: '10 KM (Standard)', value: 10 },
            { label: '25 KM (Cluster)', value: 25 },
            { label: 'All India', value: 9999 }
          ].map(r => (
            <button
              key={r.value}
              onClick={() => {
                onRadiusChange(r.value);
                if (r.value === 9999) {
                  onToggleHyperlocal(false);
                } else {
                  onToggleHyperlocal(true);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedRadiusKm === r.value
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Live Auto-Connected Count Badge */}
        <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-400/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isHyperlocalOnly
              ? `⚡ Auto-Connected: ${connectedFarmersCount} Local Farmers • ${connectedHubsCount} Hubs within ${selectedRadiusKm === 9999 ? 'All India' : `${selectedRadiusKm} km`}`
              : `🎯 Within ${selectedRadiusKm === 9999 ? 'All India' : `${selectedRadiusKm} km`}: ${connectedFarmersCount} Farmers ready`}
          </span>
        </div>
      </div>
    </div>
  );
};
