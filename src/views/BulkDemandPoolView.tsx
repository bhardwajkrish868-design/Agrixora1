import React, { useState, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import { BulkDemandPool, PoolContribution, QualityGrade, CropCategory } from '../types';
import { ALL_INDIAN_STATES, getDistrictsForState, getDefaultDistrictForState } from '../data/indiaLocations';
import { 
  Boxes, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  FileText, 
  X, 
  Building2, 
  Clock, 
  Sparkles,
  Layers,
  ArrowRight,
  HandCoins,
  Scale,
  SendHorizontal,
  Bot,
  BadgePercent,
  Check,
  Trash2,
  Lock
} from 'lucide-react';

export const BulkDemandPoolView: React.FC = () => {
  const { 
    bulkDemands, 
    addBulkDemand, 
    deleteBulkDemand,
    contributeToBulkDemand, 
    currentUser, 
    activeRole, 
    isAdminAuthenticated,
    setActiveTab, 
    vehicles,
    addNotification,
    language
  } = useAgri();

  // Dynamic 4-Month in Advance Date Calculator
  const now = Date.now();
  const min4MonthDate = new Date(now + 120 * 86400000).toISOString().split('T')[0];
  const defaultDispatchDate = new Date(now + 125 * 86400000).toISOString().split('T')[0];
  const defaultDeadlineDate = new Date(now + 105 * 86400000).toISOString().split('T')[0];

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');

  // Expanded card tracking
  const [expandedPoolId, setExpandedPoolId] = useState<string | null>('pool_wht_500');

  // Supply Submission Modal State (Farmer Receiving / Committing Bulk Order)
  const [supplyModalPool, setSupplyModalPool] = useState<BulkDemandPool | null>(null);
  const [supplyQtyTons, setSupplyQtyTons] = useState<number>(25);
  const [supplyLocation, setSupplyLocation] = useState<string>(currentUser?.location || 'Nashik Farm Cluster');
  const [supplyState, setSupplyState] = useState<string>(currentUser?.state || 'Maharashtra');
  const [supplyDistrict, setSupplyDistrict] = useState<string>(currentUser?.district || 'Nashik');

  // Dependent cascading districts list for supply commitment
  const availableSupplyDistricts = useMemo(() => getDistrictsForState(supplyState), [supplyState]);

  const handleSupplyStateChange = (newState: string) => {
    setSupplyState(newState);
    const def = getDefaultDistrictForState(newState);
    setSupplyDistrict(def);
  };

  const [supplyDispatchDate, setSupplyDispatchDate] = useState<string>(defaultDispatchDate);
  const [supplyGrade, setSupplyGrade] = useState<QualityGrade>('Grade A+');
  const [supplyMoisture, setSupplyMoisture] = useState<number>(11.5);
  const [supplyNotes, setSupplyNotes] = useState<string>('4-month advance pre-harvest commitment. Quality graded and clean lot.');
  const [supplyVehicle, setSupplyVehicle] = useState<string>('');
  const [isSubmittingSupply, setIsSubmittingSupply] = useState(false);
  const [supplySuccessMessage, setSupplySuccessMessage] = useState<string | null>(null);

  // Create New Bulk Demand Modal State (Buyer Creating 4-Month Advance Bulk Demand)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newCategory, setNewCategory] = useState<CropCategory>('Cereals & Grains');
  const [newVariety, setNewVariety] = useState('');
  const [newTargetTons, setNewTargetTons] = useState<number>(500);
  const [newPricePerTon, setNewPricePerTon] = useState<number>(26500);
  const [newDeliveryLocation, setNewDeliveryLocation] = useState('');
  const [newDeliveryCity, setNewDeliveryCity] = useState('');
  const [newDeliveryState, setNewDeliveryState] = useState('Delhi');
  const [newPincode, setNewPincode] = useState('110033');
  const [newDeadline, setNewDeadline] = useState(defaultDeadlineDate);
  const [newDispatchStart, setNewDispatchStart] = useState(defaultDispatchDate);
  const [newGradeReq, setNewGradeReq] = useState<QualityGrade>('Grade A+');
  const [newMoistureLimit, setNewMoistureLimit] = useState<number>(12.0);
  const [newDescription, setNewDescription] = useState('4-Month Advance Pre-Harvest Bulk Contract. Total Escrow pre-funded in advance.');

  // Active Tab Mode: 'open_demands' vs 'my_pledges'
  const [activeViewTab, setActiveViewTab] = useState<'open_demands' | 'my_pledges'>('open_demands');

  // Filter farmer's own pledged commitments across all bulk pools
  const myPledges = useMemo(() => {
    if (!currentUser) return [];
    return bulkDemands.flatMap(pool => 
      (pool.contributions || [])
        .filter(c => 
          c.contributorId === currentUser.id ||
          (currentUser.phone && c.contributorPhone === currentUser.phone) ||
          (currentUser.name && c.contributorName?.toLowerCase().includes(currentUser.name.toLowerCase()))
        )
        .map(c => ({ ...c, pool }))
    );
  }, [bulkDemands, currentUser]);

  const categories = ['All', 'Cereals & Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Spices'];
  const states = ['All', ...ALL_INDIAN_STATES];

  // Filtered Bulk Demands with 100% null-safe property access
  const filteredDemands = bulkDemands.filter(demand => {
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q || 
      (demand.cropName || '').toLowerCase().includes(q) ||
      (demand.variety || '').toLowerCase().includes(q) ||
      (demand.buyerName || '').toLowerCase().includes(q) ||
      (demand.buyerOrg || '').toLowerCase().includes(q) ||
      (demand.demandNumber || '').toLowerCase().includes(q) ||
      (demand.deliveryCity || '').toLowerCase().includes(q) ||
      (demand.deliveryState || '').toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'All' || demand.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || demand.status === selectedStatus;
    const matchesState = selectedState === 'All' || demand.deliveryState === selectedState;

    return matchesSearch && matchesCat && matchesStatus && matchesState;
  });

  // Global pool stats
  const totalTargetTons = bulkDemands.reduce((sum, d) => sum + (d.targetQuantityTons || 0), 0);
  const totalCommittedTons = bulkDemands.reduce((sum, d) => sum + (d.committedQuantityTons || 0), 0);
  const totalEscrowPoolValue = bulkDemands.reduce((sum, d) => sum + (d.totalBudget || (d.targetQuantityTons * d.pricePerTon)), 0);

  // Open Supply Modal with context (Farmers Only)
  const handleOpenSupplyModal = (pool: BulkDemandPool) => {
    if (activeRole === 'buyer' || currentUser?.role === 'buyer') {
      alert(language === 'hi'
        ? '🌾 केवल सत्यापित किसान ही बल्क ऑर्डर में फसल का योगदान कर सकते हैं। खरीददार केवल थोक मांग (Bulk Demand) पोस्ट कर सकते हैं।'
        : '🌾 Only verified farmers can supply produce to bulk demand orders. Buyers can post bulk demand contracts.');
      return;
    }
    setSupplyModalPool(pool);
    const suggestedQty = Math.min(pool.remainingQuantityTons > 0 ? pool.remainingQuantityTons : 25, 50);
    setSupplyQtyTons(suggestedQty);
    setSupplyGrade(pool.qualityGradeRequirement || 'Grade A');
    setSupplyMoisture(pool.moistureLimitPercent || 12.0);
    setSupplyLocation(currentUser?.location || 'Vaishali Farmgate Hub');
    setSupplyState(currentUser?.state || 'Bihar');
    setSupplyDistrict(currentUser?.district || 'Vaishali');
    setSupplyDispatchDate(pool.expectedDispatchStart || defaultDispatchDate);
    setSupplySuccessMessage(null);
  };

  // Submit Supply Form
  const handleSubmitSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplyModalPool) return;

    setIsSubmittingSupply(true);

    setTimeout(() => {
      const result = contributeToBulkDemand(supplyModalPool.id, {
        quantityTons: supplyQtyTons,
        location: supplyLocation,
        state: supplyState,
        district: supplyDistrict,
        expectedDispatchDate: supplyDispatchDate,
        qualityGrade: supplyGrade,
        moisturePercent: supplyMoisture,
        notes: supplyNotes,
        vehicleAssigned: supplyVehicle || undefined
      });

      setIsSubmittingSupply(false);
      if (result) {
        setSupplySuccessMessage(`✅ Success! You have accepted and committed ${supplyQtyTons} Tons to ${supplyModalPool.buyerOrg || supplyModalPool.buyerName}. Guaranteed payout ₹${(supplyQtyTons * supplyModalPool.pricePerTon).toLocaleString('en-IN')} locked in Escrow.`);
      }
    }, 600);
  };

  // Create New 4-Month Advance Bulk Demand
  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTons = Math.max(50, Number(newTargetTons) || 500);
    const pricePerTon = Math.max(1000, Number(newPricePerTon) || 25000);

    addBulkDemand({
      cropName: newCropName,
      category: newCategory,
      variety: newVariety || 'Standard Hybrid',
      targetQuantityTons: targetTons,
      pricePerTon,
      deliveryLocation: newDeliveryLocation || 'Central Fulfilment Silo',
      deliveryCity: newDeliveryCity || 'Delhi NCR',
      deliveryState: newDeliveryState || 'Delhi',
      pincode: newPincode || '110033',
      deadlineDate: newDeadline || defaultDeadlineDate,
      expectedDispatchStart: newDispatchStart || defaultDispatchDate,
      qualityGradeRequirement: newGradeReq,
      moistureLimitPercent: Number(newMoistureLimit) || 12.0,
      description: newDescription || '4-Month Advance Bulk Contract for institutional processing. Direct multi-farmer aggregation.',
      targetTrucksCount: Math.ceil(targetTons / 20)
    });

    setIsCreateModalOpen(false);
    // Reset form
    setNewCropName('');
    setNewVariety('');
    setNewDeliveryLocation('');
    setNewDeliveryCity('');
    alert(`🎉 4-Month Advance Bulk Order (${targetTons} Tons) published successfully to farmer clusters!`);
  };

  return (
    <div className="space-y-6">
      {/* 📥 Top Hero: "Receive Bulk Orders & Institutional Demand Pools" */}
      <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-900/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                ⚡ 4-Month Advance Contracts
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Pre-Funded Escrow
              </span>
            </div>

            <div className="flex items-center gap-2">
              {(activeRole === 'buyer' || activeRole === 'admin') && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Create Bulk Demand</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('transport_services')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4 text-emerald-300" />
                <span>State Fleet Map</span>
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                <Boxes className="w-7 h-7 sm:w-8 sm:h-8" />
              </span>
              <span>Receive Bulk Orders & Institutional Pools</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Institutional corporate buyers (ITC, Mother Dairy SAFAL, Reliance Fresh) have pre-funded 100% Escrow for bulk procurement. Directly accept and supply your harvest produce for guaranteed premium rates with free collection hub delivery!
            </p>
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Demand Pools</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {bulkDemands.length} <span className="text-xs text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Volume Target</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                {totalTargetTons.toLocaleString('en-IN')} <span className="text-xs text-slate-300 font-normal">Tons</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Already Committed</span>
              <div className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">
                {totalCommittedTons.toLocaleString('en-IN')} <span className="text-xs text-slate-300 font-normal">Tons</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Escrow Vault Secured</span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                ₹{(totalEscrowPoolValue / 10000000).toFixed(2)} <span className="text-xs text-slate-300 font-normal">Cr</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Live Demands vs My Pledged Commitments */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveViewTab('open_demands')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeViewTab === 'open_demands'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Explore Live Demands ({filteredDemands.length})</span>
            </button>

            <button
              onClick={() => setActiveViewTab('my_pledges')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeViewTab === 'my_pledges'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>My Committed Bulk Lots ({myPledges.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeViewTab === 'my_pledges' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>My Committed Bulk Lots ({myPledges.length})</span>
            </h3>
            <span className="text-xs text-slate-500">
              Total Promised Payout: <strong className="text-emerald-700">₹{myPledges.reduce((s, p) => s + (p.totalPayout || 0), 0).toLocaleString('en-IN')}</strong>
            </span>
          </div>

          {myPledges.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Boxes className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">No Committed Bulk Orders Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You haven't committed harvest tonnage to any institutional bulk orders yet. Explore open demands below from ITC, Mother Dairy SAFAL, and Reliance Agro to lock in 100% Escrow-secured advance contracts!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewTab('open_demands')}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Boxes className="w-4 h-4" />
                <span>Explore Open Bulk Demands ({bulkDemands.length})</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPledges.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.pool.demandNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-500">•</span>
                      <span className="text-xs font-black text-emerald-800">
                        {item.pool.cropName}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      ✓ {item.status || 'Accepted'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Buyer Entity:</span>
                      <strong className="text-slate-900">{item.pool.buyerOrg || item.pool.buyerName}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Your Harvest Quota:</span>
                      <strong className="text-slate-900">{item.quantityTons} Metric Tons ({item.quantityTons * 10} Quintals)</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Contract Rate:</span>
                      <strong className="text-slate-900">₹{item.pricePerTon.toLocaleString('en-IN')} / Ton</strong>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                      <span className="font-bold text-emerald-900">Locked Escrow Payout:</span>
                      <span className="text-base font-black text-emerald-700">₹{item.totalPayout.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Dispatch Schedule</span>
                        <strong className="text-slate-800">{item.expectedDispatchDate}</strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Vehicle Assigned</span>
                        <strong className="text-indigo-700 font-mono">{item.vehicleAssigned || 'Hub Pool Fleet'}</strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Quality Standard</span>
                        <strong className="text-slate-800">{item.qualityGrade} ({item.moisturePercent}% Moisture)</strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Delivery Hub</span>
                        <strong className="text-slate-800 truncate block">{item.pool.deliveryCity}, {item.pool.deliveryState}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`📜 CONTRACT ACKNOWLEDGEMENT SLIP\n\nPool: #${item.pool.demandNumber}\nCrop: ${item.pool.cropName} (${item.pool.variety})\nBuyer: ${item.pool.buyerOrg || item.pool.buyerName}\nFarmer: ${item.contributorName} (${item.location}, ${item.state})\nTonnage: ${item.quantityTons} Tons\nGuaranteed Payout: ₹${item.totalPayout.toLocaleString('en-IN')}\nDispatch Date: ${item.expectedDispatchDate}\nEscrow Status: 100% Pre-funded & Guaranteed`)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Contract Slip</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveViewTab('open_demands');
                        setExpandedPoolId(item.pool.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Pool & Fleet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search & Filter Controls */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by crop, buyer (ITC, Reliance), order ID, destination..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>Category: {cat}</option>
                  ))}
                </select>

                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  {states.map(st => (
                    <option key={st} value={st}>Destination: {st}</option>
                  ))}
                </select>

                {(activeRole === 'buyer' || activeRole === 'admin') && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Create Advance Demand</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('transport_services')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>State Transport Fleet</span>
                </button>
              </div>
            </div>
          </div>

      {/* Bulk Demands Cards List */}
      <div className="space-y-5">
        {filteredDemands.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Bulk Demand Pools Matching Search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Try resetting filters to explore all active institutional 4-month bulk demands.</p>
          </div>
        ) : (
          filteredDemands.map(pool => {
            const percentFilled = Math.min(100, Math.round((pool.committedQuantityTons / pool.targetQuantityTons) * 100));
            const isFullyFilled = pool.remainingQuantityTons <= 0;
            const isExpanded = expandedPoolId === pool.id;

            return (
              <div 
                key={pool.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Main Card Header & Summary */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {pool.demandNumber}
                        </span>

                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          {pool.buyerOrg || pool.buyerName}
                        </span>

                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          4-Mo Advance Delivery: {pool.expectedDispatchStart}
                        </span>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          isFullyFilled 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800 animate-pulse'
                        }`}>
                          {isFullyFilled ? '● 100% QUOTA COMMITTED' : '● OPEN FOR FARMER COMMITS'}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <span>{pool.targetQuantityTons} Metric Tons</span>
                          <span className="text-emerald-700 font-extrabold">• {pool.cropName}</span>
                          <span className="text-sm font-semibold text-slate-500">({pool.variety})</span>
                        </h2>
                        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                          {pool.description}
                        </p>
                      </div>
                    </div>

                    {/* Price and Total Budget Badge */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shrink-0 text-left lg:text-right space-y-1 shadow-md">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Guaranteed Buyback Rate
                      </span>
                      <div className="text-2xl font-black text-emerald-400">
                        ₹{pool.pricePerTon.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-300"> / Ton</span>
                      </div>
                      <span className="text-[11px] text-slate-300 block">
                        ₹{Math.round(pool.pricePerTon / 10)} / Quintal • Pre-Funded Escrow: ₹{(pool.totalBudget / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>
                  </div>

                  {/* Visual Aggregation Progress Bar */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{pool.committedQuantityTons} Tons Committed</span>
                        <span className="text-slate-400">/</span>
                        <span className="font-semibold text-slate-600">{pool.targetQuantityTons} Tons Target</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-emerald-700">{percentFilled}% Fulfilled</span>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {pool.remainingQuantityTons > 0 ? `${pool.remainingQuantityTons} Tons Needed` : 'Target Achieved!'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <strong>{(pool.contributions || []).length} Farmer Clusters</strong> contributed
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        Target: ~{pool.targetTrucksCount || Math.ceil((pool.targetQuantityTons || 0) / 20)} Multi-Axle Trucks (20T each)
                      </span>
                    </div>
                  </div>

                  {/* Core Specifications & Destination Hub Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery Destination</span>
                      <span className="font-extrabold text-slate-900 block truncate">{pool.deliveryCity || 'Central Hub'}, {pool.deliveryState || 'India'}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{pool.deliveryLocation || 'FCI / APMC Silo'}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Quality Requirement</span>
                      <span className="font-extrabold text-emerald-700 block">{pool.qualityGradeRequirement || 'Grade A'}</span>
                      <span className="text-[10px] text-slate-500 block">Moisture &lt; {pool.moistureLimitPercent || 12.0}%</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Dispatch Timeline</span>
                      <span className="font-extrabold text-slate-900 block">{pool.expectedDispatchStart || '4-Month Advance'}</span>
                      <span className="text-[10px] text-slate-500 block">Deadline: {pool.deadlineDate || 'Open'}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Buyer Escrow Vault</span>
                      <span className="font-extrabold text-indigo-900 block">100% Pre-Funded</span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">✓ Instant Bank Release</span>
                    </div>
                  </div>

                  {/* Action Strip */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedPoolId(isExpanded ? null : pool.id)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isExpanded ? 'Hide' : 'View'} Contributions ({(pool.contributions || []).length})</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('transport_services')}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>State Fleet Map</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Actions: Admin or Owner Delete Only */}
                      {(() => {
                        const isAdmin = activeRole === 'admin' || currentUser?.role === 'admin' || isAdminAuthenticated;
                        const isOwner = Boolean(
                          currentUser && (
                            pool.buyerId === currentUser.id ||
                            (currentUser.phone && pool.buyerPhone && currentUser.phone.replace(/\D/g, '').slice(-10) === pool.buyerPhone.replace(/\D/g, '').slice(-10))
                          )
                        );
                        // 🔒 STRICT SECURITY: No buyer can delete someone else's bulk order. Only admin or creator can delete!
                        if (!isAdmin && !isOwner) return null;

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const confirmed = typeof window !== 'undefined' && window.confirm 
                                ? window.confirm(`Are you sure you want to permanently delete bulk order #${pool.demandNumber} (${pool.cropName} - ${pool.targetQuantityTons}T)? This cannot be undone.`)
                                : true;
                              if (confirmed) {
                                deleteBulkDemand(pool.id);
                                addNotification({
                                  title: isAdmin ? 'Bulk Order Removed by Admin' : 'Bulk Order Cancelled',
                                  message: `Bulk order #${pool.demandNumber} (${pool.cropName}) was permanently removed from database.`,
                                  type: 'alert',
                                  recipientRole: 'all'
                                });
                              }
                            }}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title={isAdmin ? "Admin Delete Bulk Order" : "Delete Your Own Bulk Demand"}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>
                              {isAdmin 
                                ? (language === 'hi' ? 'हटाएं (Admin)' : 'Delete Order (Admin)') 
                                : (language === 'hi' ? 'मेरी मांग हटाएं' : 'Delete My Demand')}
                            </span>
                          </button>
                        );
                      })()}

                      {/* Farmer vs Buyer Action Indicator */}
                      {activeRole === 'buyer' ? (
                        pool.buyerId === currentUser?.id ? (
                          <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs flex items-center gap-2 shadow-xs">
                            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>
                              {language === 'hi'
                                ? `📦 आपकी पोस्ट की गई मांग (${pool.committedQuantityTons}/${pool.targetQuantityTons}T प्राप्त)`
                                : `📦 Your Posted Demand (${pool.committedQuantityTons}/${pool.targetQuantityTons}T committed)`}
                            </span>
                          </div>
                        ) : (
                          <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs flex items-center gap-2 cursor-not-allowed" title="खरीददार फसल आपूर्ति नहीं कर सकते">
                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>
                              {language === 'hi'
                                ? '🌾 केवल किसान फसल योगदान कर सकते हैं'
                                : '🌾 Farmers Only Supply Contribution'}
                            </span>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => handleOpenSupplyModal(pool)}
                          disabled={isFullyFilled}
                          className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            isFullyFilled
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:scale-105'
                          }`}
                        >
                          <SendHorizontal className="w-4 h-4" />
                          <span>
                            {isFullyFilled 
                              ? (language === 'hi' ? 'कोटा पूर्ण (500T संपन्न)' : 'Quota Full (500T Complete)')
                              : (language === 'hi' ? '📥 फसल योगदान करें (मात्रा भेजें)' : '📥 Supply Produce & Accept Quota')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Contributors Table */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-200 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Contributing Farmers & Aggregation Hubs ({(pool.contributions || []).length})
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Total Supplied: <strong>{pool.committedQuantityTons} Tons</strong> (₹{((pool.contributions || []).reduce((s, c) => s + (c.totalPayout || 0), 0) / 100000).toFixed(2)} Lakhs)
                      </span>
                    </div>

                    {(pool.contributions || []).length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">No contributions submitted yet. Click Send Produce to add your harvest quantity!</p>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-100/75 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Farmer / Hub</th>
                              <th className="p-3">Role</th>
                              <th className="p-3">State & Location</th>
                              <th className="p-3 text-right">Offered Quantity</th>
                              <th className="p-3 text-right">Escrow Payout</th>
                              <th className="p-3">Dispatch Date</th>
                              <th className="p-3">Quality / QC</th>
                              <th className="p-3">Vehicle Assigned</th>
                              <th className="p-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(pool.contributions || []).map((contrib, idx) => (
                              <tr key={contrib.id || idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-bold text-slate-900">
                                  <div>{contrib.contributorName}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{contrib.contributorPhone}</div>
                                </td>

                                <td className="p-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    contrib.contributorRole === 'collection_centre'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {contrib.contributorRole === 'collection_centre' ? '🏢 Collection Hub' : '👨‍🌾 Farmer'}
                                  </span>
                                </td>

                                <td className="p-3">
                                  <div className="font-semibold text-slate-800">{contrib.state}</div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{contrib.location}</div>
                                </td>

                                <td className="p-3 text-right font-extrabold text-slate-900 text-sm">
                                  {contrib.quantityTons} Tons
                                  <div className="text-[10px] text-slate-400 font-normal">({contrib.quantityTons * 10} Quintals)</div>
                                </td>

                                <td className="p-3 text-right font-extrabold text-emerald-700">
                                  ₹{contrib.totalPayout.toLocaleString('en-IN')}
                                </td>

                                <td className="p-3">
                                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>{contrib.expectedDispatchDate}</span>
                                  </div>
                                </td>

                                <td className="p-3">
                                  <span className="font-bold text-slate-800">{contrib.qualityGrade}</span>
                                  {contrib.moisturePercent && (
                                    <div className="text-[10px] text-slate-500">{contrib.moisturePercent}% Moisture</div>
                                  )}
                                </td>

                                <td className="p-3">
                                  {contrib.vehicleAssigned ? (
                                    <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                      {contrib.vehicleAssigned}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">Hub Pool Truck</span>
                                  )}
                                </td>

                                <td className="p-3 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    {contrib.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 📥 MODAL: "Receive & Accept 4-Month Advance Bulk Order (Farmer Modal)" */}
      {/* ========================================================================= */}
      {supplyModalPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <SendHorizontal className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Receive & Accept Advance Bulk Order
                  </h3>
                  <p className="text-xs text-slate-500">
                    {supplyModalPool.buyerOrg || supplyModalPool.buyerName} • 4-Mo Future Harvest Buyback
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSupplyModalPool(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {supplySuccessMessage ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">4-Month Contract Confirmed!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">{supplySuccessMessage}</p>
                </div>
                <button
                  onClick={() => setSupplyModalPool(null)}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  Close & View Pool
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSupply} className="space-y-4 text-xs">
                {/* Crop & Target Quota Summary Banner */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Crop</span>
                    <strong className="text-sm text-slate-900">{supplyModalPool.cropName} ({supplyModalPool.variety})</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Guaranteed Rate</span>
                    <strong className="text-sm text-emerald-700">₹{supplyModalPool.pricePerTon.toLocaleString('en-IN')}/Ton</strong>
                  </div>
                </div>

                {/* Contribution Tonnage Stepper */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Your Harvest Contribution (Tons) *
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Max Remaining: <strong className="text-slate-800">{supplyModalPool.remainingQuantityTons} Tons</strong>
                    </span>
                  </div>

                  <input
                    type="number"
                    min="1"
                    max={supplyModalPool.remainingQuantityTons > 0 ? supplyModalPool.remainingQuantityTons : 100}
                    required
                    value={supplyQtyTons}
                    onChange={e => setSupplyQtyTons(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-extrabold text-slate-900 text-center focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                    {[10, 25, 50, supplyModalPool.remainingQuantityTons].filter((q, i, arr) => q > 0 && arr.indexOf(q) === i).map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setSupplyQtyTons(qty)}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                          supplyQtyTons === qty 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {qty === supplyModalPool.remainingQuantityTons ? `Full Remaining (${qty}T)` : `${qty} Tons`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Ready Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Farm Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplyLocation}
                      onChange={e => setSupplyLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Lasalgaon Farmgate Hub"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        State *
                      </label>
                      <select
                        value={supplyState}
                        onChange={e => handleSupplyStateChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                      >
                        {ALL_INDIAN_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        District *
                      </label>
                      <select
                        value={supplyDistrict}
                        onChange={e => setSupplyDistrict(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                      >
                        {availableSupplyDistricts.length > 0 ? (
                          availableSupplyDistricts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))
                        ) : (
                          <option value="">Select State first</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Harvest & Dispatch Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={supplyDispatchDate}
                      onChange={e => setSupplyDispatchDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tested Moisture Score (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={supplyMoisture}
                      onChange={e => setSupplyMoisture(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Guaranteed Escrow Payout Breakdown */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Offered Harvest Supply:</span>
                    <strong className="text-slate-900">{supplyQtyTons} Metric Tons ({supplyQtyTons * 10} Quintals)</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Guaranteed Rate:</span>
                    <strong className="text-slate-900">₹{supplyModalPool.pricePerTon.toLocaleString('en-IN')} / Ton</strong>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-baseline">
                    <span className="font-extrabold text-slate-900 text-sm">Guaranteed Farmer Bank Payout:</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{(supplyQtyTons * supplyModalPool.pricePerTon).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                    ✓ 100% Pre-funded Escrow. Free collection center intake & direct bank release.
                  </p>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmittingSupply}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <SendHorizontal className="w-4 h-4" />
                  <span>
                    {isSubmittingSupply 
                      ? 'Confirming 4-Month Contract...' 
                      : `Accept & Commit ${supplyQtyTons} Tons (₹${(supplyQtyTons * supplyModalPool.pricePerTon).toLocaleString('en-IN')})`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏢 MODAL: "Create 4-Month Advance Bulk Demand Order (Buyer Modal)" */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create 4-Month Advance Bulk Demand (50T–500T+)
                  </h3>
                  <p className="text-xs text-slate-500">Post an institutional contract scheduled 4 months in advance</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Month Advance Policy Notice */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>🗓️ 4-Month Advance Notice Policy</span>
              </div>
              <p>
                Institutional bulk demands require a minimum <strong>4-month lead time</strong> (Earliest Dispatch: <strong>{min4MonthDate}</strong>) so regional farmer clusters can plan cultivation, crop management, and aggregated dispatch.
              </p>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCropName}
                    onChange={e => setNewCropName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Sharbati Wheat, Red Onion, Basmati Rice"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as CropCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Variety Specification
                  </label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={e => setNewVariety(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. MP Premium A-One"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Quota (Metric Tons, Min 50T) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    required
                    value={newTargetTons}
                    onChange={e => setNewTargetTons(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-extrabold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Offered Price per Ton (₹) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={newPricePerTon}
                    onChange={e => setNewPricePerTon(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-extrabold focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 26500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Quality Grade Required
                  </label>
                  <select
                    value={newGradeReq}
                    onChange={e => setNewGradeReq(e.target.value as QualityGrade)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Grade A+">Grade A+ (Premium Export)</option>
                    <option value="Grade A">Grade A (Standard Mill)</option>
                    <option value="Grade B">Grade B (Commercial Processing)</option>
                    <option value="Organic Certified">Organic Certified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Dispatch Start Date (Min 4 Months Ahead) *
                  </label>
                  <input
                    type="date"
                    min={min4MonthDate}
                    required
                    value={newDispatchStart}
                    onChange={e => setNewDispatchStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-indigo-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Farmer Sign-up Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Delivery City & State *
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={newDeliveryCity}
                      onChange={e => setNewDeliveryCity(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      placeholder="City (e.g. Delhi NCR)"
                    />
                    <select
                      value={newDeliveryState}
                      onChange={e => setNewDeliveryState(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
                    >
                      {states.filter(s => s !== 'All').map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Delivery Warehouse Terminal *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeliveryLocation}
                    onChange={e => setNewDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                    placeholder="e.g. Azadpur Mega Silo Complex #02"
                  />
                </div>
              </div>

              {/* Total Escrow Commitment Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total 4-Month Pre-Funded Escrow</span>
                  <span className="text-xs text-slate-500">{newTargetTons} Tons × ₹{newPricePerTon.toLocaleString('en-IN')}/Ton</span>
                </div>
                <span className="text-lg font-black text-indigo-900">
                  ₹{((newTargetTons * newPricePerTon) / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Boxes className="w-4 h-4" />
                <span>Publish 4-Month Advance Bulk Demand Pool</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
