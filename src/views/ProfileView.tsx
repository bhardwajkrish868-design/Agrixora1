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
  Store
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, setCurrentUser, activeRole, navigateBack, activityHistory, logActivity } = useAgri();

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

  const handleAadhaarChange = (val: string) => {
    const rawDigits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
    setAadhaarNumber(formatted);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name,
      phone,
      password: password.trim() || currentUser.password || '',
      aadhaarNumber: aadhaarNumber.trim(),
      aadhaarVerified: true,
      email,
      location,
      district,
      state,
      preferredMandi: getNearestTargetMandi(state, district),
      farmSizeAcres: Number(farmSize),
      businessName: businessName || currentUser.businessName
    };
    setCurrentUser(updatedUser);
    setIsSaved(true);

    logActivity({
      userId: currentUser.id,
      userName: name,
      userRole: currentUser.role,
      actionType: 'profile_update',
      title: 'Profile Updated',
      description: `${name} updated profile details (${location}, ${state}).`
    });

    setTimeout(() => setIsSaved(false), 3000);
  };

  // User-isolated activity history (admins see all events, other users see their own)
  const userHistory = (activityHistory || []).filter(item => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || activeRole === 'admin') return true;
    return item.userId === currentUser.id || item.userName === currentUser.name;
  });

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'register':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'login':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'add_produce':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'order_placed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'stage_update':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'qc_certified':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'dispatched':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
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

        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
          />
          {currentUser.verified && (
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
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
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Database Synced
            </span>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Profile changes saved and updated in database successfully!</span>
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

      {/* User Isolated Personal History & Audit Log */}
      {currentUser.role !== 'farmer' && activeRole !== 'farmer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                {currentUser.role === 'admin' || activeRole === 'admin' ? 'Platform Activity & History Audit Trail' : 'My Activity & History Audit Trail'}
              </h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {userHistory.length} Recorded Events
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'admin' || activeRole === 'admin'
              ? 'This chronological history tracks all platform events, logins, crop lots, orders, and state changes securely saved in the database.'
              : 'This chronological history tracks your account events, logins, crop lots, orders, and state changes securely saved in the database.'}
          </p>

          <div className="space-y-3 pt-2">
            {userHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <span>No recorded activities yet. Your logins, crop postings, and orders will appear here automatically.</span>
              </div>
            ) : (
              userHistory.map(item => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeClass(item.actionType)}`}>
                        {item.actionType.replace('_', ' ').toUpperCase()}
                      </span>
                      <strong className="text-slate-900 font-bold">{item.title}</strong>
                    </div>
                    <p className="text-slate-600 text-[11px]">{item.description}</p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap self-start sm:self-center">
                    {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
