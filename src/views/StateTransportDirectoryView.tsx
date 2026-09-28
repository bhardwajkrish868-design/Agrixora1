import React, { useState, useMemo, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { VehicleDetails } from '../types';
import { ALL_INDIAN_STATES as MASTER_STATES, getDistrictsForState } from '../data/indiaLocations';
import { 
  Truck, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Thermometer, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Star, 
  Navigation, 
  Calendar, 
  PackageCheck, 
  Layers, 
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Bot,
  Sparkles,
  MessageSquare,
  Send,
  Smartphone,
  X,
  Bell,
  Key,
  Share2,
  Loader2
} from 'lucide-react';
import { RouteTripTracker } from '../components/RouteTripTracker';

// Synthesize pleasant SMS arrival chime via Web Audio API
const playSmsChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // First high chime tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second bell tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
  } catch {
    // AudioContext blocked or not supported
  }
};

const ALL_INDIAN_STATES = [
  'All States',
  ...MASTER_STATES
];

const ZONES: Record<string, string[]> = {
  'North Zone': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Himachal Pradesh', 'Uttarakhand', 'Jammu and Kashmir', 'Delhi'],
  'West Zone': ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'],
  'South Zone': ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala'],
  'Central Zone': ['Madhya Pradesh', 'Chhattisgarh'],
  'East & NE Zone': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand', 'Assam']
};

