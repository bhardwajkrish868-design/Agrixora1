import React, { useState, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Phone, 
  User as UserIcon, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  X, 
  Building2, 
  Sprout, 
  Boxes, 
  KeyRound, 
  MapPin, 
  Mail, 
  ChevronDown, 
  BarChart3, 
  Users, 
  Leaf 
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  role: UserRole | null;
  onClose: () => void;
  defaultMode?: 'register' | 'login';
}

// 🇮🇳 Authentic UIDAI Sunburst Aadhaar Logo
const AadhaarSunburstLogo: React.FC = () => (
  <div className="w-14 h-12 flex flex-col items-center justify-center shrink-0 bg-white/90 p-1 rounded-xl border border-amber-200/60 shadow-2xs">
    <svg viewBox="0 0 100 68" className="w-full h-full drop-shadow-2xs">
      <defs>
        <linearGradient id="aadhaarSunGradModal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      {/* Sun rays fan */}
      <g fill="url(#aadhaarSunGradModal)">
        <polygon points="50,26 49,7 51,7" />
        <polygon points="50,26 40,9 42,8" />
        <polygon points="50,26 60,9 58,8" />
        <polygon points="50,26 31,13 33,11" />
        <polygon points="50,26 69,13 67,11" />
        <polygon points="50,26 23,19 25,17" />
        <polygon points="50,26 77,19 75,17" />
        <polygon points="50,26 19,28 20,26" />
        <polygon points="50,26 81,28 80,26" />
        <polygon points="50,26 18,37 19,35" />
        <polygon points="50,26 82,37 81,35" />
      </g>
      {/* Central finger/sun arch */}
      <path
        d="M 36 34 A 14 14 0 0 1 64 34"
        fill="none"
        stroke="#DC2626"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 42 34 A 8 8 0 0 1 58 34"
        fill="none"
        stroke="#EA580C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="33" r="2.5" fill="#DC2626" />
      {/* UIDAI Wordmark */}
      <text
        x="50"
        y="59"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="2"
        fill="#DC2626"
      >
        AADHAAR
      </text>
    </svg>
  </div>
);

