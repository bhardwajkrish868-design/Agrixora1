import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  Building2, 
  PackageSearch, 
  ShieldCheck, 
  Scale, 
  Warehouse, 
  SendHorizontal, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Thermometer, 
  Droplets,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  Navigation,
  FileText,
  BadgeCheck,
  Phone,
  Radio,
  Search,
  Route,
  MapPin
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { QualityInspection, DispatchDetails, VehicleDetails } from '../types';
import { RouteTripTracker } from '../components/RouteTripTracker';
import { ROUTE_PRESETS } from '../utils/routeUtils';

export const CollectionCentreView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    collectionHubs, 
    saveQualityInspection, 
    dispatchOrder, 
    updateOrderStage,
    vehicles,
    addVehicle,
    updateVehicle,
    activeTab,
    setActiveTab,
    setActiveTrackingOrderId,
    navigateBack
  } = useAgri();

  const [activeSubTab, setActiveSubTab] = useState<'incoming' | 'verification' | 'storage' | 'dispatch' | 'fleet'>(() => {
    if (['incoming', 'verification', 'storage', 'dispatch', 'fleet'].includes(activeTab)) {
      return activeTab as any;
    }
    return 'incoming';
  });

  React.useEffect(() => {
    if (['incoming', 'verification', 'storage', 'dispatch', 'fleet'].includes(activeTab)) {
      setActiveSubTab(activeTab as any);
    }
  }, [activeTab]);

  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[1]?.id || orders[0]?.id || '');

  // Quality Inspection Form State
  const [qcInspector, setQcInspector] = useState(currentUser.name || 'Suresh Verma');
  const [qcMoisture, setQcMoisture] = useState(11.8);
  const [qcForeignMatter, setQcForeignMatter] = useState(0.2);
  const [qcVisualScore, setQcVisualScore] = useState(96);
  const [qcGrade, setQcGrade] = useState<'Grade A+' | 'Grade A' | 'Grade B' | 'Organic Certified' | 'Fair'>('Grade A+');
  const [qcNotes, setQcNotes] = useState('Clean lot, uniform size, zero pest infestation. Certified for immediate distribution.');

  // Dispatch Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [transporterName, setTransporterName] = useState(vehicles[0]?.transporterName || 'GreenWheels Cold Agri-Logistics');
  const [driverName, setDriverName] = useState(vehicles[0]?.driverName || 'Prakash Shinde');
  const [driverPhone, setDriverPhone] = useState(vehicles[0]?.driverPhone || '+91 99223 34455');
  const [driverLicenseNo, setDriverLicenseNo] = useState(vehicles[0]?.driverLicenseNo || 'MH-1520190045123');
  const [vehicleNo, setVehicleNo] = useState(vehicles[0]?.vehicleNo || 'MH-15-EG-4401');
  const [vehicleType, setVehicleType] = useState(vehicles[0]?.vehicleType || '12-Ton Insulated Cold Reefer');
  const [modelName, setModelName] = useState(vehicles[0]?.modelName || 'Eicher Pro 3015 Reefer Plus');
  const [capacityTons, setCapacityTons] = useState<number>(vehicles[0]?.capacityTons || 12.0);
  const [rcNumber, setRcNumber] = useState(vehicles[0]?.rcNumber || 'RC-MH-15-2022-004401');
  const [gpsDeviceId, setGpsDeviceId] = useState(vehicles[0]?.gpsDeviceId || 'GPS-GW-8821');
  const [tempCelsius, setTempCelsius] = useState(vehicles[0]?.temperatureCelsius || 14.0);
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('nashik_mumbai');
  const [routeHighway, setRouteHighway] = useState<string>(ROUTE_PRESETS['nashik_mumbai'].routeHighway);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(ROUTE_PRESETS['nashik_mumbai'].totalDistanceKm);

  // Add Vehicle Modal / Form State
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehPlate, setNewVehPlate] = useState('');
  const [newVehTransporter, setNewVehTransporter] = useState('');
  const [newVehType, setNewVehType] = useState('12-Ton Insulated Cold Reefer');
  const [newVehModel, setNewVehModel] = useState('');
  const [newVehCapacity, setNewVehCapacity] = useState('10.0');
  const [newVehState, setNewVehState] = useState('Maharashtra');
  const [newVehCityHub, setNewVehCityHub] = useState('Nashik');
  const [newVehDriverName, setNewVehDriverName] = useState('');
  const [newVehDriverPhone, setNewVehDriverPhone] = useState('');
  const [newVehDriverLicense, setNewVehDriverLicense] = useState('');
  const [newVehRcNo, setNewVehRcNo] = useState('');
  const [newVehGpsId, setNewVehGpsId] = useState('');
  const [newVehTemp, setNewVehTemp] = useState('14.0');
  const [vehicleAddedMsg, setVehicleAddedMsg] = useState(false);

  const [qcSuccessMsg, setQcSuccessMsg] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [dispatchStateFilter, setDispatchStateFilter] = useState('All');
  const [fleetStateFilter, setFleetStateFilter] = useState('All');

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];
  const activeHub = collectionHubs[0];

  const incomingOrders = orders.filter(o => o.currentStage === 'order_placed' || o.currentStage === 'collected_at_hub');
  const readyForDispatch = orders.filter(o => o.currentStage === 'quality_verified');

  // When selected vehicle changes in dispatch dropdown, auto-fill details
  const handleSelectVehicleForDispatch = (vehId: string) => {
    setSelectedVehicleId(vehId);
    const found = vehicles.find(v => v.id === vehId);
    if (found) {
      setVehicleNo(found.vehicleNo);
      setTransporterName(found.transporterName);
      setDriverName(found.driverName);
      setDriverPhone(found.driverPhone);
      setDriverLicenseNo(found.driverLicenseNo || '');
      setVehicleType(found.vehicleType);
      setModelName(found.modelName || '');
      setCapacityTons(found.capacityTons);
      setRcNumber(found.rcNumber || '');
      setGpsDeviceId(found.gpsDeviceId || '');
      setTempCelsius(found.temperatureCelsius || 14.0);
    }
  };

  const handleRouteChange = (key: string) => {
    setSelectedRouteKey(key);
    if (ROUTE_PRESETS[key]) {
      setRouteHighway(ROUTE_PRESETS[key].routeHighway);
      setTotalDistanceKm(ROUTE_PRESETS[key].totalDistanceKm);
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehPlate || !newVehDriverName) return;

    addVehicle({
      vehicleNo: newVehPlate,
      transporterName: newVehTransporter || 'Direct Agri Transport',
      vehicleType: newVehType,
      modelName: newVehModel || 'Commercial Agri Carrier',
      capacityTons: Number(newVehCapacity) || 10.0,
      state: newVehState,
      cityHub: newVehCityHub || newVehState,
      driverName: newVehDriverName,
      driverPhone: newVehDriverPhone || '+91 98765 00000',
      driverLicenseNo: newVehDriverLicense || ('DL-' + Math.floor(10000000 + Math.random() * 90000000)),
      rcNumber: newVehRcNo || ('RC-' + newVehPlate),
      gpsDeviceId: newVehGpsId || ('GPS-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
      temperatureCelsius: Number(newVehTemp) || 14.0,
      currentStatus: 'Available',
      originHub: activeHub.name,
      insuranceValidity: 'Valid Till 2028',
      serviceType: newVehType.includes('Reefer') ? 'Reefer Cold Chain' : 'Express Mandi Link',
      ratePerKm: 28,
      rating: 4.9,
      verifiedTransporter: true
    });

    setVehicleAddedMsg(true);
    setTimeout(() => {
      setVehicleAddedMsg(false);
      setIsAddVehicleOpen(false);
      setNewVehPlate('');
      setNewVehTransporter('');
      setNewVehModel('');
      setNewVehDriverName('');
      setNewVehDriverPhone('');
      setNewVehDriverLicense('');
      setNewVehRcNo('');
      setNewVehGpsId('');
    }, 2000);
  };

  const handleRunQualityInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const inspection: QualityInspection = {
      inspectorName: qcInspector,
      hubId: activeHub.id,
      hubName: activeHub.name,
      inspectedAt: new Date().toISOString(),
      moisturePercent: Number(qcMoisture),
      foreignMatterPercent: Number(qcForeignMatter),
      pestInfestationPercent: 0.0,
      assignedGrade: qcGrade,
      visualQualityScore: Number(qcVisualScore),
      notes: qcNotes,
      certificateId: 'QC-CERT-MH-' + Math.floor(1000 + Math.random() * 9000),
      passed: true
    };

    saveQualityInspection(selectedOrder.id, inspection);
    setQcSuccessMsg(true);
    setTimeout(() => setQcSuccessMsg(false), 4000);
  };

  const handleDispatchFleet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const dispatch: DispatchDetails = {
      transporterName,
      driverName,
      driverPhone,
      driverLicenseNo,
      vehicleNo: vehicleNo.toUpperCase().trim(),
      vehicleType,
      modelName,
      capacityTons,
      rcNumber,
      gpsDeviceId,
      eWayBillNo: 'EWB-2026-' + Math.floor(10000000 + Math.random() * 90000000),
      dispatchedAt: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 2 * 86400000).toISOString(),
      temperatureCelsius: Number(tempCelsius),
      gpsLiveLat: 19.9975,
      gpsLiveLng: 73.7898,
      originHub: activeHub.name,
      destinationWarehouse: selectedOrder.deliveryAddress,
      routeHighway,
      totalDistanceKm: Number(totalDistanceKm) || 165,
      coveredDistanceKm: 0,
      currentSpeedKmph: 48
    };

    dispatchOrder(selectedOrder.id, dispatch);
    setDispatchSuccessMsg(true);
    setTimeout(() => setDispatchSuccessMsg(false), 4000);
  };

  const filteredVehicles = vehicles.filter(v => {
    if (fleetStateFilter !== 'All' && v.state !== fleetStateFilter) return false;
    const q = vehicleSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      v.vehicleNo.toLowerCase().includes(q) ||
      v.transporterName.toLowerCase().includes(q) ||
      v.driverName.toLowerCase().includes(q) ||
      (v.modelName && v.modelName.toLowerCase().includes(q)) ||
      (v.driverPhone && v.driverPhone.includes(q)) ||
      (v.state && v.state.toLowerCase().includes(q)) ||
      (v.cityHub && v.cityHub.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Hub Header */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-amber-200 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {activeHub.code}
                </span>
                <span className="text-xs text-amber-100">{activeHub.district}, {activeHub.state}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                {activeHub.name}
              </h1>
              <p className="text-amber-100 text-xs sm:text-sm">
                Calibrated weighbridge intake, spectral QC grading, aerated silo storage, and GPS cold fleet dispatch hub.
              </p>
            </div>
          </div>

          {/* Quick Hub Metrics Pill */}
          <div className="flex flex-wrap gap-2.5 bg-black/30 p-3 rounded-2xl backdrop-blur-xs border border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-slate-300 block">Occupancy</span>
              <span className="font-extrabold text-amber-300">{activeHub.currentOccupancyTons} / {activeHub.capacityTons} Tons</span>
            </div>
            <div className="border-l border-white/20 pl-2.5">
              <span className="text-[10px] text-slate-300 block">Hub Cold Temp</span>
              <span className="font-extrabold text-emerald-300">{activeHub.temperatureCelsius}°C</span>
            </div>
            <div className="border-l border-white/20 pl-2.5">
              <span className="text-[10px] text-slate-300 block">Fleet Active</span>
              <span className="font-extrabold text-white">{vehicles.length} Vehicles</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Incoming In Queue"
          value={incomingOrders.length}
          subtitle="Awaiting Hub Weighing & QA"
          icon={PackageSearch}
          colorScheme="amber"
          onClick={() => setActiveSubTab('incoming')}
        />

        <StatCard
          title="Ready For Dispatch"
          value={readyForDispatch.length}
          subtitle="QC Passed & Graded"
          icon={ShieldCheck}
          colorScheme="emerald"
          onClick={() => setActiveSubTab('verification')}
        />

        <StatCard
          title="Cold Storage Temp"
          value={`${activeHub.temperatureCelsius} C`}
          subtitle={`Humidity: ${activeHub.humidityPercent}%`}
          icon={Thermometer}
          colorScheme="blue"
          onClick={() => setActiveSubTab('storage')}
        />

        <StatCard
          title="Fleet & Vehicles"
          value={`${vehicles.length} Registered`}
          subtitle={`${vehicles.filter(v => v.currentStatus === 'Available').length} Ready for Loading`}
          icon={Truck}
          colorScheme="purple"
          onClick={() => setActiveSubTab('fleet')}
        />
      </div>

      {/* Operations Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'incoming', label: 'Incoming Produce Intake', icon: PackageSearch, count: incomingOrders.length },
          { id: 'verification', label: 'QC Lab & Grading', icon: ShieldCheck },
          { id: 'storage', label: 'Storage & Chamber Status', icon: Warehouse },
          { id: 'dispatch', label: 'Fleet Dispatch Manager', icon: SendHorizontal, count: readyForDispatch.length },
          { id: 'fleet', label: 'Fleet & Vehicle Registry', icon: Truck, count: vehicles.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shrink-0 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-amber-400 text-slate-900 font-bold' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 5: Fleet & Vehicle Registry */}
      {activeSubTab === 'fleet' && (
        <div className="space-y-6">
          {/* Top Actions & KPI Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                Hub Logistics Fleet & Asset Registry
              </h2>
              <p className="text-xs text-slate-500">
                Manage cold reefer vans, driver compliance, RC papers, and real-time transit telemetry
              </p>
            </div>

            <button
              onClick={() => setIsAddVehicleOpen(!isAddVehicleOpen)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-700/20 self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAddVehicleOpen ? 'Close Form' : '+ Add New Vehicle'}</span>
            </button>
          </div>

          {/* Add New Vehicle Collapsible Form */}
          {isAddVehicleOpen && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                    Register New Logistics Vehicle & Driver
                  </h3>
                  <p className="text-xs text-slate-400">Add vehicle specification, driver credentials, and telemetry device</p>
                </div>
              </div>

              {vehicleAddedMsg && (
                <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Vehicle registered successfully into the fleet database!</span>
                </div>
              )}

              <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Vehicle Plate Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MH-15-EG-4401"
                      value={newVehPlate}
                      onChange={e => setNewVehPlate(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Transporter / Agency Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GreenWheels Cold Logistics"
                      value={newVehTransporter}
                      onChange={e => setNewVehTransporter(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Model & Make</label>
                    <input
                      type="text"
                      placeholder="e.g. Eicher Pro 3015 Reefer Plus"
                      value={newVehModel}
                      onChange={e => setNewVehModel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Registered State *</label>
                    <select
                      value={newVehState}
                      onChange={e => setNewVehState(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      {['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'West Bengal', 'Bihar', 'Kerala', 'Odisha', 'Assam', 'Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir', 'Jharkhand', 'Chhattisgarh', 'Goa', 'Delhi-NCR'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Base Regional City / Hub</label>
                    <input
                      type="text"
                      placeholder="e.g. Nashik / Ludhiana"
                      value={newVehCityHub}
                      onChange={e => setNewVehCityHub(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Vehicle Body Type</label>
                    <select
                      value={newVehType}
                      onChange={e => setNewVehType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="12-Ton Insulated Cold Reefer">12-Ton Insulated Cold Reefer</option>
                      <option value="16-Ton Multi-Axle Grain Reefer">16-Ton Multi-Axle Grain Reefer</option>
                      <option value="8-Ton Insulated Medium Carrier">8-Ton Insulated Medium Carrier</option>
                      <option value="14-Ton Sub-Zero Cold Van">14-Ton Sub-Zero Cold Van</option>
                      <option value="10-Ton Heavy Duty Grain Transporter">10-Ton Heavy Duty Grain Transporter</option>
                      <option value="25-Ton Multi-Axle Heavy Freight">25-Ton Multi-Axle Heavy Freight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Carrying Capacity (Tons) *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="12.0"
                      value={newVehCapacity}
                      onChange={e => setNewVehCapacity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Assigned Driver Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prakash Shinde"
                      value={newVehDriverName}
                      onChange={e => setNewVehDriverName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Driver Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 99223 34455"
                      value={newVehDriverPhone}
                      onChange={e => setNewVehDriverPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Driver License No (DL)</label>
                    <input
                      type="text"
                      placeholder="e.g. MH-1520190045123"
                      value={newVehDriverLicense}
                      onChange={e => setNewVehDriverLicense(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Vehicle RC Registration No</label>
                    <input
                      type="text"
                      placeholder="e.g. RC-MH-15-2022-004401"
                      value={newVehRcNo}
                      onChange={e => setNewVehRcNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">GPS Telemetry Device ID</label>
                    <input
                      type="text"
                      placeholder="e.g. GPS-GW-8821"
                      value={newVehGpsId}
                      onChange={e => setNewVehGpsId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Default Reefer Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="14.0"
                      value={newVehTemp}
                      onChange={e => setNewVehTemp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddVehicleOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save & Register Vehicle</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* State Filter Pills & Search */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">Filter by State:</span>
              {['All', 'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'West Bengal', 'Bihar', 'Andhra Pradesh', 'Telangana'].map(st => (
                <button
                  key={st}
                  onClick={() => setFleetStateFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    fleetStateFilter === st
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'All' ? '🇮🇳 All States' : st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search vehicles by plate, driver, state, model, or transporter..."
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map(veh => (
              <div key={veh.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {veh.vehicleNo}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        veh.currentStatus === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : veh.currentStatus === 'On Trip'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {veh.currentStatus.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs mt-1">{veh.modelName || veh.vehicleType}</h4>
                    <p className="text-[11px] text-slate-500">{veh.transporterName}</p>
                  </div>

                  <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-semibold">Capacity</span>
                    <strong className="text-slate-900">{veh.capacityTons} Tons</strong>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-semibold">Reefer Temp</span>
                    <strong className="text-emerald-700">{veh.temperatureCelsius || 14.0}°C</strong>
                  </div>
                </div>

                {/* On-Trip Mini Route Progress Bar with Truck Symbol */}
                {veh.currentStatus === 'On Trip' && (
                  <div className="pt-2">
                    <RouteTripTracker
                      dispatchDetails={{
                        vehicleNo: veh.vehicleNo,
                        vehicleType: veh.vehicleType,
                        modelName: veh.modelName,
                        transporterName: veh.transporterName,
                        driverName: veh.driverName,
                        driverPhone: veh.driverPhone,
                        temperatureCelsius: veh.temperatureCelsius || 14.0,
                        gpsDeviceId: veh.gpsDeviceId,
                        originHub: veh.originHub || activeHub.name,
                        destinationWarehouse: veh.destinationWarehouse || 'Regional Mandi Depot',
                        eWayBillNo: 'EWB-2026-LIVE',
                        dispatchedAt: new Date().toISOString(),
                        estimatedArrival: new Date().toISOString(),
                        gpsLiveLat: 19.9975,
                        gpsLiveLng: 73.7898,
                        coveredDistanceKm: veh.activeTrip?.coveredDistanceKm || 88,
                        totalDistanceKm: veh.activeTrip?.totalDistanceKm || 128,
                        routeHighway: veh.activeTrip?.routeHighway || 'NH-44 Freight Corridor'
                      }}
                      compact={true}
                      showControls={false}
                    />
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Driver:</span>
                    <strong className="text-slate-800">{veh.driverName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Phone:</span>
                    <a href={`tel:${veh.driverPhone}`} className="font-mono text-emerald-700 hover:underline flex items-center gap-1 font-bold">
                      <Phone className="w-3 h-3" /> {veh.driverPhone}
                    </a>
                  </div>
                  {veh.driverLicenseNo && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">License:</span>
                      <span className="font-mono text-[10px] text-slate-600">{veh.driverLicenseNo}</span>
                    </div>
                  )}
                  {veh.gpsDeviceId && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">GPS ID:</span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> {veh.gpsDeviceId}
                      </span>
                    </div>
                  )}
                  {veh.rcNumber && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">RC No:</span>
                      <span className="font-mono text-[10px] text-slate-500">{veh.rcNumber}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => {
                      handleSelectVehicleForDispatch(veh.id);
                      setActiveSubTab('dispatch');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SendHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Assign to Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Incoming Produce Intake */}
      {activeSubTab === 'incoming' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-amber-600" />
                Incoming Farmer Harvest Queue
              </h2>
              <p className="text-xs text-slate-500">
                Farmers depositing harvest at Bay #1 - Bay #4 for calibrated weighbridge verification
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">{orders.length} Total Platform Batches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Crop & Variety</th>
                  <th className="py-3 px-4">Booked Qty</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No produce batches in incoming queue.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{order.farmerName}</div>
                        <div className="text-[10px] text-slate-400">{order.farmerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{order.cropName}</div>
                        <div className="text-[10px] text-slate-500">{order.variety}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{order.quantity} {order.unit}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.currentStage === 'order_placed'
                            ? 'bg-amber-100 text-amber-800'
                            : order.currentStage === 'collected_at_hub'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.currentStage.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {order.currentStage === 'order_placed' ? (
                          <button
                            onClick={() => updateOrderStage(order.id, 'collected_at_hub')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Confirm Bay Intake</span>
                          </button>
                        ) : order.currentStage === 'collected_at_hub' ? (
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setActiveSubTab('verification');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Send to QC Lab</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveTrackingOrderId(order.id);
                              setActiveTab('track_delivery');
                            }}
                            className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Track Pipeline</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: QC Lab & Grading */}
      {activeSubTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-emerald-600" />
              Select Batch for Testing
            </h3>
            <div className="space-y-2">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedOrderId === order.id
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{order.cropName}</h4>
                      <p className="text-xs text-slate-500">{order.quantity} {order.unit} • {order.farmerName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.qualityInspection ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.qualityInspection ? 'QC Passed' : 'Awaiting QC'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
            {!selectedOrder ? (
              <div className="py-12 text-center text-slate-400">Select an order batch to run QC lab analysis.</div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-display flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      NABL Calibration & Quality Assessment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Testing batch for: <strong className="text-slate-800">{selectedOrder.orderNumber}</strong> ({selectedOrder.cropName})
                    </p>
                  </div>
                  {selectedOrder.qualityInspection && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Certified: {selectedOrder.qualityInspection.assignedGrade}
                    </span>
                  )}
                </div>

                {qcSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Quality certificate generated and signed! Buyer & Farmer notified in real-time.</span>
                  </div>
                )}

                <form onSubmit={handleRunQualityInspection} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Inspector Name</label>
                      <input
                        type="text"
                        required
                        value={qcInspector}
                        onChange={e => setQcInspector(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Quality Grade *</label>
                      <select
                        value={qcGrade}
                        onChange={e => setQcGrade(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Grade A+">Grade A+ (Premium / Export Grade)</option>
                        <option value="Grade A">Grade A (Standard Good Quality)</option>
                        <option value="Grade B">Grade B (Commercial Grade)</option>
                        <option value="Organic Certified">Organic Certified (Chemical Free)</option>
                        <option value="Fair">Fair Average Quality (FAQ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Moisture Reading (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={qcMoisture}
                        onChange={e => setQcMoisture(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Visual Quality Score (1-100)</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        required
                        value={qcVisualScore}
                        onChange={e => setQcVisualScore(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">QC Certificate Remarks & Notes</label>
                    <textarea
                      rows={2}
                      value={qcNotes}
                      onChange={e => setQcNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Issue Cryptographic Quality Certificate</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Storage & Chamber Status */}
      {activeSubTab === 'storage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-emerald-600" />
              Cold Storage Chamber #1 (Perishables)
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Chamber Temperature:</span>
                <span className="font-extrabold text-emerald-700">{activeHub.temperatureCelsius}°C (Normal)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Relative Humidity:</span>
                <span className="font-bold text-blue-700">{activeHub.humidityPercent}% RH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Occupancy:</span>
                <span className="font-bold text-slate-900">420 / 600 Tons (70%)</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Chamber 1 is designated for high-value perishables including Onions, Tomatoes, and Table Grapes.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-amber-600" />
              Dry Aerated Silos #2 (Grains & Pulses)
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ambient Temperature:</span>
                <span className="font-extrabold text-slate-800">22.4°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aeration Humidity:</span>
                <span className="font-bold text-slate-700">44% RH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Occupancy:</span>
                <span className="font-bold text-slate-900">420 / 600 Tons (70%)</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Silo Section 2 is designated for moisture-controlled storage of Basmati Paddy, Sharbati Wheat, and Soybeans.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Fleet Dispatch Manager */}
      {activeSubTab === 'dispatch' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
          {!selectedOrder ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Truck className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">No Orders Ready for Dispatch</h4>
              <p className="text-xs text-slate-400">Dispatches will be assigned as active orders move through quality inspection.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg font-display flex items-center gap-2">
                    <SendHorizontal className="w-5 h-5 text-emerald-600" />
                    Fleet Loading & Consignment Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign transporter vehicle, calibrate reefer van temperature, and initialize live GPS telemetry
                  </p>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Target: {selectedOrder.orderNumber}
                </span>
              </div>

              {dispatchSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Consignment successfully dispatched! Live GPS telemetry is now broadcasting to the buyer.</span>
                </div>
              )}

              {/* Quick Vehicle Preset Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Select from Registered Fleet Vehicles (Auto-fills all vehicle, driver & RC details)
                  </label>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold">State:</span>
                    <select
                      value={dispatchStateFilter}
                      onChange={e => setDispatchStateFilter(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="All">All States ({vehicles.length})</option>
                      {['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Andhra Pradesh', 'Telangana', 'West Bengal', 'Bihar', 'Kerala', 'Odisha', 'Himachal Pradesh', 'Jammu & Kashmir', 'Delhi-NCR'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  {vehicles
                    .filter(v => dispatchStateFilter === 'All' || v.state === dispatchStateFilter)
                    .map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVehicleForDispatch(v.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedVehicleId === v.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{v.vehicleNo}</span>
                      <span className="text-[10px] opacity-75 font-normal">({v.state} • {v.capacityTons}T • {v.driverName})</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleDispatchFleet} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Order Batch</label>
                    <select
                      value={selectedOrderId}
                      onChange={e => setSelectedOrderId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} - {o.cropName} ({o.quantity} {o.unit}) - Status: {o.currentStage}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Route & Freight Corridor *</label>
                    <select
                      value={selectedRouteKey}
                      onChange={e => handleRouteChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="nashik_mumbai">Maharashtra: NH-60 Mumbai-Nashik Corridor (165 km)</option>
                      <option value="pune_mumbai">Maharashtra: Mumbai-Pune Expressway (148 km)</option>
                      <option value="karnal_delhi">Haryana/NCR: NH-44 Karnal-Delhi Corridor (128 km)</option>
                      <option value="punjab_delhi">Punjab/NCR: NH-44 GT Road Ludhiana-Delhi (310 km)</option>
                      <option value="agra_lucknow">Uttar Pradesh: Agra-Lucknow Expressway (330 km)</option>
                      <option value="indore_bhopal">Madhya Pradesh: SH-18 Indore-Bhopal Corridor (195 km)</option>
                      <option value="gujarat_mumbai">Gujarat/MH: NE-1/NH-48 Ahmedabad-Mumbai (525 km)</option>
                      <option value="karnataka_tamilnadu">South: NH-44/48 Bengaluru-Chennai Corridor (345 km)</option>
                      <option value="rajasthan_delhi">Rajasthan: NH-48 Jaipur-Delhi Pink City (270 km)</option>
                      <option value="andhra_telangana">AP/TS: NH-65 Guntur-Hyderabad Corridor (275 km)</option>
                      <option value="bengal_bihar">East: NH-19 Patna-Kolkata Eastern Corridor (580 km)</option>
                      <option value="himachal_delhi">Himalayan: NH-5/44 Shimla-Delhi Apple Link (340 km)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Plate Number (GPS Enabled) *</label>
                    <input
                      type="text"
                      required
                      value={vehicleNo}
                      onChange={e => setVehicleNo(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Truck Model & Body Type</label>
                    <input
                      type="text"
                      value={modelName || vehicleType}
                      onChange={e => {
                        setModelName(e.target.value);
                        setVehicleType(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Transporter Logistics Agency *</label>
                    <input
                      type="text"
                      required
                      value={transporterName}
                      onChange={e => setTransporterName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Driver Full Name *</label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Driver Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={e => setDriverPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Driver License No (DL)</label>
                    <input
                      type="text"
                      value={driverLicenseNo}
                      onChange={e => setDriverLicenseNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle RC Registration No</label>
                    <input
                      type="text"
                      value={rcNumber}
                      onChange={e => setRcNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GPS Telemetry Unit ID</label>
                    <input
                      type="text"
                      value={gpsDeviceId}
                      onChange={e => setGpsDeviceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reefer Container Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={tempCelsius}
                      onChange={e => setTempCelsius(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Destination Delivery Warehouse</label>
                    <input
                      type="text"
                      disabled
                      value={selectedOrder.deliveryAddress}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch Consignment & Start GPS Telemetry ({totalDistanceKm} km Route)</span>
                </button>
              </form>

              {/* Route Trip Preview */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-xs text-slate-700 flex items-center gap-2">
                  <Route className="w-4 h-4 text-emerald-600" />
                  <span>Route Highway & Waypoint Preview</span>
                </h4>
                <RouteTripTracker
                  dispatchDetails={{
                    vehicleNo: vehicleNo || 'MH-15-EG-4401',
                    vehicleType: modelName || vehicleType,
                    transporterName,
                    driverName,
                    driverPhone,
                    temperatureCelsius: tempCelsius,
                    originHub: activeHub.name,
                    destinationWarehouse: selectedOrder.deliveryAddress,
                    eWayBillNo: 'EWB-PREVIEW',
                    dispatchedAt: new Date().toISOString(),
                    estimatedArrival: new Date().toISOString(),
                    gpsLiveLat: 19.9975,
                    gpsLiveLng: 73.7898,
                    routeHighway,
                    totalDistanceKm,
                    coveredDistanceKm: 0,
                    currentSpeedKmph: 48
                  }}
                  compact={true}
                  showControls={false}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