export const StateTransportDirectoryView: React.FC = () => {
  const { vehicles, currentUser, activeRole, setActiveTab, setActiveTrackingOrderId, addNotification, logActivity, navigateBack } = useAgri();

  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dependent districts for selected state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'All States') return [];
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict('All');
  };

  // Booking Modal State
  const [bookingVehicle, setBookingVehicle] = useState<VehicleDetails | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [cropName, setCropName] = useState('Wheat / Grains');
  const [cargoWeightTons, setCargoWeightTons] = useState(10);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState(150);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Mobile phone state for SMS dispatch
  const [userMobileNumber, setUserMobileNumber] = useState<string>(() => {
    return currentUser?.phone ? currentUser.phone.replace(/\D/g, '').slice(-10) : '9876543210';
  });

  // SMS Gateway config & status state
  const [gatewayConfig, setGatewayConfig] = useState<{
    configured: boolean;
    provider: string;
    maskedKey?: string;
  }>({ configured: false, provider: 'none' });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [fast2smsApiKeyInput, setFast2smsApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveKeyMessage, setSaveKeyMessage] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState<{
    success: boolean;
    delivered?: boolean;
    simulated?: boolean;
    provider?: string;
    error?: string;
    message?: string;
  } | null>(null);

  // Fetch gateway configuration status on mount
  useEffect(() => {
    fetch('/api/sms/config')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setGatewayConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKey(true);
    setSaveKeyMessage('');
    try {
      const res = await fetch('/api/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fast2smsApiKey: fast2smsApiKeyInput })
      });
      const data = await res.json();
      if (data.success) {
        setGatewayConfig({
          configured: data.configured,
          provider: data.provider,
          maskedKey: fast2smsApiKeyInput ? (fast2smsApiKeyInput.slice(0, 4) + '••••' + fast2smsApiKeyInput.slice(-4)) : ''
        });
        setSaveKeyMessage('✅ Fast2SMS API Key सफलतापूर्वक सेव हो गई! अब असली SMS जाएंगे।');
        setTimeout(() => {
          setShowConfigModal(false);
          setSaveKeyMessage('');
        }, 1800);
      } else {
        setSaveKeyMessage('❌ सेव नहीं हो सका: ' + (data.error || 'अज्ञात त्रुटि'));
      }
    } catch (err: any) {
      setSaveKeyMessage('❌ कनेक्शन त्रुटि: ' + err.message);
    } finally {
      setIsSavingKey(false);
    }
  };

  // Live SMS Simulation & Delivery Toast state
  const [smsNotification, setSmsNotification] = useState<{
    show: boolean;
    phone: string;
    vehicleNo: string;
    driverName: string;
    driverPhone: string;
    origin: string;
    destination: string;
    cost: number;
    cropName: string;
    timestamp: string;
    deliveredReal?: boolean;
    provider?: string;
    error?: string;
  } | null>(null);

  // Filtered vehicles logic
  const filteredVehicles = useMemo(() => {
    return (vehicles || []).filter(v => {
      // Zone filter
      if (selectedZone !== 'All') {
        const zoneStates = ZONES[selectedZone] || [];
        if (!zoneStates.includes(v.state)) return false;
      }

      // State filter
      if (selectedState !== 'All States' && v.state !== selectedState) {
        return false;
      }

      // District filter
      if (selectedDistrict !== 'All') {
        const dLower = selectedDistrict.toLowerCase();
        const matchesDistrict = (v.district && v.district.toLowerCase() === dLower) ||
          (v.hubLocation && v.hubLocation.toLowerCase().includes(dLower)) ||
          (v.cityHub && v.cityHub.toLowerCase().includes(dLower));
        if (!matchesDistrict) return false;
      }

      // Service type filter
      if (selectedServiceType !== 'All') {
        if (selectedServiceType === 'Reefer' && !v.serviceType?.toLowerCase().includes('reefer') && !v.vehicleType?.toLowerCase().includes('reefer')) {
          return false;
        }
        if (selectedServiceType === 'Heavy' && !v.serviceType?.toLowerCase().includes('heavy') && !v.vehicleType?.toLowerCase().includes('heavy') && !v.vehicleType?.toLowerCase().includes('multi-axle')) {
          return false;
        }
        if (selectedServiceType === 'Express' && !v.serviceType?.toLowerCase().includes('express') && !v.vehicleType?.toLowerCase().includes('express')) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'All' && v.currentStatus !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPlate = v.vehicleNo?.toLowerCase().includes(q);
        const matchesTransporter = v.transporterName?.toLowerCase().includes(q);
        const matchesDriver = v.driverName?.toLowerCase().includes(q);
        const matchesState = v.state?.toLowerCase().includes(q);
        const matchesCity = v.cityHub?.toLowerCase().includes(q);
        const matchesModel = v.modelName?.toLowerCase().includes(q);
        const matchesRoute = (v.operatingRoutes || []).some(r => r.toLowerCase().includes(q));
        return matchesPlate || matchesTransporter || matchesDriver || matchesState || matchesCity || matchesModel || matchesRoute;
      }

      return true;
    });
  }, [vehicles, selectedZone, selectedState, selectedDistrict, selectedServiceType, selectedStatus, searchQuery]);

  // Quick stats
  const totalVehicles = vehicles?.length || 0;
  const availableCount = vehicles?.filter(v => v.currentStatus === 'Available').length || 0;
  const onTripCount = vehicles?.filter(v => v.currentStatus === 'On Trip').length || 0;
  const statesCoveredCount = useMemo(() => {
    const s = new Set((vehicles || []).map(v => v.state));
    return s.size;
  }, [vehicles]);

  const handleOpenBooking = (vehicle: VehicleDetails, demo: boolean = false) => {
    setBookingVehicle(vehicle);
    setPickupLocation(vehicle.originHub || `${vehicle.cityHub || vehicle.state} Aggregation Hub`);
    setDropLocation(vehicle.destinationWarehouse || 'Destination APMC Mandi / Food Depot');
    setBookingSuccess(false);
    setIsDemoMode(demo);
  };

  const handleOpenDemoBooking = () => {
    const defaultVehicle = vehicles?.[0] || {
      id: 'veh_demo_1',
      vehicleNo: 'MH-15-EG-4412',
      vehicleType: 'Multi-Axle Heavy Hauler',
      modelName: 'Tata Signa 4825.TK (28-Ton)',
      capacityTons: 28,
      ratePerKm: 26,
      currentStatus: 'Available',
      originHub: 'Nashik Pimpalgaon Hub',
      destinationWarehouse: 'Mumbai Vashi APMC Mandi',
      driverName: 'Rameshwar Shinde',
      driverPhone: '+91 98231 44512',
      transporterName: 'Maharashtra State Agro Logistics',
      state: 'Maharashtra',
      cityHub: 'Nashik',
      isRefrigerated: true
    } as VehicleDetails;

    handleOpenBooking(defaultVehicle, true);
    setCargoWeightTons(12);
    setCropName('Nashik Red Onion (ताज़ा प्याज़)');
    setEstimatedDistanceKm(165);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingVehicle) return;

    setIsSendingSms(true);
    const rate = bookingVehicle.ratePerKm || 28;
    const totalCost = Math.round(estimatedDistanceKm * rate);
    const cleanPhone = userMobileNumber.replace(/\D/g, '').slice(-10) || '9876543210';

    const smsMessage = `Successful Granted! Farm2Future Agri-Transport confirmed for vehicle ${bookingVehicle.vehicleNo}. Driver: ${bookingVehicle.driverName} (${bookingVehicle.driverPhone}). Route: ${pickupLocation} to ${dropLocation}. Fare: Rs ${totalCost.toLocaleString('en-IN')}.`;

    // Add activity log
    logActivity({
      actionType: 'transport_booking',
      title: `Transport Booked: ${bookingVehicle.vehicleNo} (${bookingVehicle.state})`,
      description: `${currentUser.name} booked ${bookingVehicle.modelName || bookingVehicle.vehicleType} from ${pickupLocation} to ${dropLocation} for ${cargoWeightTons}T ${cropName}. SMS target: +91 ${cleanPhone}. Est. Fare: ₹${totalCost.toLocaleString('en-IN')}`,
      metadata: {
        vehicleNo: bookingVehicle.vehicleNo,
        transporter: bookingVehicle.transporterName,
        driver: bookingVehicle.driverName,
        driverPhone: bookingVehicle.driverPhone,
        customerPhone: cleanPhone,
        pickupLocation,
        dropLocation,
        cargoWeightTons,
        cropName,
        estimatedCost: totalCost,
        bookingDate,
        isDemoBooking: isDemoMode
      }
    });

    // Notify inside app
    addNotification({
      title: '✅ Transport Booking Successful Granted!',
      message: `Vehicle ${bookingVehicle.vehicleNo} confirmed for ${cropName}. Confirmation SMS dispatched to +91 ${cleanPhone}. Driver ${bookingVehicle.driverName} (${bookingVehicle.driverPhone}) assigned.`,
      type: 'dispatch',
      recipientRole: 'all'
    });

    const callmebotKey = typeof window !== 'undefined' ? (localStorage.getItem('f2f_callmebot_api_key') || undefined) : undefined;


    // Call real SMS Gateway API endpoint with CallMeBot support
    let apiDelivery: any = null;
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: smsMessage,
          vehicleNo: bookingVehicle.vehicleNo,
          driverName: bookingVehicle.driverName,
          driverPhone: bookingVehicle.driverPhone,
          origin: pickupLocation,
          destination: dropLocation,
          cost: totalCost,
          callmebotApiKey: callmebotKey
        })
      });
      apiDelivery = await res.json();
      setSmsDeliveryStatus(apiDelivery);
    } catch (err: any) {
      apiDelivery = { success: false, simulated: true, error: err.message };
      setSmsDeliveryStatus(apiDelivery);
    } finally {
      setIsSendingSms(false);
    }

    // Play chime sound
    playSmsChime();

    // Trigger native OS system notification (Windows / Android push alert)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('✅ Successful Granted! (Farm2Future)', {
            body: `Vehicle ${bookingVehicle.vehicleNo} confirmed. Driver: ${bookingVehicle.driverName} (${bookingVehicle.driverPhone}). Est Fare: ₹${totalCost.toLocaleString('en-IN')}`,
            icon: '/favicon.ico'
          });
        } catch (_) {}
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            try {
              new Notification('✅ Successful Granted! (Farm2Future)', {
                body: `Vehicle ${bookingVehicle.vehicleNo} confirmed. Driver: ${bookingVehicle.driverName} (${bookingVehicle.driverPhone}). Est Fare: ₹${totalCost.toLocaleString('en-IN')}`,
                icon: '/favicon.ico'
              });
            } catch (_) {}
          }
        }).catch(() => {});
      }
    }

    // Trigger floating phone SMS notification
    setSmsNotification({
      show: true,
      phone: cleanPhone,
      vehicleNo: bookingVehicle.vehicleNo,
      driverName: bookingVehicle.driverName,
      driverPhone: bookingVehicle.driverPhone,
      origin: pickupLocation,
      destination: dropLocation,
      cost: totalCost,
      cropName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveredReal: Boolean(apiDelivery?.provider === 'fast2sms' && apiDelivery?.success),
      provider: apiDelivery?.provider || 'simulation',
      error: apiDelivery?.error
    });

    setBookingSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* 📲 LIVE REAL & SIMULATED SMS PUSH NOTIFICATION TOAST */}
      {smsNotification && smsNotification.show && (() => {
        const smsBodyText = `✅ *Successful Granted! (Farm2Future Agri-Transport)*\n\n` +
          `🚚 *Vehicle:* ${smsNotification.vehicleNo}\n` +
          `👤 *Driver:* ${smsNotification.driverName} (${smsNotification.driverPhone})\n` +
          `📍 *Trip:* ${smsNotification.origin} ➔ ${smsNotification.destination}\n` +
          `🌾 *Produce:* ${smsNotification.cropName}\n` +
          `💰 *Est Fare:* ₹${smsNotification.cost.toLocaleString('en-IN')}\n\n` +
          `Thank you for booking through Farm2Future Agri-Transport.`;
        const nativeSmsUrl = `sms:+91${smsNotification.phone}?body=${encodeURIComponent(smsBodyText.replace(/[*_]/g, ''))}`;

        return (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[94vw] animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
            <div className="bg-slate-950/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-emerald-500/60 space-y-3 ring-4 ring-emerald-500/20">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                    💬
                  </div>
                  <div>
                    <span className="font-extrabold text-emerald-300">MESSAGES</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">• VM-AGRIF2F • {smsNotification.timestamp}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsNotification(null)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">
                    SMS To: <strong className="text-white font-mono">+91 {smsNotification.phone}</strong>
                  </span>
                  {smsNotification.deliveredReal ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-extrabold text-[10px] border border-emerald-400/40 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Real Cellular SMS Sent
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-400/30 uppercase">
                      Simulated Preview
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 font-sans text-slate-100 text-xs leading-relaxed border border-white/10 space-y-1">
                  <p className="font-black text-emerald-300 text-sm flex items-center gap-1.5">
                    <span>✅</span>
                    <span>Successful Granted! (बुकिंग स्वीकृत हुई)</span>
                  </p>
                  <p className="text-slate-200">
                    Your agri-transport booking for vehicle <strong>{smsNotification.vehicleNo}</strong> is confirmed.
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    Driver: <strong>{smsNotification.driverName}</strong> (📞 {smsNotification.driverPhone}).
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    Trip: <em>{smsNotification.origin}</em> ➔ <em>{smsNotification.destination}</em>.
                  </p>
                  <p className="text-amber-300 font-bold text-[11px] pt-0.5">
                    Est. Fare: ₹{smsNotification.cost.toLocaleString('en-IN')}.
                  </p>
                </div>

                {/* Phone SMS Action Button */}
                <div className="pt-1">
                  <a
                    href={nativeSmsUrl}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open Phone SMS App</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="text-amber-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>{gatewayConfig.configured ? 'Gateway: Active' : 'Connect Fast2SMS for Cellular SMS'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSmsNotification(null)}
                  className="text-slate-300 hover:text-white font-bold cursor-pointer"
                >
                  Dismiss (बंद करें)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
              <Truck className="w-6 h-6 text-emerald-600" />
              <span>State Transport & Logistics Directory</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified cold reefers, multi-axle haulers, and express carriers across 24+ states.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenDemoBooking}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>⚡ Demo Booking (SMS टेस्ट)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className={`px-3 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              gatewayConfig.configured 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
            title="Real SMS Gateway Settings"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{gatewayConfig.configured ? '📡 Real SMS Active' : '⚙️ SMS Gateway'}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span>{statesCoveredCount} States • {availableCount} Trucks Available</span>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">All India Fleet</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalVehicles} Vehicles</p>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
            100% VAHAN Verified
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ready for Dispatch</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{availableCount} Available</p>
          <span className="text-[10px] text-slate-500">Instant assignment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cold Chain Reefer</span>
            <Thermometer className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl font-extrabold text-sky-700">
            {vehicles?.filter(v => v.serviceType?.includes('Reefer') || v.vehicleType.includes('Reefer')).length || 0} Sub-Zero Units
          </p>
          <span className="text-[10px] text-slate-500">2°C to 14°C Controlled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Freight Rate</span>
            <span className="text-xs font-bold text-amber-600">₹/KM</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900">₹28.5 / km</p>
          <span className="text-[10px] text-slate-500">Transparent fair pricing</span>
        </div>
      </div>

      {/* State & Zone Selector Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              State Transport Filter & Fleet Explorer
            </h2>
            <p className="text-[11px] text-slate-500">Select your state or zone to view dedicated logistics providers</p>
          </div>

          {/* Zone Selector Chips */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'North Zone', 'West Zone', 'South Zone', 'Central Zone', 'East & NE Zone'].map(zone => (
              <button
                key={zone}
                onClick={() => {
                  setSelectedZone(zone);
                  setSelectedState('All States');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedZone === zone
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search plate, driver, state, hub..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* State Dropdown */}
          <div>
            <select
              value={selectedState}
              onChange={e => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              {ALL_INDIAN_STATES.map(st => (
                <option key={st} value={st}>
                  {st === 'All States' ? '🇮🇳 All States' : `📍 ${st}`}
                </option>
              ))}
            </select>
          </div>

          {/* Dependent District Dropdown (when specific state is chosen) */}
          {selectedState !== 'All States' && (
            <div>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-400 text-xs text-emerald-800 bg-emerald-50/70 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold animate-in fade-in"
              >
                <option value="All">All Districts in {selectedState}</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>🏙️ {d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Service Type */}
          <div>
            <select
              value={selectedServiceType}
              onChange={e => setSelectedServiceType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              <option value="All">All Service Types</option>
              <option value="Reefer">❄️ Reefer Cold Chain</option>
              <option value="Heavy">🚛 Heavy Multi-Axle</option>
              <option value="Express">⚡ Express Mandi Link</option>
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Available">🟢 Available Now</option>
              <option value="On Trip">🔵 On Trip (In-Transit)</option>
              <option value="Loading">🟡 Loading Bay</option>
            </select>
          </div>
        </div>

        {/* State Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Popular States:</span>
          {['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'West Bengal', 'Bihar', 'Andhra Pradesh'].map(st => (
            <button
              key={st}
              onClick={() => {
                setSelectedState(st);
                setSelectedZone('All');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedState === st
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* State Transport Fleet Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{filteredVehicles.length}</strong> state transport vehicles</span>
          {selectedState !== 'All States' && (
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Filter: {selectedState}
            </span>
          )}
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
            <Truck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No state transport vehicles found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No vehicles matched your filter criteria for state, zone, or service type. Try resetting filters to see all available fleets across India.
            </p>
            <button
              onClick={() => {
                setSelectedState('All States');
                setSelectedZone('All');
                setSelectedServiceType('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map(veh => (
              <div 
                key={veh.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges: State & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {veh.state}
                      </span>
                      {veh.cityHub && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {veh.cityHub} Hub
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      veh.currentStatus === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : veh.currentStatus === 'On Trip'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {veh.currentStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Vehicle Plate & Model Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-base font-black text-slate-900 tracking-wider flex items-center gap-1.5">
                        <span>{veh.vehicleNo}</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-0.5">
                          <Bot className="w-2.5 h-2.5 text-indigo-600" /> AI Auto-Match
                        </span>
                      </h3>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        <span>{veh.rating || 4.9}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{veh.modelName || veh.vehicleType}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                      <strong className="text-slate-800 font-semibold">{veh.transporterName}</strong>
                    </p>
                  </div>

                  {/* Telemetry & Specifications Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Capacity</span>
                      <strong className="text-xs font-extrabold text-slate-900">{veh.capacityTons} Tons</strong>
                    </div>
                    <div className="border-x border-slate-200 px-1">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Temp Reg.</span>
                      <strong className="text-xs font-extrabold text-emerald-700 flex items-center justify-center gap-0.5">
                        <Thermometer className="w-3 h-3 text-emerald-600" />
                        {veh.temperatureCelsius || 14}°C
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Freight Rate</span>
                      <strong className="text-xs font-extrabold text-slate-900">₹{veh.ratePerKm || 28}/km</strong>
                    </div>
                  </div>

                  {/* Operating Routes */}
                  {veh.operatingRoutes && veh.operatingRoutes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Corridors Served:</span>
                      <div className="flex flex-wrap gap-1">
                        {veh.operatingRoutes.map(rt => (
                          <span key={rt} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {rt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Trip Snippet (if on trip) */}
                  {veh.activeTrip && (
                    <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
                          Live Highway Trip:
                        </span>
                        <span>{veh.activeTrip.coveredDistanceKm} / {veh.activeTrip.totalDistanceKm} km</span>
                      </div>
                      <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(((veh.activeTrip.coveredDistanceKm || 0) / (veh.activeTrip.totalDistanceKm || 100)) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-blue-700">
                        <span>Speed: {veh.activeTrip.currentSpeedKmph} km/h</span>
                        <span>ETA: ~{veh.activeTrip.estimatedMinutesRemaining} mins</span>
                      </div>
                    </div>
                  )}

                  {/* Driver & Contact info */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Assigned Driver</span>
                      <strong className="text-slate-800 text-[11px]">{veh.driverName}</strong>
                    </div>
                    <a
                      href={`tel:${veh.driverPhone}`}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 transition-colors"
                      title="Call Driver Directly"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{veh.driverPhone}</span>
                    </a>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenBooking(veh)}
                    disabled={veh.currentStatus === 'Under Maintenance'}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      veh.currentStatus === 'Available'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Book Vehicle</span>
                  </button>

                  {veh.activeTrip && (
                    <button
                      onClick={() => {
                        setActiveTrackingOrderId(veh.activeTrip?.orderId || '');
                        setActiveTab('track_delivery');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Track Live Highway Telemetry"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Booking Modal */}
      {bookingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Book State Transport Vehicle</h3>
                  <p className="text-xs text-slate-500">{bookingVehicle.state} • {bookingVehicle.vehicleNo}</p>
                </div>
              </div>
              <button
                onClick={() => setBookingVehicle(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (() => {
              const cleanPhone = userMobileNumber.replace(/\D/g, '').slice(-10);
              const estFare = Math.round(estimatedDistanceKm * (bookingVehicle.ratePerKm || 28));
              const smsBodyText = `✅ *Successful Granted! (Farm2Future Agri-Transport)*\n\n` +
                `🚚 *Vehicle:* ${bookingVehicle.vehicleNo}\n` +
                `👤 *Driver:* ${bookingVehicle.driverName} (${bookingVehicle.driverPhone})\n` +
                `📍 *Trip:* ${pickupLocation} ➔ ${dropLocation}\n` +
                `🌾 *Produce:* ${cargoWeightTons}T ${cropName}\n` +
                `💰 *Est Fare:* ₹${estFare.toLocaleString('en-IN')}\n\n` +
                `Thank you for using Farm2Future Agri-Logistics.`;
              const nativeSmsUrl = `sms:+91${cleanPhone}?body=${encodeURIComponent(smsBodyText.replace(/[*_]/g, ''))}`;

              return (
                <div className="p-6 text-center space-y-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 shadow-sm animate-in fade-in">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-sm inline-block">
                      ✅ Successful Granted! (बुकिंग स्वीकृत हुई)
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-2">
                      {isDemoMode ? 'Demo Transport Booking Granted' : 'Agri-Transport Booked & Dispatched'}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Confirmation message target: <strong className="text-emerald-800 font-mono">+91 {userMobileNumber}</strong>
                    </p>
                  </div>

                  {/* Real Gateway vs Simulation Delivery Badge */}
                  <div className="p-2.5 rounded-xl border text-xs text-left">
                    {smsDeliveryStatus?.delivered ? (
                      <div className="flex items-center gap-2 text-emerald-800 bg-emerald-100/70 p-2 rounded-lg font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>📡 Real SMS Delivered to your phone via Fast2SMS Gateway!</span>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-700 bg-white/70 p-2.5 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 text-slate-900">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>SMS Mode: On-Screen Simulation</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowConfigModal(true)}
                            className="text-emerald-700 font-extrabold hover:underline text-[11px] cursor-pointer"
                          >
                            + Connect Real Fast2SMS
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          अगर आप फोन पर तुरंत मैसेज चाहते हैं, तो नीचे <strong>Open Phone SMS App</strong> बटन दबाएं!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Native Mobile SMS Direct Action Button */}
                  <div className="pt-0.5">
                    <a
                      href={nativeSmsUrl}
                      className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] w-full"
                    >
                      <Smartphone className="w-4 h-4 text-sky-200" />
                      <span>Open Phone SMS App</span>
                    </a>
                  </div>

                  {/* Dispatch Details Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-emerald-200 text-left text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500">Vehicle No:</span>
                      <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{bookingVehicle.vehicleNo}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500">Driver Contact:</span>
                      <strong className="text-slate-900">{bookingVehicle.driverName} (<a href={`tel:${bookingVehicle.driverPhone}`} className="text-emerald-700 underline font-mono">{bookingVehicle.driverPhone}</a>)</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500">Transporter:</span>
                      <strong className="text-slate-900">{bookingVehicle.transporterName}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500">Trip Route:</span>
                      <strong className="text-slate-900 truncate max-w-[220px]">{pickupLocation} ➔ {dropLocation}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 border-t border-slate-100 pt-1.5">
                      <span className="text-slate-500">Estimated Fare:</span>
                      <strong className="text-emerald-700 font-bold text-sm">₹{estFare.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={`tel:${bookingVehicle.driverPhone}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Call Driver Now</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingVehicle(null);
                        setBookingSuccess(false);
                        setIsDemoMode(false);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                    >
                      Done (समाप्त)
                    </button>
                  </div>
                </div>
              );
            })() : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                {/* Vehicle Details Card */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Model & Type</span>
                    <strong className="text-slate-800">{bookingVehicle.modelName || bookingVehicle.vehicleType}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Transporter</span>
                    <strong className="text-slate-800">{bookingVehicle.transporterName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Driver</span>
                    <strong className="text-slate-800">{bookingVehicle.driverName} ({bookingVehicle.driverPhone})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Freight Rate</span>
                    <strong className="text-emerald-700 font-bold">₹{bookingVehicle.ratePerKm || 28} / KM</strong>
                  </div>
                </div>

                {/* Pickup & Drop Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pickup Hub / Origin Farm
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nashik North Hub / Farm Gate"
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Drop Location / Destination Warehouse
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vashi APMC Mandi / Delhi Azadpur"
                      value={dropLocation}
                      onChange={e => setDropLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Produce / Crop Type
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Red Onion / Wheat"
                        value={cropName}
                        onChange={e => setCropName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Cargo Weight (Tons)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={bookingVehicle.capacityTons}
                        value={cargoWeightTons}
                        onChange={e => setCargoWeightTons(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Estimated Distance (Km)
                      </label>
                      <input
                        type="number"
                        min="10"
                        value={estimatedDistanceKm}
                        onChange={e => setEstimatedDistanceKm(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Required Loading Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile Number for SMS Notification */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <label className="block font-bold text-slate-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Mobile Number for SMS (मोबाइल नंबर दर्ज करें) *</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        ● Instant SMS "Successful Granted"
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-bold text-slate-600 text-xs select-none font-mono">🇮🇳 +91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={userMobileNumber}
                        onChange={e => setUserMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-16 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      इस नंबर पर बुकिंग होते ही <strong>"Successful Granted!"</strong> और ड्राइवर के फोन नंबर का लाइव SMS भेजा जाएगा।
                    </p>
                  </div>

                  {/* Cost Calculation Bar */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-800 uppercase font-bold block">Estimated Freight Cost</span>
                      <span className="text-xs text-slate-500">{estimatedDistanceKm} km × ₹{bookingVehicle.ratePerKm || 28}/km</span>
                    </div>
                    <strong className="text-lg font-extrabold text-emerald-800">
                      ₹{Math.round(estimatedDistanceKm * (bookingVehicle.ratePerKm || 28)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingVehicle(null);
                      setIsDemoMode(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingSms}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSendingSms ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending SMS & Booking...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isDemoMode ? 'Send Demo Booking & SMS' : 'Confirm Booking'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ⚙️ REAL SMS GATEWAY (FAST2SMS) CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Real Cellular SMS Gateway</h3>
                  <p className="text-[11px] text-slate-500">Fast2SMS (India Telecom Quick SMS API)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  setSaveKeyMessage('');
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className={`p-3 rounded-2xl border ${gatewayConfig.configured ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className={`w-2 h-2 rounded-full ${gatewayConfig.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>Gateway Status: {gatewayConfig.configured ? `Active (${gatewayConfig.provider.toUpperCase()})` : 'Not Configured (Demo Mode)'}</span>
                </div>
                {gatewayConfig.maskedKey && (
                  <p className="font-mono text-[11px] text-slate-600">Active API Key: {gatewayConfig.maskedKey}</p>
                )}
                <p className="text-[11px] mt-1 leading-relaxed">
                  {gatewayConfig.configured
                    ? 'जब भी आप या कोई किसान/खरीदार बुकिंग करेगा, Fast2SMS गेटवे सीधे उनके फोन के इनबॉक्स में असली SMS पहुंचाएगा।'
                    : 'बिना API Key के केवल ऑन-स्क्रीन सिमुलेशन काम करता है। असली टेलीकॉम SMS पाने के लिए नीचे Fast2SMS API Key डालें।'}
                </p>
              </div>

              <form onSubmit={handleSaveApiKey} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fast2SMS Authorization API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Paste Fast2SMS API Key (e.g. 5x8YkZ...)"
                    value={fast2smsApiKeyInput}
                    onChange={e => setFast2smsApiKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                  <strong className="text-slate-800 block">Fast2SMS की फ्री API Key कैसे लें?</strong>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>
                      <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">
                        fast2sms.com
                      </a> पर फ्री अकाउंट बनाएं।
                    </li>
                    <li>Dashboard ➔ <strong>Dev API</strong> टैब पर जाएं।</li>
                    <li>अपनी <strong>Authorization Key</strong> कॉपी करके यहाँ पेस्ट करें।</li>
                  </ol>
                  <p className="text-[10px] text-slate-400 pt-1">
                    नोट: नए अकाउंट पर Fast2SMS की तरफ से मुफ्त में 50 SMS क्रेडिट मिलते हैं।
                  </p>
                </div>

                {saveKeyMessage && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold ${saveKeyMessage.startsWith('✅') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {saveKeyMessage}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfigModal(false);
                      setSaveKeyMessage('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingKey || !fast2smsApiKeyInput.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSavingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    <span>Save & Activate</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