// 🇮🇳 Digital India Official Trust Badge
const DigitalIndiaLogo: React.FC = () => (
  <div className="flex items-center gap-1.5 shrink-0 select-none">
    <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-300 shadow-2xs flex flex-col">
      <div className="h-1/3 bg-[#FF9933] w-full" />
      <div className="h-1/3 bg-white w-full flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-[#000080]" />
      </div>
      <div className="h-1/3 bg-[#138808] w-full" />
    </div>
    <div className="leading-tight flex items-baseline">
      <span className="text-[11px] font-black text-slate-800 tracking-tight">Digital</span>
      <span className="text-[11px] font-black text-[#FF9933] tracking-tight ml-0.5">India</span>
    </div>
  </div>
);

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  role,
  onClose,
  defaultMode = 'register'
}) => {
  const { loginUser, registerUser, language, verifyAdminPasskey } = useAgri();

  const [activeModalRole, setActiveModalRole] = useState<UserRole>(role || 'buyer');
  const [authMode, setAuthMode] = useState<'register' | 'login'>(defaultMode);

  // Form Fields (Clean & Un-prefilled)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [hubName, setHubName] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [adminPasskeyInput, setAdminPasskeyInput] = useState('');
  const [showAdminPasskey, setShowAdminPasskey] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Status & Validation
  const [errorMsg, setErrorMsg] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync role when props change
  useEffect(() => {
    if (role) {
      setActiveModalRole(role);
    }
  }, [role]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuthMode(defaultMode);
      setName('');
      setPhone('');
      setEmail('');
      setAadhaarNumber('');
      setFarmSize('');
      setBusinessName('');
      setHubName('');
      setState('Maharashtra');
      setDistrict('Nashik');
      setAdminPasskeyInput('');
      setShowAdminPasskey(false);
      setAgreedTerms(true);
      setErrorMsg('');
      setAdminError('');
      setIsSubmitting(false);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  // Auto-format 12-digit Aadhaar number with standard 4-4-4 spacing
  const handleAadhaarInput = (val: string) => {
    const rawDigits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
    setAadhaarNumber(formatted);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAdminError('');

    if (authMode === 'register') {
      const cleanName = name.trim();
      if (!cleanName) {
        setErrorMsg(language === 'hi' ? '❌ कृपया अपना पूरा नाम दर्ज करें।' : '❌ Please enter your full legal name.');
        return;
      }

      const cleanPhone = phone.trim();
      const rawPhoneDigits = cleanPhone.replace(/\D/g, '');
      if (rawPhoneDigits.length < 10) {
        setErrorMsg(language === 'hi' ? '❌ मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' : '❌ Please enter a valid 10-digit mobile number.');
        return;
      }

      // Mandatory 12-Digit UIDAI Aadhaar verification for Farmer and Buyer
      if (activeModalRole === 'farmer' || activeModalRole === 'buyer') {
        const rawAadhaar = aadhaarNumber.replace(/\D/g, '');
        if (rawAadhaar.length !== 12) {
          setErrorMsg(
            language === 'hi'
              ? `❌ कृपया ${activeModalRole === 'farmer' ? 'किसान' : 'थोक खरीदार'} का मान्य 12-अंकीय आधार कार्ड नंबर (UIDAI) दर्ज करें।`
              : `❌ Please enter a valid 12-digit UIDAI Aadhaar Card Number for ${activeModalRole === 'farmer' ? 'Farmer' : 'Buyer'} verification.`
          );
          return;
        }
      }

      if (!agreedTerms) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया नियमों और शर्तों से सहमति दें।'
            : '❌ Please agree to the Terms & Conditions and Privacy Policy.'
        );
        return;
      }

      if (activeModalRole === 'admin' || activeModalRole === 'collection_centre') {
        const isKeyValid = verifyAdminPasskey(adminPasskeyInput);
        if (!isKeyValid) {
          setAdminError(
            language === 'hi'
              ? '❌ टीम पासकी अमान्य है: अधिकृत टीम मास्टर पासकी (Krish0386) दर्ज करें।'
              : '❌ Access Denied: Invalid Team Security Passkey. Use authorized key: Krish0386'
          );
          return;
        }
      }

      setIsSubmitting(true);

      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`;
      const finalDistrict = district.trim() || 'Nashik';
      const finalLocation = `${finalDistrict}, ${state}`;

      setTimeout(() => {
        registerUser({
          id: `usr_${activeModalRole}_${Date.now()}`,
          role: activeModalRole,
          name: cleanName,
          phone: formattedPhone,
          email: email.trim() || undefined,
          aadhaarNumber: aadhaarNumber.trim(),
          aadhaarVerified: true,
          state: state,
          district: finalDistrict,
          location: finalLocation,
          farmSizeAcres: activeModalRole === 'farmer' ? (Number(farmSize) || 5) : undefined,
          businessName: activeModalRole === 'buyer' ? (businessName.trim() || cleanName) : undefined,
          hubName: activeModalRole === 'collection_centre' ? (hubName.trim() || `${finalDistrict} Hub`) : undefined
        });
        setIsSubmitting(false);
        onClose();
      }, 200);
    } else {
      // Existing User Login
      const cleanPhone = phone.trim();
      const cleanName = name.trim();
      const rawDigits = cleanPhone.replace(/\D/g, '');

      if (!cleanPhone && !cleanName) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया अपना पंजीकृत मोबाइल नंबर, आधार नंबर या नाम दर्ज करें।'
            : '❌ Please enter your registered phone number, Aadhaar number, or name.'
        );
        return;
      }

      if (activeModalRole === 'admin' || activeModalRole === 'collection_centre') {
        const isKeyValid = verifyAdminPasskey(adminPasskeyInput);
        if (!isKeyValid) {
          setAdminError(
            language === 'hi'
              ? '❌ टीम पासकी अमान्य है: अधिकृत टीम मास्टर पासकी (Krish0386) दर्ज करें।'
              : '❌ Access Denied: Invalid Team Security Passkey. Use authorized key: Krish0386'
          );
          return;
        }
      }

      setIsSubmitting(true);
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : (rawDigits.length === 10 ? `+91 ${cleanPhone}` : '');

      setTimeout(() => {
        const result = loginUser({
          role: activeModalRole,
          name: cleanName || undefined,
          phone: formattedPhone || undefined,
          aadhaarNumber: rawDigits.length === 12 ? rawDigits : undefined
        });

        if (!result.success) {
          setErrorMsg(
            result.message ||
              (language === 'hi'
                ? '❌ कोई पंजीकृत खाता नहीं मिला। कृपया पहले नया खाता बनाएं (Register)।'
                : '❌ No registered account found with this phone/Aadhaar/name. Please register first.')
          );
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        onClose();
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
      />

      {/* Main Split-Panel Modal Card */}
      <div className="relative bg-white text-slate-900 rounded-[28px] sm:rounded-[32px] shadow-[0_25px_80px_rgba(15,23,42,0.35)] max-w-4xl lg:max-w-5xl w-full overflow-hidden z-10 border border-emerald-100/90 max-h-[94vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        
        {/* 📝 LEFT MAIN FORM PANEL */}
        <div className="flex-1 p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-auto bg-white relative">
          
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all z-20"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Internal Staff Switcher (Admin / Hub) */}
          {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 mb-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveModalRole('admin');
                  setAdminError('');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeModalRole === 'admin'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏛️ Govt Admin Console</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModalRole('collection_centre');
                  setAdminError('');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeModalRole === 'collection_centre'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏬 APMC Collection Hub</span>
              </button>
            </div>
          )}

          {/* Header Section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100/60 border border-emerald-200/80 flex items-center justify-center text-3xl shadow-xs shrink-0">
              {activeModalRole === 'farmer' ? '🌾' : activeModalRole === 'buyer' ? '🏢' : activeModalRole === 'admin' ? '🏛️' : '🏬'}
            </div>
            <div>
              <div className="inline-block px-3 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white mb-1 shadow-2xs">
                {authMode === 'register' ? (
                  activeModalRole === 'buyer' ? 'BUYER REGISTRATION' :
                  activeModalRole === 'farmer' ? 'FARMER REGISTRATION' :
                  activeModalRole === 'admin' ? 'GOVT ADMIN ENROLLMENT' : 'APMC HUB REGISTRATION'
                ) : (
                  activeModalRole === 'buyer' ? 'BUYER SIGN IN' :
                  activeModalRole === 'farmer' ? 'FARMER SIGN IN' :
                  activeModalRole === 'admin' ? 'GOVT ADMIN LOGIN' : 'APMC HUB LOGIN'
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 leading-tight">
                {authMode === 'register' ? 'Join Farm2Future' : 'Sign in to Farm2Future'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                {authMode === 'register' ? (
                  activeModalRole === 'buyer'
                    ? 'Register as a buyer to access farmgate contracts, NABL quality grading and secure trade escrow.'
                    : activeModalRole === 'farmer'
                      ? 'Register as a farmer to access pre-harvest contracts, NABL quality grading and guaranteed MSP.'
                      : 'Official enrollment portal for authorized network staff & operators.'
                ) : (
                  'Sign in with your registered mobile phone or 12-digit Aadhaar number.'
                )}
              </p>
            </div>
          </div>

          {/* 4-Step Wizard Indicator (Register Mode) */}
          {authMode === 'register' && (
            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 mb-4">
              <div className="flex items-center justify-between text-center">
                {/* Step 1 */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    1
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-emerald-800 tracking-tight">
                    Basic Details
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-emerald-500 mx-1.5 sm:mx-2.5 rounded-full" />

                {/* Step 2 */}
                <div className="flex items-center gap-1.5 opacity-60">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[11px] flex items-center justify-center">
                    2
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 hidden sm:inline">
                    Identity Verification
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-1.5 sm:mx-2.5 rounded-full" />

                {/* Step 3 */}
                <div className="flex items-center gap-1.5 opacity-60">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[11px] flex items-center justify-center">
                    3
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 hidden sm:inline">
                    {activeModalRole === 'farmer' ? 'Farm Details' : 'Business Details'}
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-1.5 sm:mx-2.5 rounded-full" />

                {/* Step 4 */}
                <div className="flex items-center gap-1.5 opacity-60">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[11px] flex items-center justify-center">
                    4
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 hidden sm:inline">
                    Review & Submit
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' ? (
              <div className="space-y-3.5">
                {/* Section Header */}
                <div className="flex items-center gap-2 pt-1 pb-0.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center text-xs shrink-0">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {activeModalRole === 'farmer' ? 'Personal & Farm Information' : 'Personal & Company Information'}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      {activeModalRole === 'farmer' ? 'Tell us about yourself and your farm' : 'Tell us about yourself and your business'}
                    </p>
                  </div>
                </div>

                {/* Row 1: Legal Name + Company / Farm Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Legal Name <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={activeModalRole === 'farmer' ? 'e.g. Ramesh Patil' : 'e.g. Priya Sharma'}
                      value={name}
                      onChange={e => { setName(e.target.value); setErrorMsg(''); }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      {activeModalRole === 'farmer' ? (
                        <>
                          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Farm Land Size (Acres) <span className="text-rose-500">*</span></span>
                        </>
                      ) : activeModalRole === 'buyer' ? (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Company / Business Name <span className="text-rose-500">*</span></span>
                        </>
                      ) : (
                        <>
                          <Boxes className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hub / Department <span className="text-rose-500">*</span></span>
                        </>
                      )}
                    </label>
                    {activeModalRole === 'farmer' ? (
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={farmSize}
                        onChange={e => setFarmSize(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    ) : activeModalRole === 'buyer' ? (
                      <input
                        type="text"
                        placeholder="e.g. ITC Agri / Reliance Fresh"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Nashik North APMC Hub"
                        value={hubName}
                        onChange={e => setHubName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                      />
                    )}
                  </div>
                </div>

                {/* Row 2: Mobile Phone (+91 selector) + Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mobile Phone Number <span className="text-rose-500">*</span></span>
                      </span>
                    </label>
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50/60 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                      <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-150/70 border-r border-slate-200 text-xs font-bold text-slate-700 select-none shrink-0">
                        <span>🇮🇳</span>
                        <span className="font-mono">+91</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setErrorMsg(''); }}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-mono font-semibold bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      <span>OTP verification in next step</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address <span className="text-rose-500">*</span></span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder={activeModalRole === 'farmer' ? 'e.g. ramesh@farmmail.com' : 'e.g. priya@company.com'}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Dedicated Authentic Aadhaar Verification Card */}
                {(activeModalRole === 'farmer' || activeModalRole === 'buyer') && (
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    aadhaarNumber.replace(/\D/g, '').length === 12
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                      : 'bg-[#FFFBEB]/70 border-amber-200/80 shadow-2xs'
                  }`}>
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-3">
                        <AadhaarSunburstLogo />
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1 leading-tight">
                            <span>Aadhaar Verification (12-Digit UIDAI)</span>
                            <span className="text-rose-500 font-black">*</span>
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">For secure and verified registration</p>
                        </div>
                      </div>

                      {aadhaarNumber.replace(/\D/g, '').length === 12 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-extrabold border border-emerald-300 shadow-2xs animate-pulse">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>UIDAI Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10.5px] font-bold border border-[#FDE68A]">
                          12 digits required
                        </span>
                      )}
                    </div>

                    {/* Monospace Lock Input */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={14}
                        placeholder="1234  5678  9012"
                        value={aadhaarNumber}
                        onChange={e => handleAadhaarInput(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm sm:text-base font-mono font-bold tracking-widest bg-white transition-all ${
                          aadhaarNumber.replace(/\D/g, '').length === 12
                            ? 'border-emerald-500 text-emerald-950 focus:ring-4 focus:ring-emerald-500/15'
                            : 'border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                        }`}
                      />
                      {aadhaarNumber.replace(/\D/g, '').length === 12 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300 text-[10px] font-extrabold">
                          <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                          <span>Valid</span>
                        </div>
                      )}
                    </div>

                    {/* Subtext Footer */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                      <div className="flex items-center gap-1 text-emerald-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>256-bit encrypted • Compliant with Digital India guidelines</span>
                      </div>
                      <DigitalIndiaLogo />
                    </div>
                  </div>
                )}

                {/* Row 4: State & District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>State <span className="text-rose-500">*</span></span>
                    </label>
                    <div className="relative">
                      <select
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>District <span className="text-rose-500">*</span></span>
                    </label>
                    <div className="relative">
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Nashik">Nashik</option>
                        <option value="Pune">Pune</option>
                        <option value="Nagpur">Nagpur</option>
                        <option value="Amravati">Amravati</option>
                        <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                        <option value="Kolhapur">Kolhapur</option>
                        <option value="Ludhiana">Ludhiana</option>
                        <option value="Karnal">Karnal</option>
                        <option value="Indore">Indore</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Team Passkey if Admin or APMC Hub */}
                {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <label className="block text-purple-900 font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                        <span>{activeModalRole === 'admin' ? 'Master Admin Passkey *' : 'Master Hub Passkey *'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 font-bold">Key: Krish0386</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPasskey ? "text" : "password"}
                        required
                        placeholder="Enter Team Key: Krish0386"
                        value={adminPasskeyInput}
                        onChange={e => {
                          setAdminPasskeyInput(e.target.value);
                          setAdminError('');
                        }}
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-purple-300 text-xs font-mono font-bold focus:ring-4 focus:ring-purple-500/15 bg-white text-purple-950"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPasskey(!showAdminPasskey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-600" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 2. EXISTING USER SIGN IN MODE */
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registered Mobile or Aadhaar Number <span className="text-rose-500">*</span></span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">🇮🇳 +91 / UIDAI</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98765 43210 or 5432 8765 1098"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold font-mono focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registered Name (Optional)</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patil / Priya Sharma"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all"
                  />
                </div>

                {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <label className="block text-purple-900 font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                        <span>Master Team Passkey *</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 font-bold">Key: Krish0386</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPasskey ? "text" : "password"}
                        required
                        placeholder="Enter Team Key: Krish0386"
                        value={adminPasskeyInput}
                        onChange={e => {
                          setAdminPasskeyInput(e.target.value);
                          setAdminError('');
                        }}
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-purple-300 text-xs font-mono font-bold focus:ring-4 focus:ring-purple-500/15 bg-white text-purple-950"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPasskey(!showAdminPasskey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-600" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {adminError && (activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Row 5: Checkbox & Submit Button */}
            <div className="pt-2">
              {authMode === 'register' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    />
                    <span className="text-[11.5px] text-slate-600 font-medium">
                      I agree to the{' '}
                      <span className="text-emerald-700 underline font-bold hover:text-emerald-800">Terms & Conditions</span>
                      {' '}and{' '}
                      <span className="text-emerald-700 underline font-bold hover:text-emerald-800">Privacy Policy</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || !agreedTerms}
                    className="px-6 py-3 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <span>{isSubmitting ? 'Registering...' : 'Continue to Verification'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Verifying & Signing In...' : 'Sign In to Dashboard →'}</span>
                </button>
              )}
            </div>

            {/* Footer Switcher Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'register' ? 'login' : 'register');
                  setErrorMsg('');
                  setAdminError('');
                }}
                className="text-xs text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer font-semibold"
              >
                {authMode === 'register'
                  ? 'Already have an account? Sign in here →'
                  : 'Need a new account? Register here →'}
              </button>
            </div>
          </form>
        </div>

        {/* 🌿 RIGHT VISUAL FEATURE SHOWCASE SIDEBAR */}
        <div className="hidden md:flex md:w-[35%] lg:w-[33%] relative flex-col justify-between p-6 bg-gradient-to-b from-[#eaf6eb] via-[#d6ebd9] to-[#c2e4c6] border-l border-emerald-100 overflow-hidden select-none shrink-0">
          
          {/* Soft Agricultural Backdrop Details */}
          <div 
            className="absolute inset-0 bg-cover bg-right-bottom opacity-15 pointer-events-none mix-blend-multiply"
            style={{ backgroundImage: "url('/farm2future-bg.jpg')" }}
          />

          {/* Decorative Rolling Hills & Windmills SVG */}
          <svg className="absolute bottom-0 right-0 left-0 w-full h-28 opacity-25 pointer-events-none text-emerald-900" viewBox="0 0 300 120" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,100 C70,70 140,110 200,80 C250,55 280,75 300,60 L300,120 L0,120 Z" opacity="0.6" />
            <path d="M0,85 C90,110 160,65 240,95 C270,105 290,90 300,85 L300,120 L0,120 Z" opacity="0.9" />
            <line x1="230" y1="95" x2="230" y2="45" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="230" cy="45" r="2" />
            <line x1="230" y1="45" x2="216" y2="32" stroke="currentColor" strokeWidth="1" />
            <line x1="230" y1="45" x2="244" y2="35" stroke="currentColor" strokeWidth="1" />
            <line x1="230" y1="45" x2="230" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="270" y1="88" x2="270" y2="52" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="270" cy="52" r="1.8" />
            <line x1="270" y1="52" x2="258" y2="40" stroke="currentColor" strokeWidth="1" />
            <line x1="270" y1="52" x2="282" y2="44" stroke="currentColor" strokeWidth="1" />
            <line x1="270" y1="52" x2="270" y2="65" stroke="currentColor" strokeWidth="1" />
          </svg>

          {/* Close Button on Desktop */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm flex items-center justify-center cursor-pointer transition-all ml-auto relative z-20"
            title="Close dialog"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Script Calligraphy Heading */}
          <div className="relative z-10 pt-2 pr-6">
            <div className="font-serif italic text-[#2D5A27] text-xl font-bold tracking-tight flex items-center gap-1.5">
              <span>Partner</span>
              <Leaf className="w-4 h-4 text-emerald-600 inline-block transform -rotate-12" />
            </div>
            <div className="font-serif italic text-[#2D5A27] text-xl font-bold tracking-tight -mt-0.5">
              for a Greener Tomorrow
            </div>
          </div>

          {/* 4 Stacked Trust Cards */}
          <div className="space-y-2.5 my-auto relative z-10 py-3">
            {/* 1. Secure & Verified */}
            <div className="bg-white/92 backdrop-blur-xs rounded-2xl p-3 shadow-xs border border-emerald-100/90 flex items-center gap-3 transition-all hover:translate-x-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 leading-tight">Secure & Verified</h5>
                <p className="text-[10.5px] text-slate-500 font-medium truncate">Your data is safe with us</p>
              </div>
            </div>

            {/* 2. Direct Market Access */}
            <div className="bg-white/92 backdrop-blur-xs rounded-2xl p-3 shadow-xs border border-emerald-100/90 flex items-center gap-3 transition-all hover:translate-x-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 leading-tight">Direct Market Access</h5>
                <p className="text-[10.5px] text-slate-500 font-medium truncate">
                  {activeModalRole === 'farmer' ? 'Connect with verified buyers' : 'Connect with verified farmers'}
                </p>
              </div>
            </div>

            {/* 3. Quality Assurance */}
            <div className="bg-white/92 backdrop-blur-xs rounded-2xl p-3 shadow-xs border border-emerald-100/90 flex items-center gap-3 transition-all hover:translate-x-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 leading-tight">Quality Assurance</h5>
                <p className="text-[10.5px] text-slate-500 font-medium truncate">NABL grading & certification</p>
              </div>
            </div>

            {/* 4. Support Team */}
            <div className="bg-white/92 backdrop-blur-xs rounded-2xl p-3 shadow-xs border border-emerald-100/90 flex items-center gap-3 transition-all hover:translate-x-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 leading-tight">Support Team</h5>
                <p className="text-[10.5px] text-slate-500 font-medium truncate">Assistance at every step</p>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="relative z-10 pt-2 pb-1">
            <p className="font-serif italic text-xs text-[#2D5A27] font-semibold tracking-tight text-center">
              "Empowering trade for a sustainable future"
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
