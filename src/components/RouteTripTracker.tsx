import React, { useState } from 'react';
import { Order, DispatchDetails } from '../types';
import { getRouteTripDetails } from '../utils/routeUtils';
import { 
  Truck, 
  Navigation, 
  MapPin, 
  Clock, 
  Gauge, 
  Thermometer, 
  CheckCircle2, 
  ChevronRight, 
  RotateCw,
  FastForward,
  ShieldCheck,
  Building2,
  Warehouse
} from 'lucide-react';

interface RouteTripTrackerProps {
  order?: Order;
  dispatchDetails?: DispatchDetails;
  onUpdateTripProgress?: (coveredKm: number) => void;
  compact?: boolean;
  showControls?: boolean;
}

export const RouteTripTracker: React.FC<RouteTripTrackerProps> = ({
  order,
  dispatchDetails: customDispatch,
  onUpdateTripProgress,
  compact = false,
  showControls = true
}) => {
  const dispatch = customDispatch || order?.dispatchDetails;
  const origin = dispatch?.originHub || order?.collectionHubName || 'Agricultural Aggregation Hub';
  const destination = dispatch?.destinationWarehouse || order?.deliveryAddress || 'Central Mandi / Buyer Depot';
  const stage = order?.currentStage || (dispatch ? 'in_transit' : 'order_placed');

  const routeInfo = getRouteTripDetails(origin, destination, stage, dispatch);

  // Local state for interactive live simulation if not controlled externally
  const [liveCoveredKm, setLiveCoveredKm] = useState<number>(routeInfo.coveredDistanceKm);

  const totalKm = routeInfo.totalDistanceKm || 165;
  const currentCoveredKm = onUpdateTripProgress ? routeInfo.coveredDistanceKm : liveCoveredKm;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentCoveredKm / totalKm) * 100)));
  const remainingKm = Math.max(0, totalKm - currentCoveredKm);
  const speed = stage === 'delivered' ? 0 : (dispatch?.currentSpeedKmph || routeInfo.currentSpeedKmph || 48);
  const remainingMinutes = stage === 'delivered' ? 0 : Math.round((remainingKm / (speed > 0 ? speed : 45)) * 60);

  const handleSeekKm = (km: number) => {
    const clamped = Math.min(totalKm, Math.max(0, km));
    setLiveCoveredKm(clamped);
    if (onUpdateTripProgress) {
      onUpdateTripProgress(clamped);
    }
  };

  if (compact) {
    return (
      <div className="space-y-2 p-3 rounded-2xl bg-slate-900 text-white border border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            <span>Route: {routeInfo.routeHighway.split('&')[0]}</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-300 font-extrabold">
            {currentCoveredKm} / {totalKm} km ({progressPercent}%)
          </span>
        </div>

        {/* Mini Highway Bar */}
        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5 flex items-center">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Mini Moving Truck Icon */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center -ml-2"
            style={{ left: `${Math.min(96, Math.max(4, progressPercent))}%` }}
          >
            <span className="text-xs shadow-md filter drop-shadow">🚚</span>
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span className="truncate max-w-[45%]">From: {origin.split(',')[0]}</span>
          <span className="truncate max-w-[45%] text-right">To: {destination.split(',')[0]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-emerald-500/20 space-y-6">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
              <Navigation className="w-3 h-3 animate-spin" />
              <span>LIVE TRANSIT TELEMETRY</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30">
              {dispatch?.vehicleNo || 'FLEET ACTIVE'}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{routeInfo.routeHighway}</span>
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>Origin: <strong className="text-slate-200">{origin}</strong></span>
            <span>➔</span>
            <span>Destination: <strong className="text-slate-200">{destination}</strong></span>
          </p>
        </div>

        {/* Live Distance Covered Big Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Trip Progress</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{currentCoveredKm}</span>
              <span className="text-xs text-slate-400 font-mono">/ {totalKm} km</span>
              <span className="ml-1 text-xs font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/50">
                {progressPercent}%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Interactive Highway Track with Moving Truck Symbol */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>Origin Hub (0 km)</span>
          </div>
          <div className="text-center hidden sm:block">
            <span className="text-slate-400 text-[11px]">
              {stage === 'delivered' 
                ? '✅ Consignment Arrived at Buyer Warehouse' 
                : `🚚 En Route • ${remainingKm} km remaining (~${remainingMinutes} min)`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Warehouse className="w-4 h-4 text-cyan-500" />
            <span>Buyer Destination ({totalKm} km)</span>
          </div>
        </div>

        {/* Styled Asphalt Highway Track */}
        <div className="relative bg-slate-900 border-2 border-slate-700/80 rounded-2xl py-6 px-6 sm:px-10 shadow-inner overflow-visible">
          {/* Highway Road Asphalt Texture with Center Dashed Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-3 bg-slate-800 rounded-full border border-slate-700" />
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-600/60 z-0" />

          {/* Active Covered Green/Cyan Trail Line */}
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full shadow-lg shadow-emerald-500/40 transition-all duration-300 z-10"
            style={{ width: `calc(${progressPercent}% * (100% - 48px) / 100)` }}
          />

          {/* Intermediate Checkpoint Nodes */}
          <div className="relative z-20 flex justify-between items-center w-full">
            {routeInfo.checkpoints.map((cp, idx) => {
              const isPassed = cp.status === 'passed' || (currentCoveredKm >= cp.distanceKm && stage === 'delivered');
              const isCurrent = cp.status === 'current' && stage !== 'delivered';

              return (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => handleSeekKm(cp.distanceKm)}
                  title={`${cp.name} (${cp.distanceKm} km) - Click to jump truck here`}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    isPassed 
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-md shadow-emerald-500/40' 
                      : isCurrent
                        ? 'bg-amber-400 border-amber-200 text-slate-950 ring-4 ring-amber-400/30 animate-pulse'
                        : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}>
                    {isPassed ? '✓' : idx + 1}
                  </div>

                  {/* Node Label Tooltip on Hover */}
                  <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/95 text-slate-200 text-[10px] font-semibold px-2 py-1 rounded-lg border border-slate-700 whitespace-nowrap pointer-events-none z-30 shadow-xl">
                    {cp.name} • {cp.distanceKm} km
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Animated Truck Symbol Positioned on Highway */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-300 pointer-events-none"
            style={{ 
              left: `calc(24px + (${progressPercent} / 100) * (100% - 48px))`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Pulsing Radar Wave Beacon */}
            <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            
            {/* Truck Symbol Container Card */}
            <div className="relative flex flex-col items-center">
              {/* Floating Live Telemetry Badge over Truck */}
              <div className="mb-2 bg-emerald-950/90 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-xl border border-emerald-400/50 shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md animate-bounce">
                <span className="text-sm">🚚</span>
                <span>{currentCoveredKm} km ({progressPercent}%)</span>
                <span className="text-white/40">•</span>
                <span className="text-cyan-300 font-mono">{speed} km/h</span>
              </div>

              {/* Glowing Truck Icon Pill */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-white shadow-xl shadow-emerald-500/50 flex items-center justify-center text-slate-950 font-extrabold">
                <Truck className="w-6 h-6 text-slate-950" />
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Checkpoints Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2">
          {routeInfo.checkpoints.map((cp, idx) => {
            const isPassed = cp.status === 'passed' || (currentCoveredKm >= cp.distanceKm && stage === 'delivered');
            const isCurrent = cp.status === 'current' && stage !== 'delivered';

            return (
              <div 
                key={cp.id}
                onClick={() => handleSeekKm(cp.distanceKm)}
                className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-400/40 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                    : isPassed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                  <span className="font-bold">Checkpoint {idx + 1}</span>
                  <span className={`px-1.5 py-0.2 rounded font-extrabold ${
                    isPassed ? 'bg-emerald-500/30 text-emerald-300' : isCurrent ? 'bg-amber-400/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cp.distanceKm} km
                  </span>
                </div>
                <h5 className="font-bold text-white text-[11px] truncate">{cp.name}</h5>
                {cp.description && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{cp.description}</p>
                )}
                <div className="mt-2 text-[9px] font-bold uppercase tracking-wider">
                  {isPassed ? '✅ Passed' : isCurrent ? '📍 Live Position' : '⏳ Upcoming'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Column Live Metric Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Current Speed
          </span>
          <div className="text-lg font-extrabold text-white font-mono">{speed} km/h</div>
          <span className="text-[10px] text-emerald-400 block font-medium">Optimal Transit Speed</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Remaining Time (ETA)
          </span>
          <div className="text-lg font-extrabold text-amber-300 font-mono">
            {stage === 'delivered' ? 'Arrived' : `~${remainingMinutes} mins`}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">{remainingKm} km to destination</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-emerald-400" /> Reefer Temp
          </span>
          <div className="text-lg font-extrabold text-emerald-300 font-mono">
            {dispatch?.temperatureCelsius || 14.0}°C
          </div>
          <span className="text-[10px] text-emerald-400 block font-medium">Cold Chain Maintained</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Transporter & Driver
          </span>
          <div className="text-xs font-bold text-white truncate">{dispatch?.driverName || 'Prakash Shinde'}</div>
          <span className="text-[10px] text-slate-400 block truncate">{dispatch?.transporterName || 'GreenWheels Logistics'}</span>
        </div>
      </div>

      {/* Interactive Simulation Controls */}
      {showControls && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <FastForward className="w-4 h-4" /> Live Route Simulation:
            </span>
            <span className="text-xs text-slate-400">Scrub the truck along the highway to see real-time distance and milestone updates</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSeekKm(0)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition-colors"
            >
              Start (0%)
            </button>
            <button
              type="button"
              onClick={() => handleSeekKm(Math.round(totalKm * 0.25))}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition-colors"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => handleSeekKm(Math.round(totalKm * 0.50))}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => handleSeekKm(Math.round(totalKm * 0.72))}
              className="px-2.5 py-1 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-[11px] font-bold text-emerald-200 border border-emerald-500/40 transition-colors"
            >
              72% (Live)
            </button>
            <button
              type="button"
              onClick={() => handleSeekKm(totalKm)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition-colors"
            >
              100% (Arrived)
            </button>

            <button
              type="button"
              onClick={() => handleSeekKm(currentCoveredKm + 10)}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
            >
              <span>+10 km</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
