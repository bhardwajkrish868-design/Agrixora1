import React, { useState, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { CropCategory, QualityGrade } from '../types';
import { 
  Sprout, 
  Upload, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Scale,
  ArrowLeft,
  Navigation,
  Zap,
  Building2
} from 'lucide-react';
import { geocodeLocation, calculateDistanceKm } from '../utils/geoUtils';

export const AddProduceView: React.FC = () => {
  const { currentUser, addListing, setActiveTab, navigateBack, userLocation, collectionHubs, detectLiveLocation } = useAgri();

  const [form, setForm] = useState({
    cropName: 'Tomato',
    category: 'Vegetables' as CropCategory,
    variety: 'Hybrid High-Lycopene Grade A',
    quantity: 60,
    unit: 'Quintals' as 'Quintals' | 'Tons' | 'Kg' | 'Bags',
    qualityGrade: 'Grade A+' as QualityGrade,
    pricePerUnit: 2100,
    harvestDate: new Date().toISOString().split('T')[0],
    location: currentUser.location || 'Dindori Farmgate, Nashik',
    pincode: currentUser.pincode || '422202',
    moisturePercent: 12.0,
    organicCertified: false,
    description: 'Freshly harvested, uniformly graded, harvested under optimal weather. Stored in shaded farm warehouse.',
    imagePreview: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const predefinedCrops = [
    { name: 'Red Onion', category: 'Vegetables' as CropCategory, price: 2650, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
    { name: 'Basmati Rice', category: 'Cereals & Grains' as CropCategory, price: 4850, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
    { name: 'Tomato', category: 'Vegetables' as CropCategory, price: 1950, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
    { name: 'Potato', category: 'Vegetables' as CropCategory, price: 1420, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
    { name: 'Wheat (Sharbati)', category: 'Cereals & Grains' as CropCategory, price: 3400, img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
    { name: 'Soybean', category: 'Oilseeds' as CropCategory, price: 4620, img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80' },
    { name: 'Sweet Corn / Maize', category: 'Cereals & Grains' as CropCategory, price: 2240, img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80' },
    { name: 'Mustard Seeds', category: 'Oilseeds' as CropCategory, price: 5850, img: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80' },
  ];

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
      pincode: form.pincode,
      moisturePercent: Number(form.moisturePercent),
      organicCertified: form.organicCertified,
      description: form.description,
      images: [form.imagePreview]
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Tested Moisture Content (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.moisturePercent}
              onChange={e => setForm({ ...form, moisturePercent: Number(e.target.value) })}
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
                    pincode: loc.pincode
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

          {/* ⚡ Nearest 10 KM Collection Hub Auto-Matched */}
          {(() => {
            const geo = geocodeLocation(form.location, '', form.pincode);
            let nearestHub = collectionHubs[0];
            let minDistance = 9999;
            collectionHubs.forEach(hub => {
              const d = calculateDistanceKm(geo.lat, geo.lng, hub.latitude, hub.longitude);
              if (d < minDistance) {
                minDistance = d;
                nearestHub = hub;
              }
            });

            return (
              <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900">
                      Auto-Paired Hub: {nearestHub ? nearestHub.name : 'Nashik North Agri Aggregation Hub #04'}
                    </span>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {minDistance <= 10 
                        ? `⚡ 10 KM Auto-Connected (${minDistance} km away) • Instant QA & Cold Storage`
                        : `Regional Hub (${minDistance} km away)`}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-full font-extrabold shadow-xs shrink-0">
                  {minDistance <= 10 ? '10 KM Auto-Matched' : 'Nearest Hub'}
                </span>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Crop Lot Images
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 transition-colors">
            <img
              src={form.imagePreview}
              alt="Preview"
              className="w-24 h-24 rounded-xl object-cover ring-2 ring-emerald-500/20"
            />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => alert('Photo upload simulated successfully with EXIF geolocation & timestamp validation.')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Fresh Field Photo</span>
                </button>
                <span className="text-xs text-slate-400">JPG, PNG up to 10MB</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Live field photos with geotag metadata increase buyer trust score by 40%.
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
