import React, { useState, useEffect, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import { CropListing, CropCategory, QualityGrade } from '../types';
import { ALL_INDIAN_STATES, getDistrictsForState, getDefaultDistrictForState, getNearestTargetMandi } from '../data/indiaLocations';
import { geocodeLocation, calculateDistanceKm, findNearestFciHub } from '../utils/geoUtils';
import { 
  X, 
  Save, 
  Camera, 
  Upload, 
  MapPin, 
  Building2, 
  Store, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  Scale,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: CropListing | null;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  isOpen,
  onClose,
  listing
}) => {
  const { updateListing, collectionHubs, language, selectedListingModal, setSelectedListingModal, detectLiveLocation } = useAgri();

  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<'Quintals' | 'KG' | 'Kg' | 'Tons' | 'Bags' | string>('Quintals');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A');
  const [pricePerUnit, setPricePerUnit] = useState<number>(2000);
  const [harvestDate, setHarvestDate] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [pincode, setPincode] = useState('');
  const [moisturePercent, setMoisturePercent] = useState<number>(12.0);
  const [organicCertified, setOrganicCertified] = useState(false);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState<CropListing['status']>('Active');
  const [customSelectedHubId, setCustomSelectedHubId] = useState<string | null>(null);
  const [isChangingHub, setIsChangingHub] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [photoSavedToast, setPhotoSavedToast] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize form state when a listing is selected
  useEffect(() => {
    if (listing) {
      setCropName(listing.cropName || '');
      setCategory(listing.category || 'Vegetables');
      setVariety(listing.variety || '');
      setQuantity(listing.quantity || 0);
      setUnit(listing.unit || 'Quintals');
      setQualityGrade(listing.qualityGrade || 'Grade A');
      setPricePerUnit(listing.pricePerUnit || 0);
      setHarvestDate(listing.harvestDate || new Date().toISOString().split('T')[0]);
      setLocation(listing.location || '');
      setState(listing.state || 'Maharashtra');
      setDistrict(listing.district || 'Nashik');
      setPincode(listing.pincode || '');
      setMoisturePercent(listing.moisturePercent || 12.0);
      setOrganicCertified(!!listing.organicCertified);
      setDescription(listing.description || '');
      setImagePreview((listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');
      setStatus(listing.status || 'Active');
      setCustomSelectedHubId(listing.collectionCentreId || null);
      setIsChangingHub(false);
      setIsSaved(false);
    }
  }, [listing, isOpen]);

  const availableDistricts = useMemo(() => getDistrictsForState(state), [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const def = getDefaultDistrictForState(newState);
    setDistrict(def);
    setCustomSelectedHubId(null);
  };

  // Auto-detect nearest FCI Hub
  const nearestHubMatch = useMemo(() => {
    return findNearestFciHub(location, state, district, pincode, collectionHubs);
  }, [location, state, district, pincode, collectionHubs]);

  const activeFciHub = useMemo(() => {
    if (customSelectedHubId) {
      const found = collectionHubs.find(h => h.id === customSelectedHubId);
      if (found) return found;
    }
    return nearestHubMatch?.hub || collectionHubs[0];
  }, [customSelectedHubId, nearestHubMatch, collectionHubs]);

  const activeFciHubDistance = useMemo(() => {
    const geo = geocodeLocation(location, state, district, pincode);
    if (!activeFciHub) return 0;
    return calculateDistanceKm(geo.lat, geo.lng, activeFciHub.latitude, activeFciHub.longitude);
  }, [location, state, district, pincode, activeFciHub]);

  const activeNearestMandi = useMemo(() => {
    return nearestHubMatch?.nearestMandi || getNearestTargetMandi(state, district);
  }, [nearestHubMatch, state, district]);

  // Client-side image compression for listing photos
  const compressImage = (file: File, callback: (compressed: string) => void) => {
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
            callback(canvas.toDataURL('image/jpeg', 0.85));
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressedDataUrl) => {
      setImagePreview(compressedDataUrl);
      setPhotoSavedToast(true);
      setTimeout(() => setPhotoSavedToast(false), 3000);
    });
  };

  if (!isOpen || !listing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const geo = geocodeLocation(location, state, district, pincode);

    const updatedData: Partial<CropListing> = {
      cropName: cropName.trim() || listing.cropName,
      category,
      variety: variety.trim() || listing.variety,
      quantity: Number(quantity) || 0,
      unit,
      qualityGrade,
      pricePerUnit: Number(pricePerUnit) || 0,
      harvestDate,
      location: location.trim() || listing.location,
      state,
      district,
      pincode: pincode.trim(),
      latitude: geo.lat,
      longitude: geo.lng,
      moisturePercent: Number(moisturePercent) || 12.0,
      organicCertified,
      description: description.trim(),
      images: [imagePreview],
      status,
      // FCI Hub Details
      collectionCentreId: activeFciHub?.id,
      fciHubName: activeFciHub?.name,
      fciHubCode: activeFciHub?.code,
      fciHubDistanceKm: activeFciHubDistance,
      fciHubType: activeFciHub?.hubType || 'FCI Modern Silo',
      fciHubDistrict: activeFciHub?.district,
      fciHubState: activeFciHub?.state,
      nearestMandi: activeNearestMandi
    };

    updateListing(listing.id, updatedData);

    // If currently selected in detail modal, update it live as well
    if (selectedListingModal && selectedListingModal.id === listing.id) {
      setSelectedListingModal({
        ...selectedListingModal,
        ...updatedData
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Layers className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {language === 'hi' ? 'फ़सल लिस्टिंग विवरण संपादित करें' : 'Edit Crop Listing Details'}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-mono text-[10px] font-bold">
                  #{listing.id}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                {language === 'hi' ? 'मूल्य, मात्रा, गुणवत्ता और फ़ोटो अपडेट करें' : 'Update pricing, quantity, quality & field photo in live marketplace'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {isSaved && (
          <div className="p-3 bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'लिस्टिंग सफलतापूर्वक अपडेट कर दी गई है!' : 'Listing details updated and synced to database successfully!'}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Row 1: Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? 'फ़सल का नाम *' : 'Crop Name *'}
              </label>
              <input
                type="text"
                required
                value={cropName}
                onChange={e => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. Red Onion / Basmati Rice"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? 'श्रेणी (Category) *' : 'Category *'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CropCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="Vegetables">Vegetables (सब्जियां)</option>
                <option value="Cereals & Grains">Cereals & Grains (अनाज)</option>
                <option value="Fruits">Fruits (फल)</option>
                <option value="Pulses">Pulses (दालें)</option>
                <option value="Oilseeds">Oilseeds (तिलहन)</option>
                <option value="Spices">Spices (मसाले)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Variety & Quality Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? 'किस्म / वेराइटी' : 'Variety / Cultivar'}
              </label>
              <input
                type="text"
                value={variety}
                onChange={e => setVariety(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. Nashik Garva / 1121 Pusa"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? 'गुणवत्ता ग्रेड *' : 'Quality Grade *'}
              </label>
              <select
                value={qualityGrade}
                onChange={e => setQualityGrade(e.target.value as QualityGrade)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="Grade A+">Grade A+ (Premium / Export Grade)</option>
                <option value="Grade A">Grade A (Standard Top Quality)</option>
                <option value="Grade B">Grade B (Good Commercial Quality)</option>
                <option value="Organic Certified">Organic Certified (NPOP Verified)</option>
                <option value="Fair">Fair Average Quality (FAQ)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Available Quantity & Expected Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? 'उपलब्ध मात्रा *' : 'Available Quantity *'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-2/3 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as any)}
                  className="w-1/3 px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Quintals">Quintals</option>
                  <option value="Tons">Tons</option>
                  <option value="Kg">Kg</option>
                  <option value="Bags">Bags (50kg)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? `अपेक्षित मूल्य (₹ / ${unit.slice(0, -1)}) *` : `Expected Price (₹ / ${unit.slice(0, -1)}) *`}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="10"
                  required
                  value={pricePerUnit}
                  onChange={e => setPricePerUnit(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-extrabold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Status & Harvest Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? 'लिस्टिंग स्थिति (Listing Status)' : 'Listing Status'}
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CropListing['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Active">🟢 Active (मार्केटप्लेस पर सक्रिय)</option>
                <option value="Under Offer">🟡 Under Offer (बोली प्रगति पर)</option>
                <option value="Sold Out">🔴 Sold Out (बिक चुका)</option>
                <option value="Sold">🔴 Sold (सफल बिक्री)</option>
                <option value="Expired">⚪ Expired (समाप्त)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {language === 'hi' ? 'कटाई की तारीख (Harvest Date) *' : 'Harvest Date *'}
              </label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={e => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 5: Location, State & District */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                {language === 'hi' ? '📍 फ़ार्म स्थान और राज्य/ज़िला' : '📍 Farm Location & District'}
              </label>
              <button
                type="button"
                onClick={async () => {
                  setIsDetectingLocation(true);
                  try {
                    const loc = await detectLiveLocation();
                    setLocation(`${loc.name}, ${loc.district}`);
                    setPincode(loc.pincode);
                    setState(loc.state || state);
                    setDistrict(loc.district || district);
                  } finally {
                    setIsDetectingLocation(false);
                  }
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isDetectingLocation ? 'Detecting GPS...' : 'GPS Auto-fill'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">State</label>
                <select
                  value={state}
                  onChange={e => handleStateChange(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  {ALL_INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">District</label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  {availableDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                  placeholder="e.g. 422001"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Farm Address / Village</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                placeholder="e.g. Lasalgaon Farmgate, Niphad Taluka"
              />
            </div>
          </div>

          {/* Row 6: Assigned FCI Hub & Target Mandi */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">{activeFciHub.name}</span>
                  <span className="text-[10px] text-emerald-800">
                    📍 {activeFciHub.district}, {activeFciHub.state} • {activeFciHubDistance} km from farm
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingHub(!isChangingHub)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer self-start sm:self-auto"
              >
                {isChangingHub ? 'Done' : 'Change FCI Hub ▾'}
              </button>
            </div>

            {isChangingHub && (
              <div className="p-2 bg-white rounded-xl border border-emerald-200 animate-in fade-in">
                <select
                  value={activeFciHub.id}
                  onChange={e => setCustomSelectedHubId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
                >
                  {collectionHubs.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.state} • {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Target APMC Mandi:</span>
              <strong className="font-extrabold text-slate-900">{activeNearestMandi}</strong>
            </div>
          </div>

          {/* Row 7: Crop Image Upload & Presets */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/50 border border-emerald-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'फ़सल की फ़ोटो बदलें (Update Crop Photo)' : 'Update Crop Photo'}
                </span>
              </div>
              {photoSavedToast && (
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                  ✅ Photo Attached!
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <div className="relative group shrink-0">
                <img
                  src={imagePreview}
                  alt="Crop Preview"
                  className="w-20 h-20 rounded-2xl object-cover ring-3 ring-emerald-500 shadow-md border border-white"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                  title="Upload from Device"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                  <span className="text-[11px] text-slate-500">Compressed JPEG for instant marketplace loading</span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Presets:</span>
                  {[
                    { name: '🌾 Grade A+', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
                    { name: '🧅 Red Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
                    { name: '🌾 Basmati', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
                    { name: '🥔 Potato', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
                    { name: '🌾 Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' }
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setImagePreview(p.url)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        imagePreview === p.url
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 8: Description & Organic Checkbox */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              {language === 'hi' ? 'फ़सल का विवरण व गुणवत्ता नोट्स' : 'Produce Description & Quality Notes'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
              placeholder="Describe harvest method, moisture content, packaging style..."
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <input
              type="checkbox"
              id="editOrganicCheck"
              checked={organicCertified}
              onChange={e => setOrganicCertified(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="editOrganicCheck" className="text-xs font-bold text-emerald-950 cursor-pointer">
              {language === 'hi' ? 'यह फ़सल 100% प्रमाणित जैविक (Organic Certified) है' : 'This produce is 100% Certified Organic (Zero Pesticides)'}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSaved}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? (language === 'hi' ? 'सुरक्षित हो रहा है...' : 'Saving Changes...') : (language === 'hi' ? 'परिवर्तन सुरक्षित करें (Save Changes)' : 'Save Changes')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
