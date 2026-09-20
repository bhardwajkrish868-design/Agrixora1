import React, { useState, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import { VehicleDetails } from '../types';
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
  Sparkles
} from 'lucide-react';
import { RouteTripTracker } from '../components/RouteTripTracker';

const ALL_INDIAN_STATES = [
  'All States',
  'Maharashtra',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Gujarat',
  'Rajasthan',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'West Bengal',
  'Bihar',
  'Kerala',
  'Odisha',
  'Assam',
  'Himachal Pradesh',
  'Uttarakhand',
  'Jammu & Kashmir',
  'Jharkhand',
  'Chhattisgarh',
  'Goa',
  'Delhi-NCR'
];

const ZONES: Record<string, string[]> = {
  'North Zone': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir', 'Delhi-NCR'],
  'West Zone': ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'],
  'South Zone': ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala'],
  'Central Zone': ['Madhya Pradesh', 'Chhattisgarh'],
  'East & NE Zone': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand', 'Assam']
};

export const StateTransportDirectoryView: React.FC = () => {
  const { vehicles, currentUser, activeRole, setActiveTab, setActiveTrackingOrderId, addNotification, logActivity, navigateBack } = useAgri();

  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Booking Modal State
  const [bookingVehicle, setBookingVehicle] = useState<VehicleDetails | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [cropName, setCropName] = useState('Wheat / Grains');
  const [cargoWeightTons, setCargoWeightTons] = useState(10);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState(150);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
        const q = searchQuery.toLowerCase().trim();
        const matchesPlate = v.vehicleNo.toLowerCase().includes(q);
        const matchesTransporter = v.transporterName.toLowerCase().includes(q);
        const matchesDriver = v.driverName.toLowerCase().includes(q);
        const matchesState = v.state.toLowerCase().includes(q);
        const matchesCity = (v.cityHub || '').toLowerCase().includes(q);
        const matchesModel = (v.modelName || '').toLowerCase().includes(q);
        const matchesRoute = (v.operatingRoutes || []).some(r => r.toLowerCase().includes(q));

        return matchesPlate || matchesTransporter || matchesDriver || matchesState || matchesCity || matchesModel || matchesRoute;
      }

      return true;
    });
  }, [vehicles, selectedZone, selectedState, selectedServiceType, selectedStatus, searchQuery]);

  // Quick stats
  const totalVehicles = vehicles?.length || 0;
  const availableCount = vehicles?.filter(v => v.currentStatus === 'Available').length || 0;
  const onTripCount = vehicles?.filter(v => v.currentStatus === 'On Trip').length || 0;
  const statesCoveredCount = useMemo(() => {
    const s = new Set((vehicles || []).map(v => v.state));
    return s.size;
  }, [vehicles]);

  const handleOpenBooking = (vehicle: VehicleDetails) => {
    setBookingVehicle(vehicle);
    setPickupLocation(vehicle.originHub || `${vehicle.cityHub || vehicle.state} Aggregation Hub`);
    setDropLocation(vehicle.destinationWarehouse || 'Destination APMC Mandi / Food Depot');
    setBookingSuccess(false);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingVehicle) return;

    const rate = bookingVehicle.ratePerKm || 28;
    const totalCost = Math.round(estimatedDistanceKm * rate);

    // Add activity log
    logActivity({
      actionType: 'transport_booking',
      title: `Transport Booked: ${bookingVehicle.vehicleNo} (${bookingVehicle.state})`,
      description: `${currentUser.name} (${currentUser.role}) booked ${bookingVehicle.modelName || bookingVehicle.vehicleType} from ${pickupLocation} to ${dropLocation} for ${cargoWeightTons}T ${cropName}. Estimated Cost: ₹${totalCost.toLocaleString('en-IN')}`,
      metadata: {
        vehicleNo: bookingVehicle.vehicleNo,
        transporter: bookingVehicle.transporterName,
        driver: bookingVehicle.driverName,
        driverPhone: bookingVehicle.driverPhone,
        pickupLocation,
        dropLocation,
        cargoWeightTons,
        cropName,
        estimatedCost: totalCost,
        bookingDate
      }
    });

    // Notify
    addNotification({
      title: '🚚 State Transport Booking Confirmed!',
      message: `Vehicle ${bookingVehicle.vehicleNo} (${bookingVehicle.transporterName}) booked for ${cropName} from ${pickupLocation} to ${dropLocation}. Driver ${bookingVehicle.driverName} (${bookingVehicle.driverPhone}) will contact you shortly.`,
      type: 'dispatch',
      recipientRole: 'all'
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingVehicle(null);
      setBookingSuccess(false);
    }, 2500);
  };

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
              <Truck className="w-6 h-6 text-emerald-600" />
              <span>State Transport & Logistics Directory</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified cold reefers, multi-axle haulers, and express carriers across 24+ states.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
          <span>{statesCoveredCount} States • {availableCount} Trucks Available</span>
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
              onChange={e => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              {ALL_INDIAN_STATES.map(st => (
                <option key={st} value={st}>
                  {st === 'All States' ? '🇮🇳 All States' : `📍 ${st}`}
                </option>
              ))}
            </select>
          </div>

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

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-emerald-900 text-base">Booking Confirmed Successfully!</h4>
                <p className="text-xs text-emerald-700">
                  Vehicle {bookingVehicle.vehicleNo} has been assigned. Transporter {bookingVehicle.transporterName} and Driver {bookingVehicle.driverName} have been notified.
                </p>
              </div>
            ) : (
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
                    onClick={() => setBookingVehicle(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
