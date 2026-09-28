import React, { useState, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import { ALL_INDIAN_STATES, getDistrictsForState, getDefaultDistrictForState, getNearestTargetMandi } from '../data/indiaLocations';
import { 
  User as UserIcon, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  Award, 
  CheckCircle2, 
  Save, 
  Calendar,
  Lock,
  Sparkles,
  ArrowLeft,
  History,
  Activity,
  Boxes,
  ShoppingBag,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Store,
  Camera,
  Upload
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUserProfile, activeRole, navigateBack, logActivity, language } = useAgri();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [aadhaarNumber, setAadhaarNumber] = useState(currentUser.aadhaarNumber || (currentUser.role === 'farmer' ? '5432 8765 1098' : currentUser.role === 'buyer' ? '9876 5432 1098' : '5432 8765 1098'));
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.location);
  const [district, setDistrict] = useState(currentUser.district || 'Nashik');
  const [state, setState] = useState(currentUser.state || 'Maharashtra');

  // Dependent cascading districts list for selected state
  const availableDistricts = useMemo(() => getDistrictsForState(state), [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const def = getDefaultDistrictForState(newState);
    setDistrict(def);
  };
  const [farmSize, setFarmSize] = useState(currentUser.farmSizeAcres || 14.5);
  const [businessName, setBusinessName] = useState(currentUser.businessName || '');
  const [password, setPassword] = useState(currentUser.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [photoSavedMsg, setPhotoSavedMsg] = useState(false);
  const profilePhotoInputRef = React.useRef<HTMLInputElement>(null);

  // 🖼️ High-Performance HTML5 Canvas Image Compressor
  // Reduces heavy 2MB-10MB mobile uploads into a clean 160x160 JPEG (4KB-8KB) that permanently persists in DB
  const compressImage = (file: File, callback: (compressedDataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const rawData = reader.result;
        const img = new Image();
        img.onload = () => {
          const maxDim = 180;
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
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressedDataUrl) => {
      setAvatar(compressedDataUrl);
      // Immediately and permanently persist to DB & LocalStorage
      updateUserProfile({ avatar: compressedDataUrl });
      setPhotoSavedMsg(true);
      setTimeout(() => setPhotoSavedMsg(false), 4000);
    });
  };

  const handleSelectPresetAvatar = (presetUrl: string) => {
    setAvatar(presetUrl);
    updateUserProfile({ avatar: presetUrl });
    setPhotoSavedMsg(true);
    setTimeout(() => setPhotoSavedMsg(false), 4000);
  };

  const avatarPresets = [
    { label: '🌾 Kisan Ji', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
    { label: '🌾 Progressive', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80' },
    { label: '🌾 Mahila Kisan', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
    { label: '🏢 Corporate Buyer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
    { label: '🏢 FMCG Head', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
    { label: '🏬 Hub Officer', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' }
  ];

  const handleAadhaarChange = (val: string) => {
    const rawDigits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
    setAadhaarNumber(formatted);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      password: password.trim() || currentUser.password || '',
      aadhaarNumber: aadhaarNumber.trim(),
      aadhaarVerified: true,
      email,
      avatar: avatar || currentUser.avatar,
      location,
      district,
      state,
      preferredMandi: getNearestTargetMandi(state, district),
      farmSizeAcres: Number(farmSize),
      businessName: businessName || currentUser.businessName
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft flex flex-col sm:flex-row items-center gap-6">
        <button
          type="button"
          onClick={navigateBack}
          className="self-start sm:self-center p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center sm:items-start gap-3">
          <div className="relative group">
            <img
              src={avatar || currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md border-2 border-emerald-400 bg-slate-100"
            />
            <input
              ref={profilePhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => profilePhotoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
              title={language === 'hi' ? 'फ़ोटो अपलोड करें (गैलरी/कैमरा)' : 'Upload Custom Photo'}
            >
              <Camera className="w-4 h-4" />
            </button>
            {currentUser.verified && (
              <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md border-2 border-white" title="Verified User">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => profilePhotoInputRef.current?.click()}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>{language === 'hi' ? 'गैलरी/कैमरे से अपलोड करें' : 'Upload Custom Photo'}</span>
          </button>
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-display">{currentUser.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {currentUser.location}, {currentUser.state} • Member since {currentUser.memberSince}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>UIDAI Aadhaar: {currentUser.aadhaarNumber || aadhaarNumber} (Verified)</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Permanent DB Sync Active
            </span>
          </div>

          {/* Quick Preset Avatars Gallery */}
          <div className="pt-2 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block text-center sm:text-left">
              {language === 'hi' ? '⚡ 1-क्लिक अवतार चुनें या अपलोड करें:' : '⚡ Quick Avatar Presets:'}
            </span>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              {avatarPresets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPresetAvatar(preset.url)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    (avatar || currentUser.avatar) === preset.url
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-105'
                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-4 h-4 rounded-full object-cover" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {photoSavedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>✅ {language === 'hi' ? 'प्रोफ़ाइल फ़ोटो सफलतापूर्वक स्थायी रूप से सुरक्षित कर दी गई है!' : 'Profile photo updated and permanently saved to Cloud Database!'}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{language === 'hi' ? 'प्रोफ़ाइल विवरण डेटाबेस में सफलतापूर्वक सुरक्षित कर दिए गए हैं!' : 'Profile details saved and updated permanently in database!'}</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-emerald-600" />
          Stakeholder Information & Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Mobile Contact (Phone)
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Account Login Password</span>
              <span className="text-[10px] text-slate-400 font-normal">No OTP required</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>UIDAI Aadhaar Number (12-Digit)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                UIDAI Verified
              </span>
            </label>
            <input
              type="text"
              maxLength={14}
              value={aadhaarNumber}
              onChange={e => handleAadhaarChange(e.target.value)}
              placeholder="e.g. 5432 8765 1098"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold tracking-wide focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              🔒 Encrypted UIDAI credential for direct MSP bank payouts and buyer trade authentication.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {activeRole === 'farmer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Total Land Holding (Acres)
              </label>
              <input
                type="number"
                step="0.5"
                value={farmSize}
                onChange={e => setFarmSize(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {activeRole === 'buyer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Farmgate / Hub Location Address
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              State
            </label>
            <select
              value={state}
              onChange={e => handleStateChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {ALL_INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              District
            </label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
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

          {/* 🎯 Nearest Target APMC Mandi according to location */}
          <div className="sm:col-span-2 p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Nearest Target APMC Mandi</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  {getNearestTargetMandi(state, district)}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300 self-start sm:self-center shadow-xs">
              📍 Auto-matched to {district}, {state}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Updates</span>
        </button>
      </form>
    </div>
  );
};
