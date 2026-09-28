import React, { useState, useEffect, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import { CropCategory, QualityGrade } from '../types';
import { ALL_INDIAN_STATES, getDistrictsForState, getDefaultDistrictForState, getNearestTargetMandi } from '../data/indiaLocations';
import { 
  Sprout, 
  Upload, 
  Camera,
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  ArrowLeft, 
  Navigation, 
  Zap, 
  Building2,
  Store
} from 'lucide-react';
import { geocodeLocation, calculateDistanceKm, findNearestFciHub } from '../utils/geoUtils';

export const AddProduceView: React.FC = () => {
  const { currentUser, addListing, setActiveTab, navigateBack, userLocation, collectionHubs, detectLiveLocation, mandiPrices } = useAgri();

  const getCropPhoto = (cropName: string, _category: CropCategory) => {
    const lower = cropName.toLowerCase();
    if (lower.includes('onion')) return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('rice') || lower.includes('paddy') || lower.includes('dhan') || lower.includes('basmati')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('potato') || lower.includes('aloo')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('wheat') || lower.includes('gehu')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('soybean')) return 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('corn') || lower.includes('maize') || lower.includes('makka')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('mustard') || lower.includes('sarson')) return 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('cotton') || lower.includes('kapas') || lower.includes('narma')) return 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('chilli') || lower.includes('mirch')) return 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('garlic') || lower.includes('lahsun')) return 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&auto=format&fit=crop&q=80';
    if (lower.includes('turmeric') || lower.includes('haldi')) return 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80';
  };

  const predefinedCrops = useMemo(() => {
    if (mandiPrices && mandiPrices.length > 0) {
      return mandiPrices.map(m => ({
        name: m.cropName,
        category: m.category,
        price: m.recommendedFarmerSellingPrice || m.currentPrice,
        mandiPrice: m.currentPrice,
        mandiName: m.mandiName,
        img: getCropPhoto(m.cropName, m.category)
      }));
    }
    return [
      { name: 'Red Onion', category: 'Vegetables' as CropCategory, price: 2650, mandiPrice: 2580, mandiName: 'Lasalgaon APMC', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
      { name: 'Basmati Rice', category: 'Cereals & Grains' as CropCategory, price: 4850, mandiPrice: 4720, mandiName: 'Karnal APMC', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
      { name: 'Tomato', category: 'Vegetables' as CropCategory, price: 1950, mandiPrice: 1850, mandiName: 'Kolar APMC', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
      { name: 'Potato', category: 'Vegetables' as CropCategory, price: 1420, mandiPrice: 1350, mandiName: 'Agra APMC', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
      { name: 'Wheat (Sharbati)', category: 'Cereals & Grains' as CropCategory, price: 3400, mandiPrice: 3200, mandiName: 'Sehore Mandi', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' }
    ];
  }, [mandiPrices]);

  const defaultCrop = predefinedCrops[0];

  const [form, setForm] = useState({
    cropName: defaultCrop?.name || 'Tomato',
    category: (defaultCrop?.category || 'Vegetables') as CropCategory,
    variety: 'Grade A Quality Harvest',
    quantity: 60,
    unit: 'Quintals' as 'Quintals' | 'Tons' | 'Kg' | 'Bags',
    qualityGrade: 'Grade A+' as QualityGrade,
    pricePerUnit: defaultCrop?.price || 2100,
    harvestDate: new Date().toISOString().split('T')[0],
    location: currentUser.location || 'Farmgate, India',
    state: currentUser.state || 'Maharashtra',
    district: currentUser.district || 'Nashik',
    pincode: currentUser.pincode || '',
    moisturePercent: 12.0,
    organicCertified: false,
    description: 'Freshly harvested, uniformly graded, harvested under optimal weather. Stored in shaded farm warehouse.',
    imagePreview: defaultCrop?.img || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
  });

  const availableDistricts = useMemo(() => getDistrictsForState(form.state), [form.state]);

  const handleStateChange = (newState: string) => {
    const def = getDefaultDistrictForState(newState);
    setCustomSelectedHubId(null);
    setForm(prev => ({
      ...prev,
      state: newState,
      district: def,
      location: `${def} Farmgate, ${newState}`,
      pincode: ''
    }));
  };

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [customSelectedHubId, setCustomSelectedHubId] = useState<string | null>(null);
  const [isChangingHub, setIsChangingHub] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const cropPhotoInputRef = React.useRef<HTMLInputElement>(null);
  const [photoUploadedToast, setPhotoUploadedToast] = useState(false);

  // 🖼️ Client-side HTML5 Canvas Produce Image Compressor
  const compressCropImage = (file: File, callback: (compressed: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const rawData = reader.result;
        const img = new Image();
        img.onload = () => {
          const maxDim = 600;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            callback(compressed);
          } else {
            callback(rawData);
          }
        };
        img.onerror = () => callback(rawData);
        img.src = rawData;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressCropImage(file, (compressedDataUrl) => {
      setForm(prev => ({ ...prev, imagePreview: compressedDataUrl }));
      setPhotoUploadedToast(true);
      setTimeout(() => setPhotoUploadedToast(false), 3500);
    });
  };

  // ⚡ Auto-Detect Nearest FCI Hub based on current farm location & district
  const nearestHubMatch = useMemo(() => {
    return findNearestFciHub(form.location, form.state, form.district, form.pincode, collectionHubs);
  }, [form.location, form.state, form.district, form.pincode, collectionHubs]);

  const activeFciHub = useMemo(() => {
    if (customSelectedHubId) {
      const found = collectionHubs.find(h => h.id === customSelectedHubId);
      if (found) return found;
    }
    return nearestHubMatch?.hub || collectionHubs[0];
  }, [customSelectedHubId, nearestHubMatch, collectionHubs]);

  const activeFciHubDistance = useMemo(() => {
    const geo = geocodeLocation(form.location, form.state, form.district, form.pincode);
    if (!activeFciHub) return 0;
    return calculateDistanceKm(geo.lat, geo.lng, activeFciHub.latitude, activeFciHub.longitude);
  }, [form.location, form.state, form.district, form.pincode, activeFciHub]);

  const activeNearestMandi = useMemo(() => {
    return nearestHubMatch?.nearestMandi || getNearestTargetMandi(form.state, form.district);
  }, [nearestHubMatch, form.state, form.district]);

  const handleSelectPredefined = (crop: typeof predefinedCrops[0]) => {
    setForm(prev => ({
      ...prev,
      cropName: crop.name,
      category: crop.category,
      pricePerUnit: crop.price,
      imagePreview: crop.img
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const geo = geocodeLocation(form.location, form.state, form.district, form.pincode);
    addListing({
      cropName: form.cropName,
      category: form.category,
      variety: form.variety,
      quantity: Number(form.quantity),
      unit: form.unit,
      qualityGrade: form.qualityGrade,
      pricePerUnit: Number(form.pricePerUnit),
      harvestDate: form.harvestDate,
      location: form.location,
      state: form.state,
      district: form.district,
      pincode: form.pincode,
      latitude: geo.lat,
      longitude: geo.lng,
      moisturePercent: Number(form.moisturePercent),
      organicCertified: form.organicCertified,
      description: form.description,
      images: [form.imagePreview],
      // 🏛️ Auto-Detected FCI Hub & Silo Assignment
      collectionCentreId: activeFciHub?.id,
      fciHubName: activeFciHub?.name,
      fciHubCode: activeFciHub?.code,
      fciHubDistanceKm: activeFciHubDistance,
      fciHubType: activeFciHub?.hubType || 'FCI Modern Steel Silo',
      fciHubDistrict: activeFciHub?.district,
      fciHubState: activeFciHub?.state,
      nearestMandi: activeNearestMandi
    });

    setIsSubmitted(true);
  };

  const estimatedTotal = Number(form.quantity) * Number(form.pricePerUnit);
  const platformCharge = Math.round(estimatedTotal * 0.015);
  const netEstimatedFarmerPayout = estimatedTotal - platformCharge;

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Crop Lot Published to Marketplace!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your listing for <span className="font-bold text-slate-900">{form.quantity} {form.unit} of {form.cropName}</span> is now live. Buyers can now place instant escrow orders or inspect at your local collection centre.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-md mx-auto text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Expected Gross Value:</span>
            <span className="font-bold text-slate-900">₹{estimatedTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Platform Escrow & Tech Fee (1.5%):</span>
            <span className="font-semibold text-slate-700">-₹{platformCharge.toLocaleString('en-IN')}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-800 text-sm">
            <span>Guaranteed Farmer Net Payout:</span>
            <span>₹{netEstimatedFarmerPayout.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 🏛️ Confirmed FCI Hub & Mandi Attachment */}
        <div className="bg-emerald-50/90 rounded-2xl p-4 border border-emerald-200 max-w-md mx-auto text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Assigned FCI Hub: {activeFciHub.name}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold">
              {activeFciHub.code}
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">
            📍 {activeFciHub.district}, {activeFciHub.state} • {activeFciHubDistance} km from farm • {activeFciHub.hubType || 'FCI Modern Silo'}
          </p>
          <div className="pt-1.5 border-t border-emerald-200/80 flex items-center gap-1 text-[11px] text-slate-700 font-semibold">
            <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Target Mandi: <strong>{activeNearestMandi}</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Add Another Lot
          </button>
          <button
            onClick={() => setActiveTab('my_listings')}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors"
          >
            <span>View My Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={navigateBack}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-600" />
              Add Produce & Publish Listing
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              List your harvest directly to verified buyers. Zero middleman cuts, 100% escrow guaranteed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Transparent Pricing Assured</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Quick Fill Preset Staples:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {predefinedCrops.map(crop => (
            <button
              key={crop.name}
              type="button"
              onClick={() => handleSelectPredefined(crop)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all ${
                form.cropName === crop.name 
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <img src={crop.img} alt={crop.name} className="w-5 h-5 rounded-md object-cover" />
              <span>{crop.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Crop Name *
            </label>
            <input
              type="text"
              required
              value={form.cropName}
              onChange={e => setForm({ ...form, cropName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. Red Onion / Basmati Rice"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Category *
            </label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as CropCategory })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="Vegetables">Vegetables</option>
              <option value="Cereals & Grains">Cereals & Grains</option>
              <option value="Fruits">Fruits</option>
              <option value="Pulses">Pulses</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Spices">Spices</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Variety / Cultivar
            </label>
            <input
              type="text"
              value={form.variety}
              onChange={e => setForm({ ...form, variety: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. Nashik Garva / 1121 Pusa"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Quality / Grade *
            </label>
            <select
              value={form.qualityGrade}
              onChange={e => setForm({ ...form, qualityGrade: e.target.value as QualityGrade })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="Grade A+">Grade A+ (Premium / Export Grade)</option>
              <option value="Grade A">Grade A (Standard Top Quality)</option>
              <option value="Grade B">Grade B (Good Commercial Quality)</option>
              <option value="Organic Certified">Organic Certified (NPOP Verified)</option>
              <option value="Fair">Fair Average Quality (FAQ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Quantity Available *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-2/3 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value as any })}
                className="w-1/3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="Quintals">Quintals</option>
                <option value="Tons">Tons</option>
                <option value="Kg">Kg</option>
                <option value="Bags">Bags (50kg)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Expected Price (₹ / {form.unit.slice(0, -1)}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min="10"
                required
                value={form.pricePerUnit}
                onChange={e => setForm({ ...form, pricePerUnit: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Harvest Date *
            </label>
            <input
              type="date"
              required
              value={form.harvestDate}
              onChange={e => setForm({ ...form, harvestDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Farm Location & PIN Code (स्थान व पिनकोड) *
            </label>
            <button
              type="button"
              onClick={async () => {
                setIsDetectingLocation(true);
                try {
                  const loc = await detectLiveLocation();
                  setForm(prev => ({
                    ...prev,
                    location: `${loc.name}, ${loc.district}`,
                    pincode: loc.pincode,
                    state: loc.state || prev.state,
                    district: loc.district || prev.district
                  }));
                } finally {
                  setIsDetectingLocation(false);
                }
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all hover:scale-105"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
              <span>{isDetectingLocation ? 'Detecting GPS...' : 'Feed Live GPS Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. Village Dindori, Farm Sector 4, Nashik"
              />
            </div>

            <div>
              <input
                type="text"
                required
                value={form.pincode}
                onChange={e => setForm({ ...form, pincode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="PIN (e.g. 422209)"
              />
            </div>
          </div>

          {/* Dependent Cascading State & District Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                State (राज्य) *
              </label>
              <select
                value={form.state}
                onChange={e => handleStateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {ALL_INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                District (ज़िला) *
              </label>
              <select
                value={form.district}
                onChange={e => {
                  const newDist = e.target.value;
                  setCustomSelectedHubId(null);
                  setForm(prev => ({
                    ...prev,
                    district: newDist,
                    location: `${newDist} Farmgate, ${prev.state}`
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {availableDistricts.length > 0 ? (
                  availableDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))
                ) : (
                  <option value="">Select State first</option>
                )}
              </select>
            </div>
          </div>

          {/* ⚡ Nearest Pan-India FCI Collection Hub Auto-Matched */}
          <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      {activeFciHub.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 font-mono text-[10px] font-bold">
                      {activeFciHub.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    📍 {activeFciHub.district}, {activeFciHub.state} • {activeFciHubDistance} km from farm • {activeFciHub.hubType || 'FCI Modern Silo'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-full font-extrabold shadow-xs">
                  {customSelectedHubId ? 'Selected FCI Hub' : (activeFciHubDistance <= 25 ? '⚡ Nearest FCI Hub' : 'Regional Hub')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangingHub(!isChangingHub)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  {isChangingHub ? 'Done' : 'Change FCI Hub ▾'}
                </button>
              </div>
            </div>

            {isChangingHub && (
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 space-y-1.5 animate-in fade-in">
                <label className="block text-[11px] font-bold text-slate-700">
                  Choose from {collectionHubs.length} FCI Centres across India:
                </label>
                <select
                  value={activeFciHub.id}
                  onChange={e => setCustomSelectedHubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                >
                  {collectionHubs.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.state} • {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 🎯 Nearest Target APMC Mandi according to location */}
            <div className="pt-2 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-800">
                <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-semibold text-slate-600">Nearest Target APMC Mandi:</span>
                <strong className="font-extrabold text-slate-900">{activeNearestMandi}</strong>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300 self-start sm:self-auto">
                📍 Target Mandi for {form.district}, {form.state}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Crop Lot Images & Field Photos (फसल की असली तस्वीर)
            </label>
            {photoUploadedToast && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                ✅ Photo Compressed & Attached!
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 transition-colors">
            <div className="relative group shrink-0">
              <img
                src={form.imagePreview}
                alt="Preview"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-3 ring-emerald-500 shadow-md border border-white"
              />
              <button
                type="button"
                onClick={() => cropPhotoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Change Produce Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <input
                ref={cropPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleCropPhotoUpload}
                className="hidden"
              />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => cropPhotoInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Real Harvest Photo</span>
                </button>
                <span className="text-[11px] text-slate-500 font-medium">Auto-compressed JPG (from camera or gallery)</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Quick Presets:</span>
                {[
                  { name: '🌾 Grade A+ Harvest', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
                  { name: '🧅 Fresh Red Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
                  { name: '🌾 Basmati Lot', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
                  { name: '🥔 Agra Potato', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' }
                ].map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, imagePreview: preset.url }));
                      setPhotoUploadedToast(true);
                      setTimeout(() => setPhotoUploadedToast(false), 3000);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      form.imagePreview === preset.url
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Live field photos with geotag metadata increase buyer direct bidding conversion rate by 40%.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Produce Description & Quality Notes
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Describe harvest method, curing, packaging style (e.g. 50kg gunny bags)..."
          />
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <input
            type="checkbox"
            id="organicCheck"
            checked={form.organicCertified}
            onChange={e => setForm({ ...form, organicCertified: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
          <label htmlFor="organicCheck" className="text-xs font-bold text-emerald-950 cursor-pointer">
            This produce is 100% Certified Organic (Zero Chemical Fertilizers/Pesticides)
          </label>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Estimated Escrow Settlement Summary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Total Lot Value:</span>
              <span className="text-base font-bold text-slate-900">₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Transparent Tech Fee (1.5%):</span>
              <span className="text-base font-bold text-slate-700">₹{platformCharge.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 block font-semibold">Guaranteed Farmer Payout:</span>
              <span className="text-base font-extrabold text-emerald-700">₹{netEstimatedFarmerPayout.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-base shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Publish Listing to Marketplace</span>
        </button>
      </form>
    </div>
  );
};
