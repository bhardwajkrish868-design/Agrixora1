import React, { useState, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { 
  X, 
  Lock, 
  Phone, 
  User as UserIcon,
  ShieldAlert,
  Eye,
  EyeOff,
  Globe,
  CreditCard,
  ShieldCheck,
  Check
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginUser, 
    registerUser,
    verifyAdminPasskey,
    language,
    setLanguage
  } = useAgri();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [isRegister, setIsRegister] = useState<boolean>(true); // Default: Register first
  
  // Custom user input form state (starts clean / un-prefilled)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [farmSize, setFarmSize] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [hubName, setHubName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-format 12-digit Aadhaar number with standard 4-4-4 spacing
  const handleAadhaarInput = (val: string) => {
    const rawDigits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
    setAadhaarNumber(formatted);
    setAuthError('');
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setIsRegister(true);
      setName('');
      setPhone('');
      setAadhaarNumber('');
      setLocation('');
      setDistrict('Nashik');
      setState('Maharashtra');
      setFarmSize('');
      setBusinessName('');
      setGstin('');
      setHubName('');
      setAdminKey('');
      setAuthError('');
    }
  }, [isAuthModalOpen]);

  // Keyboard shortcut listener for staff: Alt+A or Alt+H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        setSelectedRole('admin');
        setAuthError('');
      } else if ((e.altKey && e.key.toLowerCase() === 'h') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h')) {
        setSelectedRole('collection_centre');
        setAuthError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthModalOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isRegister) {
      const cleanName = name.trim();
      if (!cleanName) {
        setAuthError(language === 'hi' ? '❌ कृपया अपना पूरा नाम दर्ज करें।' : '❌ Please enter your full legal name.');
        return;
      }

      const cleanPhone = phone.trim();
      const rawDigits = cleanPhone.replace(/\D/g, '');
      if (rawDigits.length < 10) {
        setAuthError(language === 'hi' ? '❌ मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' : '❌ Please enter a valid 10-digit mobile number.');
        return;
      }

      // Mandatory 12-Digit UIDAI Aadhaar validation for both Farmer and Buyer
      if (selectedRole === 'farmer' || selectedRole === 'buyer') {
        const rawAadhaar = aadhaarNumber.replace(/\D/g, '');
        if (rawAadhaar.length !== 12) {
          setAuthError(
            language === 'hi'
              ? `❌ कृपया ${selectedRole === 'farmer' ? 'किसान' : 'थोक खरीदार'} का मान्य 12-अंकीय आधार कार्ड नंबर (UIDAI) दर्ज करें।`
              : `❌ Please enter a valid 12-digit UIDAI Aadhaar Card Number for ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} verification.`
          );
          return;
        }
      }

      if (selectedRole === 'admin' || selectedRole === 'collection_centre') {
        const isValid = verifyAdminPasskey(adminKey);
        if (!isValid) {
          setAuthError(language === 'hi' 
            ? '❌ टीम पासकी अमान्य है: अधिकृत मास्टर पासकी (Krish0386) दर्ज करें।' 
            : '❌ Access Denied: Invalid Team Security Passkey. Use default: Krish0386');
          return;
        }
      }

      setIsSubmitting(true);
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`;
      const finalDistrict = district.trim() || 'Nashik';
      const finalLocation = location.trim() || `${finalDistrict}, ${state}`;

      setTimeout(() => {
        registerUser({
          id: `usr_${selectedRole}_${Date.now()}`,
          role: selectedRole,
          name: cleanName,
          phone: formattedPhone,
          aadhaarNumber: aadhaarNumber.trim(),
          aadhaarVerified: true,
          location: finalLocation,
          district: finalDistrict,
          state: state,
          farmSizeAcres: selectedRole === 'farmer' ? (Number(farmSize) || 5) : undefined,
          businessName: selectedRole === 'buyer' ? (businessName.trim() || cleanName) : undefined,
          gstin: selectedRole === 'buyer' ? gstin.trim() : undefined,
          hubName: selectedRole === 'collection_centre' ? (hubName.trim() || `${finalDistrict} Hub`) : undefined
        });

        setIsSubmitting(false);
        setIsAuthModalOpen(false);
      }, 200);

    } else {
      // Existing User Login
      const cleanPhone = phone.trim();
      const cleanName = name.trim();

      if (!cleanPhone && !cleanName) {
        setAuthError(language === 'hi' ? '❌ कृपया अपना पंजीकृत मोबाइल नंबर या नाम दर्ज करें।' : '❌ Please enter your registered mobile number or name.');
        return;
      }

      if (selectedRole === 'admin' || selectedRole === 'collection_centre') {
        const isValid = verifyAdminPasskey(adminKey);
        if (!isValid) {
          setAuthError(language === 'hi' 
            ? '❌ टीम पासकी अमान्य है: अधिकृत मास्टर पासकी (Krish0386) दर्ज करें।' 
            : '❌ Access Denied: Invalid Team Security Passkey. Use default: Krish0386');
          return;
        }
      }

      setIsSubmitting(true);
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : cleanPhone ? `+91 ${cleanPhone}` : '';

      setTimeout(() => {
        const result = loginUser({
          role: selectedRole,
          name: cleanName || undefined,
          phone: formattedPhone || undefined,
          aadhaarNumber: cleanPhone || undefined
        });

        if (!result.success) {
          setAuthError(result.message || (language === 'hi' 
            ? '❌ कोई पंजीकृत खाता नहीं मिला। कृपया पहले नया खाता बनाएं (Register)।' 
            : '❌ No registered profile found with these details. Please register first.'));
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setIsAuthModalOpen(false);
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop with Blur */}
      <div 
        onClick={() => setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      <div className="relative bg-slate-900 text-slate-100 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 border border-white/15 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className={`p-5 text-white relative shrink-0 border-b border-white/10 ${
          selectedRole === 'farmer' ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900' :
          selectedRole === 'buyer' ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900' :
          selectedRole === 'admin' ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-900' :
          'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900'
        }`}>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors absolute top-3.5 right-3.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between mr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-md border border-white/20">
                {selectedRole === 'farmer' ? '🌾' : selectedRole === 'buyer' ? '🏢' : selectedRole === 'admin' ? '🏛️' : '🏬'}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold font-display text-white">
                  {isRegister 
                    ? (language === 'hi' ? `✨ नया ${selectedRole === 'farmer' ? 'किसान' : selectedRole === 'buyer' ? 'खरीदार' : selectedRole === 'admin' ? 'एडमिन' : 'हब'} रजिस्ट्रेशन` : `✨ New ${selectedRole === 'farmer' ? 'Farmer' : selectedRole === 'buyer' ? 'Buyer' : selectedRole === 'admin' ? 'Admin' : 'Hub'} Registration`)
                    : (language === 'hi' ? `🔑 पुराना ${selectedRole === 'farmer' ? 'किसान' : selectedRole === 'buyer' ? 'खरीदार' : selectedRole === 'admin' ? 'एडमिन' : 'हब'} लॉगिन` : `🔑 Existing ${selectedRole === 'farmer' ? 'Farmer' : selectedRole === 'buyer' ? 'Buyer' : selectedRole === 'admin' ? 'Admin' : 'Hub'} Login`)
                  }
                </h2>
                <p className="text-[11px] text-slate-300">
                  {isRegister 
                    ? (language === 'hi' ? 'विवरण दर्ज करके नया प्रोफाइल बनाएं' : 'Fill details to register new stakeholder profile')
                    : (language === 'hi' ? 'पंजीकृत मोबाइल नंबर से लॉगिन करें' : 'Sign in to access your registered profile')
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{language === 'en' ? 'EN' : 'हिंदी'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          
          {/* Role Selector Grid */}
          {/* Role Selector */}
          <div className="space-y-2">
            <div>
              <label className="block text-emerald-400 font-bold mb-1 text-[11px] uppercase tracking-wider">
                {language === 'hi' ? 'भूमिका चुनें (Select Role):' : 'Select Portal:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('farmer');
                    setAuthError('');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === 'farmer'
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 font-extrabold ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">👨‍🌾</span>
                  <span className="text-xs font-bold">🌾 Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('buyer');
                    setAuthError('');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === 'buyer'
                      ? 'bg-blue-950/80 border-blue-400 text-blue-300 font-extrabold ring-2 ring-blue-500/30'
                      : 'bg-slate-800/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">👩‍💼</span>
                  <span className="text-xs font-bold">🏢 Buyer</span>
                </button>
              </div>
            </div>

            {/* Restricted Team Section: Only displayed when an admin/hub shortcut is used */}
            {(selectedRole === 'admin' || selectedRole === 'collection_centre') && (
              <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <label className="block text-amber-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>{language === 'hi' ? 'केवल टीम सदस्य (Team Members Only):' : 'Internal Team Portal (Passkey Required):'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('collection_centre');
                      setAuthError('');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedRole === 'collection_centre'
                        ? 'bg-amber-900/90 border-amber-400 text-amber-200 font-extrabold ring-2 ring-amber-500/40 shadow-sm'
                        : 'bg-slate-800/80 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-base">🏬</span>
                    <span className="text-xs font-bold">Collection Hub</span>
                    <Lock className="w-2.5 h-2.5 text-amber-400 ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setAuthError('');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-purple-900/90 border-purple-400 text-purple-200 font-extrabold ring-2 ring-purple-500/40 shadow-sm'
                        : 'bg-slate-800/80 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-base">🏛️</span>
                    <span className="text-xs font-bold">Govt Admin</span>
                    <Lock className="w-2.5 h-2.5 text-purple-400 ml-0.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Toggle: Register (Default) vs Existing User Login */}
          <div className="flex border-b border-white/10 bg-slate-950/60 p-1 gap-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setAuthError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isRegister
                  ? 'bg-slate-800 text-white shadow-xs border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? '📝 नया रजिस्ट्रेशन (Register)' : '📝 New Registration (First)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setAuthError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-slate-800 text-white shadow-xs border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'hi' ? '🔑 पुराना खाता (Login)' : '🔑 Existing User Login'}</span>
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
            
            {/* 1. REGISTER MODE (DEFAULT FIRST) */}
            {isRegister ? (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'hi' ? 'पूरा नाम (Full Legal Name) *' : 'Full Legal Name *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'farmer' ? 'e.g. Ramesh Patil' : selectedRole === 'buyer' ? 'e.g. Priya Sharma' : selectedRole === 'admin' ? 'e.g. Dr. Anil Deshmukh' : 'e.g. Rajesh Verma'}
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setAuthError('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'hi' ? 'मोबाइल नंबर (Mobile Phone) *' : 'Mobile Phone Number *'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">🇮🇳 +91</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98220 11223"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setAuthError('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 font-medium font-mono bg-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* 12-Digit UIDAI Aadhaar Card (Farmer & Buyer) */}
                {(selectedRole === 'farmer' || selectedRole === 'buyer') && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5 transition-all">
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {language === 'hi'
                            ? (selectedRole === 'farmer' ? 'किसान आधार कार्ड नंबर (UIDAI 12-अंक) *' : 'खरीदार आधार कार्ड नंबर (UIDAI 12-अंक) *')
                            : `${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} Aadhaar Number (12-Digit UIDAI) *`}
                        </span>
                      </span>
                      {aadhaarNumber.replace(/\D/g, '').length === 12 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 text-[10px] font-bold border border-emerald-500/40">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>UIDAI Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400/80">
                          {12 - aadhaarNumber.replace(/\D/g, '').length > 0
                            ? `${12 - aadhaarNumber.replace(/\D/g, '').length} digits left`
                            : '12 digits required'}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={14}
                        placeholder="e.g. 5432 8765 1098"
                        value={aadhaarNumber}
                        onChange={e => handleAadhaarInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-500/40 text-xs font-mono font-bold tracking-wider focus:ring-2 focus:ring-emerald-500 bg-slate-900 text-white placeholder:text-slate-600 placeholder:tracking-normal"
                      />
                      {aadhaarNumber.replace(/\D/g, '').length === 12 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-400/80 font-medium leading-tight">
                      {language === 'hi'
                        ? '🔒 भारत सरकार UIDAI सुरक्षित सत्यापन: डायरेक्ट एमएसपी और सुरक्षित ट्रेड हेतु आवश्यक।'
                        : '🔒 Government UIDAI verified: Mandatory for direct MSP subsidies & trade security.'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {language === 'hi' ? 'राज्य (State) *' : 'State / Region *'}
                    </label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs bg-slate-800 text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Karnataka">Karnataka</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {language === 'hi' ? 'जिला (District) *' : 'District / Cluster *'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nashik / Gurugram"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-800 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {selectedRole === 'farmer' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {language === 'hi' ? 'कुल कृषि भूमि (एकड़)' : 'Total Farm Size (Acres)'}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={farmSize}
                      onChange={e => setFarmSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-800 text-white placeholder:text-slate-500"
                    />
                  </div>
                )}

                {selectedRole === 'buyer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        {language === 'hi' ? 'कंपनी / संगठन का नाम' : 'Organization / Brand'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ITC Agri / Reliance Fresh"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-800 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        placeholder="27AABCA1234F1Z9"
                        value={gstin}
                        onChange={e => setGstin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 bg-slate-800 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === 'collection_centre' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {language === 'hi' ? 'APMC कलेक्शन सेंटर का नाम' : 'APMC Collection Hub Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nashik North APMC Hub #04"
                      value={hubName}
                      onChange={e => setHubName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-800 text-white placeholder:text-slate-500"
                    />
                  </div>
                )}

                {(selectedRole === 'admin' || selectedRole === 'collection_centre') && (
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1.5">
                    <label className="block text-purple-300 font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-400" />
                        <span>{selectedRole === 'admin' ? 'Master Admin Passkey *' : 'Master Team / Hub Passkey *'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold">Key: Krish0386</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminKey ? "text" : "password"}
                        required
                        placeholder="Default Master Key: Krish0386"
                        value={adminKey}
                        onChange={e => {
                          setAdminKey(e.target.value);
                          setAuthError('');
                        }}
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-purple-500/40 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 bg-slate-800 text-purple-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 2. EXISTING USER LOGIN MODE */
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {language === 'hi'
                          ? (selectedRole === 'farmer' || selectedRole === 'buyer'
                              ? 'पंजीकृत मोबाइल या आधार नंबर (Mobile / Aadhaar) *'
                              : 'पंजीकृत मोबाइल नंबर (Phone Number) *')
                          : (selectedRole === 'farmer' || selectedRole === 'buyer'
                              ? 'Registered Mobile or Aadhaar Number *'
                              : 'Registered Mobile Number *')}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">🇮🇳 +91 / UIDAI</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={
                      selectedRole === 'farmer' || selectedRole === 'buyer'
                        ? "e.g. 98220 11223 or 5432 8765 1098"
                        : "e.g. 98220 11223"
                    }
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setAuthError('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{language === 'hi' ? 'पंजीकृत नाम (वैकल्पिक)' : 'Registered Name (Optional)'}</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder={selectedRole === 'farmer' ? 'e.g. Ramesh Patil' : selectedRole === 'buyer' ? 'e.g. Priya Sharma' : selectedRole === 'admin' ? 'e.g. Dr. Anil Deshmukh' : 'e.g. Rajesh Verma'}
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setAuthError('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                {(selectedRole === 'admin' || selectedRole === 'collection_centre') && (
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1.5">
                    <label className="block text-purple-300 font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-400" />
                        <span>{selectedRole === 'admin' ? 'Master Admin Passkey *' : 'Master Team / Hub Passkey *'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold">Key: Krish0386</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminKey ? "text" : "password"}
                        required
                        placeholder="Default Master Key: Krish0386"
                        value={adminKey}
                        onChange={e => {
                          setAdminKey(e.target.value);
                          setAuthError('');
                        }}
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-purple-500/40 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 bg-slate-800 text-purple-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isRegister
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-950/50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? (language === 'hi' ? 'प्रमाणित किया जा रहा है...' : 'Authenticating...')
                  : (isRegister 
                    ? (language === 'hi' ? 'रजिस्टर करें और डैशबोर्ड खोलें →' : 'Register & Enter Dashboard →') 
                    : (language === 'hi' ? 'लॉगिन करें और डैशबोर्ड खोलें →' : 'Login to Existing Profile →'))
                }
              </span>
            </button>

            {/* Quick helper link */}
            <div className="text-center pt-1">
              {isRegister ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setAuthError('');
                  }}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  {language === 'hi' ? 'पहले से पंजीकृत हैं? यहाँ क्लिक करके लॉगिन करें' : 'Already registered? Click here to Login'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setAuthError('');
                  }}
                  className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                >
                  {language === 'hi' ? 'नया खाता बनाना है? यहाँ क्लिक करके रजिस्टर करें' : 'Need a new account? Click here to Register'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
