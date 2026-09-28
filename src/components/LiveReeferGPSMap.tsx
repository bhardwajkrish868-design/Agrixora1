import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  Navigation, 
  MapPin, 
  Clock, 
  Gauge, 
  Thermometer, 
  CheckCircle2, 
  RotateCw, 
  FastForward, 
  Play, 
  Pause, 
  ShieldCheck, 
  QrCode, 
  Phone, 
  FileText, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Radio, 
  Share2, 
  X,
  ExternalLink
} from 'lucide-react';
import { ROUTE_PRESETS, RoutePreset } from '../utils/routeUtils';

interface LiveReeferGPSMapProps {
  initialRouteKey?: string;
  orderNumber?: string;
  cropName?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNo?: string;
  transporterName?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const LiveReeferGPSMap: React.FC<LiveReeferGPSMapProps> = ({
  initialRouteKey = 'patna_hajipur',
  orderNumber = 'AGX-2026-8842',
  cropName = 'Export Grade Red Onion & Vegetables',
  driverName = 'Rajeshwar Yadav',
  driverPhone = '+91 98350 44219',
  vehicleNo = 'BR-01-GB-4412',
  transporterName = 'Bihar State Green Cold-Fleet Logistics',
  onClose,
  isModal = false
}) => {
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>(initialRouteKey);
  const activePreset: RoutePreset = ROUTE_PRESETS[selectedRouteKey] || ROUTE_PRESETS['patna_hajipur'];

  const totalKm = activePreset.totalDistanceKm || 20;
  const [currentKm, setCurrentKm] = useState<number>(Math.round(totalKm * 0.45));
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [tempAlertTriggered, setTempAlertTriggered] = useState<boolean>(false);
  const [liveTemp, setLiveTemp] = useState<number>(4.1);

  // Live fluctuating sensor telemetry simulation
  useEffect(() => {
    const tempInterval = setInterval(() => {
      setLiveTemp(prev => {
        if (tempAlertTriggered) return 8.6;
        const delta = (Math.random() - 0.5) * 0.2;
        return Number((Math.max(3.6, Math.min(4.8, prev + delta))).toFixed(1));
      });
    }, 2500);
    return () => clearInterval(tempInterval);
  }, [tempAlertTriggered]);

  // Real-time animated GPS progress driver
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 600 / playbackSpeed;
    const stepKm = totalKm > 100 ? 0.8 : 0.2;

    const interval = setInterval(() => {
      setCurrentKm(prev => {
        if (prev >= totalKm) {
          return 0; // loop back for continuous rich demo
        }
        return Number((prev + stepKm).toFixed(1));
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalKm]);

  const progressPercent = Math.min(100, Math.max(0, Math.round((currentKm / totalKm) * 100)));
  const remainingKm = Math.max(0, Number((totalKm - currentKm).toFixed(1)));
  const currentSpeed = isPlaying ? (selectedRouteKey === 'patna_hajipur' ? 36 : activePreset.defaultSpeedKmph || 52) : 0;
  const remainingMinutes = currentSpeed > 0 ? Math.round((remainingKm / currentSpeed) * 60) : 0;

  // Approximate GPS coordinate interpolation for demonstration
  const baseLat = selectedRouteKey.includes('patna') ? 25.6120 : selectedRouteKey.includes('nashik') ? 19.9975 : 28.6139;
  const baseLng = selectedRouteKey.includes('patna') ? 85.1440 : selectedRouteKey.includes('nashik') ? 73.7898 : 77.2090;
  const liveLat = (baseLat + (progressPercent / 100) * 0.082).toFixed(4);
  const liveLng = (baseLng + (progressPercent / 100) * 0.075).toFixed(4);

  const checkpoints = activePreset.checkpoints || [];

  return (
    <div className={`bg-slate-950 text-white rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl ${isModal ? 'max-w-5xl w-full mx-auto my-auto' : 'w-full'}`}>
      
      {/* 🌟 TOP CONTROL HEADER */}
      <div className="bg-slate-900/90 backdrop-blur-md px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Radio className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg text-white font-display tracking-tight">
                Live GPS Cold-Chain Radar
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Consignment: <span className="text-emerald-400 font-bold">{orderNumber}</span> • {cropName}
            </p>
          </div>
        </div>

        {/* Route Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {[
            { key: 'patna_hajipur', label: 'Patna ⇄ Hajipur (20 km)' },
            { key: 'nashik_mumbai', label: 'Nashik ⇄ Mumbai (165 km)' },
            { key: 'punjab_delhi', label: 'Punjab ⇄ Delhi (310 km)' },
            { key: 'himachal_delhi', label: 'Shimla ⇄ Delhi (340 km)' },
            { key: 'bengal_bihar', label: 'Patna ⇄ Kolkata (580 km)' }
          ].map(r => (
            <button
              key={r.key}
              onClick={() => {
                setSelectedRouteKey(r.key);
                setCurrentKm(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRouteKey === r.key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 📊 TELEMETRY METRIC HUD BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-slate-900/60 border-b border-slate-800">
        
        {/* Cold-Chain Temp Gauge */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          tempAlertTriggered 
            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-900/20' 
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <Thermometer className={`w-3.5 h-3.5 ${tempAlertTriggered ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
              Reefer Cargo Temp
            </span>
            <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
              tempAlertTriggered ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {tempAlertTriggered ? 'ALERT: 8.6°C' : 'OPTIMAL'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${tempAlertTriggered ? 'text-rose-400' : 'text-cyan-300'}`}>
              {liveTemp}°C
            </span>
            <span className="text-[11px] text-slate-400">Set: 4.0°C (±1.5°)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" /> Humidity: 86% RH • Dual Inverter Active
          </p>
        </div>

        {/* Speedometer & Live Speed */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Live Fleet Speed
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Limit: 60 km/h</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {currentSpeed}
            </span>
            <span className="text-xs text-slate-300 font-bold">km/h</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Cruise Speed: 42 km/h • Fastag Auto-Toll
          </p>
        </div>

        {/* Remaining Distance & ETA */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Estimated Arrival (ETA)
            </span>
            <span className="text-[10px] font-bold text-emerald-400">{progressPercent}% Done</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-300">
              {remainingMinutes > 0 ? `${remainingMinutes}m` : 'Arrived'}
            </span>
            <span className="text-xs text-slate-300">({remainingKm} km left)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Covered: {currentKm} / {totalKm} km
          </p>
        </div>

        {/* GPS Live Coordinates & Driver */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <Navigation className="w-3.5 h-3.5 text-indigo-400" />
              GPS Satellite Lock
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">12 SAT</span>
          </div>
          <div className="text-sm font-bold font-mono text-indigo-200 truncate">
            {liveLat}° N, {liveLng}° E
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Truck: <span className="font-bold text-white">{vehicleNo}</span> ({driverName})
          </p>
        </div>

      </div>

      {/* 🗺️ INTERACTIVE HIGHWAY MAP VISUALIZER */}
      <div className="p-5 sm:p-7 space-y-6 relative overflow-hidden">
        
        {/* Highway Header & Route Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
                ACTIVE HIGHWAY CORRIDOR
              </span>
              <span className="text-xs text-slate-400 font-mono">Total Length: {totalKm} km</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {activePreset.routeHighway}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>E-Way Bill & QR</span>
            </button>

            <button
              onClick={() => setTempAlertTriggered(!tempAlertTriggered)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tempAlertTriggered
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Test cold chain temperature breach sensor alert"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{tempAlertTriggered ? 'Reset Temp Alert' : 'Simulate Temp Spike'}</span>
            </button>
          </div>
        </div>

        {/* 🛣️ THE INTERACTIVE HIGHWAY VISUAL ROAD WITH CHECKPOINTS */}
        <div className="relative py-8 px-2 sm:px-6 bg-slate-900/40 rounded-3xl border border-slate-800/80">
          
          {/* Subtle Road Asphalt Layer */}
          <div className="relative h-12 bg-slate-800/90 rounded-2xl border-2 border-slate-700/80 shadow-inner overflow-hidden flex items-center px-4">
            
            {/* Center Dashed Highway Strip */}
            <div className="absolute inset-x-0 h-0.5 border-t-2 border-dashed border-amber-400/40 top-1/2 -translate-y-1/2" />
            
            {/* Real-time Green Progress Track */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600/40 via-teal-500/40 to-cyan-500/60 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />

            {/* 🚚 MOVING REEFER TRUCK WITH REAL-TIME POSITION */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-20 flex items-center -ml-6"
              style={{ left: `${Math.min(94, Math.max(3, progressPercent))}%` }}
            >
              <div className="relative flex items-center justify-center">
                {/* Pulse Radar Wave */}
                <div className="absolute -inset-2 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
                
                {/* Truck Badge */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center text-xl shadow-xl shadow-cyan-500/50 ring-2 ring-white cursor-grab active:cursor-grabbing transform hover:scale-110 transition-transform">
                  🚚
                </div>

                {/* Overhead Floating Telemetry Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-cyan-400/60 shadow-lg whitespace-nowrap flex items-center gap-1.5 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-cyan-300 font-extrabold">{currentKm} km</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-emerald-400">{currentSpeed} km/h</span>
                </div>
              </div>
            </div>

          </div>

          {/* 📍 HIGHWAY CHECKPOINTS MILESTONE GRID */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {checkpoints.map((cp, idx) => {
              const cpKm = Number(((cp.distancePercent / 100) * totalKm).toFixed(1));
              const isPassed = currentKm >= cpKm;
              const isCurrent = Math.abs(currentKm - cpKm) <= (totalKm > 100 ? 15 : 3);

              return (
                <div 
                  key={idx}
                  onClick={() => setCurrentKm(cpKm)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-950/60 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                      : isPassed
                        ? 'bg-slate-900/90 border-emerald-600/40 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      KM {cpKm}
                    </span>
                    {isPassed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Passed
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Upcoming</span>
                    )}
                  </div>

                  <h4 className={`text-xs font-bold leading-tight truncate ${isPassed ? 'text-white' : 'text-slate-400'}`} title={cp.name}>
                    {cp.name}
                  </h4>
                  
                  {cp.description && (
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {cp.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 🎛️ PLAYBACK & SPEED CONTROLS */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause Simulation' : 'Resume Live Driving'}</span>
              </button>

              <button
                onClick={() => setCurrentKm(0)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Rewind to start of route"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Speed Multipliers */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                {[1, 2, 5].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      playbackSpeed === spd
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Distance Slider */}
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">0 km</span>
              <input
                type="range"
                min={0}
                max={totalKm}
                step={0.1}
                value={currentKm}
                onChange={e => {
                  setIsPlaying(false);
                  setCurrentKm(Number(e.target.value));
                }}
                className="w-full accent-emerald-500 cursor-ew-resize"
              />
              <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{totalKm} km</span>
            </div>
          </div>

        </div>

        {/* 📋 DRIVER & TRANSPORTER DISPATCH CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Driver Card with WhatsApp/Call Button */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-2xl shadow-xs">
                👨‍✈️
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{driverName}</h4>
                <p className="text-xs text-slate-400 font-mono">{driverPhone}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">Verified Heavy Reefer Pilot</span>
              </div>
            </div>

            <a
              href={`tel:${driverPhone}`}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
              title="Call driver directly"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Transporter & Vehicle No */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-950 border border-teal-600/40 flex items-center justify-center text-teal-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300">{transporterName}</h4>
              <p className="text-sm font-black font-mono text-white tracking-wider">{vehicleNo}</p>
              <span className="text-[10px] text-cyan-400 font-semibold">Eicher Pro 6028 Reefer (BS-VI)</span>
            </div>
          </div>

          {/* Green Carbon & NABL Grade */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-emerald-400">18.4 kg CO2e Saved</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">EV Mode</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">NABL Cold-Chain Certified Batch</p>
              <span className="text-[10px] text-slate-400">Zero Spoilage Guarantee</span>
            </div>
          </div>

        </div>

      </div>

      {/* 📄 MODAL: OFFICIAL E-WAY BILL & VERIFICATION QR CODE */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Government E-Way Bill</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-500/40 text-center space-y-3">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://agrixora.netlify.app/track/${orderNumber}?ewb=EWB-2026-9812-4410`}
                  alt="E-Way Bill QR Verification"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-slate-700">EWB-2026-9812-4410</p>
                <p className="text-[11px] text-emerald-700 font-semibold">Digitally Signed by GSTN & Ministry of Agriculture</p>
              </div>
            </div>

            {/* Bill Details */}
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Vehicle Number:</span>
                <span className="font-mono font-bold text-slate-900">{vehicleNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Origin Hub:</span>
                <span className="font-bold text-slate-900">Patna Mithapur Agro Depot</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Destination Mandi:</span>
                <span className="font-bold text-slate-900">Hajipur APMC Mandi Terminal</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Cold-Chain Status:</span>
                <span className="font-bold text-emerald-700">4.1°C Active Inverter Controlled</span>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Close Verification Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
