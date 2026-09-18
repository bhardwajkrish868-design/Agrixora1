import React, { useState, useEffect, useRef } from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { 
  ArrowRight, 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  Lock, 
  Phone, 
  User as UserIcon, 
  Clock, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  X, 
  Building2, 
  Sprout, 
  Truck, 
  TrendingUp, 
  Boxes, 
  Shield, 
  KeyRound,
  CreditCard,
  MapPin,
  BadgeCheck 
} from 'lucide-react';

export const WelcomeGatewayView: React.FC = () => {
  const { loginUser, registerUser, language, setLanguage, verifyAdminPasskey } = useAgri();

  // Selected role & modal state
  const [activeModalRole, setActiveModalRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Form states (clean / un-prefilled)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('882910');
  const [generatedOtp, setGeneratedOtp] = useState('882910');
  const [isOtpSent, setIsOtpSent] = useState(true);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [smsToast, setSmsToast] = useState<{ show: boolean; otp: string; phone: string } | null>(null);

  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [farmSize, setFarmSize] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [hubName, setHubName] = useState('');
  const [adminPasskeyInput, setAdminPasskeyInput] = useState('');
  const [showAdminPasskey, setShowAdminPasskey] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-format 12-digit Aadhaar number with standard 4-4-4 spacing
  const handleAadhaarInput = (val: string) => {
    const rawDigits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
    setAadhaarNumber(formatted);
    setOtpError('');
  };

  const [logoClicks, setLogoClicks] = useState(0);
  const logoClickTimeoutRef = useRef<any>(null);

  // Triple click logo handler to open team portal secretly
  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        handleOpenRoleModal('admin');
        return 0;
      }
      if (logoClickTimeoutRef.current) clearTimeout(logoClickTimeoutRef.current);
      logoClickTimeoutRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 1500);
      return next;
    });
  };

  // Check URL query parameters for team access (e.g. ?team=admin or ?role=hub)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const targetRole = params.get('team') || params.get('role');
      if (targetRole === 'admin') {
        handleOpenRoleModal('admin');
      } else if (targetRole === 'hub' || targetRole === 'collection_centre') {
        handleOpenRoleModal('collection_centre');
      }
    } catch {}
  }, []);

  // Keyboard shortcuts for team members: Alt+A for Admin, Alt+H for Hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        handleOpenRoleModal('admin');
      } else if ((e.altKey && e.key.toLowerCase() === 'h') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h')) {
        e.preventDefault();
        handleOpenRoleModal('collection_centre');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpCountdown]);

  // Open role modal with defaults (empty fields for clean new registration)
  const handleOpenRoleModal = (role: UserRole) => {
    setActiveModalRole(role);
    setAuthMode('register');
    setAdminError('');
    setOtpError('');
    setSmsToast(null);

    // Start with empty clean inputs so user enters their own details
    setName('');
    setPhone('');
    setAadhaarNumber('');
    setOtp('');
    setGeneratedOtp('');
    setOtpVerified(true);
    setState('Maharashtra');
    setDistrict('Nashik');
    setLocation('Nashik, Maharashtra');
    setFarmSize('');
    setBusinessName('');
    setGstin('');
    setHubName('');
    setAdminPasskeyInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setOtpError('');

    if (!activeModalRole) return;

    if (authMode === 'register') {
      const cleanName = name.trim();
      if (!cleanName) {
        setOtpError(language === 'hi' ? '❌ कृपया अपना पूरा नाम दर्ज करें।' : '❌ Please enter your full legal name.');
        return;
      }

      const cleanPhone = phone.trim();
      const rawDigits = cleanPhone.replace(/\D/g, '');
      if (rawDigits.length < 10) {
        setOtpError(language === 'hi' ? '❌ मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' : '❌ Please enter a valid 10-digit mobile number.');
        return;
      }

      // Mandatory 12-Digit UIDAI Aadhaar validation for both Farmer and Buyer
      if (activeModalRole === 'farmer' || activeModalRole === 'buyer') {
        const rawAadhaar = aadhaarNumber.replace(/\D/g, '');
        if (rawAadhaar.length !== 12) {
          setOtpError(
            language === 'hi'
              ? `❌ कृपया ${activeModalRole === 'farmer' ? 'किसान' : 'थोक खरीदार'} का मान्य 12-अंकीय आधार कार्ड नंबर (UIDAI) दर्ज करें।`
              : `❌ Please enter a valid 12-digit UIDAI Aadhaar Card Number for ${activeModalRole === 'farmer' ? 'Farmer' : 'Buyer'} verification.`
          );
          return;
        }
      }

      if (activeModalRole === 'admin' || activeModalRole === 'collection_centre') {
        const isKeyValid = verifyAdminPasskey(adminPasskeyInput);
        if (!isKeyValid) {
          setAdminError(language === 'hi' 
            ? '❌ टीम पासकी अमान्य है: अधिकृत टीम मास्टर पासकी (Krish0386) दर्ज करें।' 
            : '❌ Access Denied: Invalid Team Security Passkey. Use authorized key: Krish0386');
          return;
        }
      }

      setIsSubmitting(true);

      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`;
      const finalDistrict = district.trim() || 'Nashik';
      const finalLocation = location.trim() || `${finalDistrict}, ${state}`;

      setTimeout(() => {
        registerUser({
          id: `usr_${activeModalRole}_${Date.now()}`,
          role: activeModalRole,
          name: cleanName,
          phone: formattedPhone,
          aadhaarNumber: aadhaarNumber.trim(),
          aadhaarVerified: true,
          state: state,
          district: finalDistrict,
          location: finalLocation,
          farmSizeAcres: activeModalRole === 'farmer' ? (Number(farmSize) || 5) : undefined,
          businessName: activeModalRole === 'buyer' ? (businessName.trim() || cleanName) : undefined,
          gstin: activeModalRole === 'buyer' ? gstin.trim() : undefined,
          hubName: activeModalRole === 'collection_centre' ? (hubName.trim() || `${finalDistrict} Hub`) : undefined
        });
        setIsSubmitting(false);
        setActiveModalRole(null);
      }, 200);
    } else {
      // Existing User Login Mode
      const cleanPhone = phone.trim();
      const cleanName = name.trim();
      const rawDigits = cleanPhone.replace(/\D/g, '');

      if (!cleanPhone && !cleanName) {
        setOtpError(language === 'hi' ? '❌ कृपया अपना पंजीकृत मोबाइल नंबर, आधार नंबर या नाम दर्ज करें।' : '❌ Please enter your registered phone number, Aadhaar number, or name.');
        return;
      }

      if (activeModalRole === 'admin' || activeModalRole === 'collection_centre') {
        const isKeyValid = verifyAdminPasskey(adminPasskeyInput);
        if (!isKeyValid) {
          setAdminError(language === 'hi' 
            ? '❌ टीम पासकी अमान्य है: अधिकृत टीम मास्टर पासकी (Krish0386) दर्ज करें।' 
            : '❌ Access Denied: Invalid Team Security Passkey. Use authorized key: Krish0386');
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
          setOtpError(result.message || (language === 'hi' ? '❌ कोई पंजीकृत खाता नहीं मिला। कृपया पहले नया खाता बनाएं (Register)।' : '❌ No registered account found with this phone/Aadhaar/name. Please register first.'));
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setActiveModalRole(null);
      }, 200);
    }
  };

  return (
    <div className="relative h-screen w-full flex flex-col justify-between overflow-y-auto md:overflow-hidden font-sans select-none bg-slate-50 text-slate-900">
      
      {/* 🌾 Cinematic Scenic Farm Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/farm2future-bg.jpg')" }}
      />

      {/* Radiant Light Theme Frosted & Vignette Overlay */}
      <div className="absolute inset-0 bg-white/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/45 to-white/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-white/60 pointer-events-none" />

      {/* Subtle Tech Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* 🌟 Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between shrink-0 border-b border-emerald-900/10 bg-white/80 backdrop-blur-md shadow-xs">
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="Farm2Future"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 flex items-center justify-center text-white text-lg shadow-md shadow-emerald-700/20 ring-1 ring-emerald-600/20 group-hover:scale-105 transition-transform">
            🌱
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight font-display text-slate-900">
              Farm<span className="text-emerald-600">2Future</span>
            </span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs border border-slate-200/80 transition-all cursor-pointer hover:scale-105"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </header>

      {/* 🚀 SINGLE UNIFIED HOME PAGE */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center my-auto py-2 sm:py-3 space-y-3 sm:space-y-4 animate-in fade-in duration-300 flex-1 flex flex-col justify-center">
        
        {/* Main Hero Header */}
        <div className="space-y-1.5 sm:space-y-2 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-slate-900 leading-snug">
            {language === 'hi' ? (
              <>
                भारतीय कृषि का <span className="text-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">स्मार्ट डिजिटल नेटवर्क</span>
              </>
            ) : (
              <>
                Connecting Indian Agriculture with <span className="text-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">Direct Markets</span> & Guaranteed Escrow
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 font-semibold max-w-2xl mx-auto leading-normal line-clamp-2">
            {language === 'hi'
              ? '4 महीने पहले अग्रिम अनुबंध, ₹0 खेत से परिवहन, NABL प्रमाणित गुणवत्ता और 100% सुरक्षित भुगतान प्रणाली के साथ किसान और खरीदार को सीधे जोड़ने वाला एकीकृत मंच।'
              : 'Direct farm-to-enterprise procurement with 4-month pre-harvest contracts, ₹0 farmgate logistics pickup, NABL quality grading, and automated escrow settlement.'}
          </p>

          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-emerald-600/30" />
            <span className="text-[10px] sm:text-xs font-extrabold tracking-wider uppercase text-emerald-900 bg-emerald-100/90 px-3 py-0.5 rounded-full border border-emerald-300 shadow-xs">
              🌱 {language === 'hi' ? 'रजिस्ट्रेशन या लॉगिन के लिए अपना पोर्टल चुनें' : 'Select your stakeholder portal to Register or Sign In'}
            </span>
            <span className="h-px w-10 bg-emerald-600/30" />
          </div>
        </div>

        {/* 🌟 2 PRIMARY PUBLIC CARDS (FOR ALL VISITORS COMING ON THE WEBSITE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-left max-w-4xl mx-auto w-full">
          
          {/* Primary Public Card 1: Farmer */}
          <div 
            onClick={() => handleOpenRoleModal('farmer')}
            className="group relative bg-white/90 hover:bg-white/98 rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/40 hover:border-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.14)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.24)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-2xl sm:text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  👨‍🌾
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {language === 'hi' ? '🌾 किसान पोर्टल' : '🌾 Farmer Portal'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors font-display leading-tight">
                {language === 'hi' ? 'भारतीय किसान (Kisan Portal)' : 'Farmers & Producers'}
              </h3>
              
              <p className="text-xs text-slate-600 font-medium mt-1.5 leading-snug line-clamp-2">
                {language === 'hi'
                  ? '4 महीने पहले अग्रिम कॉर्पोरेट अनुबंध, शून्य (₹0) खेत से परिवहन खर्च, NABL गुणवत्ता जांच और सीधे बैंक खाते में सुरक्षित एस्क्रो भुगतान।'
                  : 'Get guaranteed advance procurement contracts, ₹0 farmgate pickup logistics, transparent grading, and direct escrow bank payouts.'}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold border border-emerald-200">
                  ✓ ₹0 Farmgate Pickup
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold border border-emerald-200">
                  ✓ 4-Month Contracts
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold border border-emerald-200">
                  ✓ Guaranteed Escrow
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-3">
              <div className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md shadow-emerald-700/20 group-hover:scale-[1.01] transition-transform">
                <span>{language === 'hi' ? 'किसान पोर्टल में प्रवेश करें →' : 'Enter Farmer Portal →'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Primary Public Card 2: Buyer */}
          <div 
            onClick={() => handleOpenRoleModal('buyer')}
            className="group relative bg-white/90 hover:bg-white/98 rounded-2xl p-4 sm:p-5 border-2 border-blue-500/40 hover:border-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_16px_36px_rgba(37,99,235,0.24)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-2xl sm:text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  🏢
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                  {language === 'hi' ? '🏢 खरीदार पोर्टल' : '🏢 Bulk Buyer Portal'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors font-display leading-tight">
                {language === 'hi' ? 'थोक खरीदार एवं कॉर्पोरेट (Buyer Portal)' : 'Bulk Buyers & Retailers'}
              </h3>
              
              <p className="text-xs text-slate-600 font-medium mt-1.5 leading-snug line-clamp-2">
                {language === 'hi'
                  ? '50T–500T थोक मांग पूलिंग, NABL मान्यता प्राप्त प्रयोगशाला जांच, लाइव जीपीएस वाहन ट्रैकिंग और सुरक्षित एस्क्रो फंड सुरक्षा।'
                  : 'Pool 50T-500T bulk crop requirements, verify NABL lab quality parameters, track refrigerated delivery fleets, and secure payment via escrow.'}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] sm:text-[11px] font-bold border border-blue-200">
                  ✓ 50T–500T Pooling
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] sm:text-[11px] font-bold border border-blue-200">
                  ✓ NABL Lab Quality
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] sm:text-[11px] font-bold border border-blue-200">
                  ✓ Escrow Protection
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-3">
              <div className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md shadow-blue-700/20 group-hover:scale-[1.01] transition-transform">
                <span>{language === 'hi' ? 'खरीदार पोर्टल में प्रवेश करें →' : 'Enter Buyer Portal →'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 🌿 Bottom Pillar Ribbon */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-2.5 pt-1 shrink-0">
        <div className="bg-white/85 backdrop-blur-md text-slate-700 rounded-xl sm:rounded-full py-1.5 sm:py-2 px-4 sm:px-6 border border-white/60 shadow-md flex items-center justify-around gap-2 text-[11px] sm:text-xs font-bold">
          
          <div className="flex items-center gap-1.5 text-emerald-800">
            <span className="text-sm">🌱</span>
            <span className="font-extrabold tracking-wide">Stronger Farms</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-blue-800">
            <span className="text-sm">👥</span>
            <span className="font-extrabold tracking-wide">Fairer Markets</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-teal-800">
            <span className="text-sm">🍃</span>
            <span className="font-extrabold tracking-wide">Cleaner Planet</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-amber-800">
            <span className="text-sm">📊</span>
            <span className="font-extrabold tracking-wide">Brighter Futures</span>
          </div>

          {/* Discreet Team Staff Access Icon (subtle, non-intrusive) */}
          <button 
            type="button"
            onClick={() => handleOpenRoleModal('admin')} 
            className="opacity-30 hover:opacity-100 text-slate-400 hover:text-amber-600 transition-opacity p-1 cursor-pointer"
            title=""
            aria-label="Staff Portal"
          >
            <Lock className="w-3 h-3" />
          </button>

        </div>
      </footer>

      {/* 🔐 AUTHENTICATION MODAL (Clean Light Theme) */}
      {activeModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          
          {/* Backdrop Blur */}
          <div 
            onClick={() => setActiveModalRole(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative bg-white text-slate-900 rounded-[28px] sm:rounded-[32px] shadow-[0_25px_70px_rgba(15,23,42,0.35)] max-w-lg w-full overflow-hidden z-10 border border-slate-100 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* 🌟 Modal Header with Glassmorphic Depth */}
            <div className={`p-5 sm:p-6 text-white relative shrink-0 overflow-hidden border-b border-white/10 ${
              activeModalRole === 'farmer' ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950' :
              activeModalRole === 'buyer' ? 'bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-950' :
              activeModalRole === 'admin' ? 'bg-gradient-to-br from-purple-700 via-purple-800 to-slate-950' :
              'bg-gradient-to-br from-amber-600 via-amber-700 to-slate-950'
            }`}>
              {/* Ambient Glow Orb */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

              {/* Close Button */}
              <button
                onClick={() => setActiveModalRole(null)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all absolute top-4 right-4 cursor-pointer backdrop-blur-xs shadow-xs"
                title="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-lg shrink-0">
                  {activeModalRole === 'farmer' ? '🌾' : activeModalRole === 'buyer' ? '🏢' : activeModalRole === 'admin' ? '🏛️' : '🏬'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/15 backdrop-blur-md border border-white/20 text-white/90 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {activeModalRole === 'farmer' ? 'Kisan Smart Mandi Network' :
                       activeModalRole === 'buyer' ? 'Institutional Procurement & Escrow' :
                       activeModalRole === 'admin' ? 'Authorized Govt Console' :
                       'APMC Collection Hub Operations'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white leading-tight">
                    {authMode === 'register' ? (
                      activeModalRole === 'farmer' ? 'New Farmer Registration' :
                      activeModalRole === 'buyer' ? 'New Buyer Registration' :
                      activeModalRole === 'admin' ? 'Govt Admin Enrollment' :
                      'New APMC Hub Registration'
                    ) : (
                      activeModalRole === 'farmer' ? 'Farmer Sign In' :
                      activeModalRole === 'buyer' ? 'Buyer Sign In' :
                      activeModalRole === 'admin' ? 'Govt Admin Console' :
                      'APMC Collection Hub Login'
                    )}
                  </h3>

                  <p className="text-xs text-white/80 mt-0.5 font-normal leading-relaxed">
                    {authMode === 'register' 
                      ? (language === 'hi' 
                          ? 'नया सत्यापित प्रोफाइल बनाएं और तुरंत डैशबोर्ड में प्रवेश करें' 
                          : (activeModalRole === 'buyer' ? 'Direct farmgate contracts, NABL quality grading & trade escrow' : 'Pre-harvest contracts, ₹0 farmgate pickup & guaranteed MSP'))
                      : (language === 'hi' 
                          ? 'पंजीकृत मोबाइल या 12-अंक आधार नंबर दर्ज करके लॉगिन करें' 
                          : 'Sign in with your registered mobile or 12-digit Aadhaar number')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Team Role Switcher inside Modal (Only visible when secret team access is open) */}
            {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
              <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalRole('admin');
                    setAdminError('');
                    setOtpError('');
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
                    setOtpError('');
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

            {/* 🏷️ Sleek Segmented Switcher */}
            <div className="px-5 pt-3.5 pb-2 bg-white border-b border-slate-100 shrink-0">
              <div className="flex bg-slate-100/90 p-1 rounded-2xl gap-1 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setOtpError('');
                    setAdminError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeModalRole === 'buyer' ? 'bg-blue-600' : 'bg-emerald-600'}`} />
                  <span>{language === 'hi' ? '📝 नया रजिस्ट्रेशन (Register)' : '📝 New Registration (First)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setOtpError('');
                    setAdminError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'hi' ? '🔑 पुराना खाता (Sign In)' : '🔑 Existing User Sign In'}</span>
                </button>
              </div>
            </div>

            {/* Modal Body / Form */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs bg-white text-slate-800">
              
              {/* Notice for Team Roles */}
              {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-900">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="block text-amber-900 font-bold">
                      {language === 'hi' ? '🔒 आंतरिक टीम पोर्टल (Team Members Only):' : '🔒 Internal Team & Operator Portal:'}
                    </strong>
                    <span>
                      {language === 'hi' 
                        ? 'यह पोर्टल केवल अधिकृत टीम सदस्यों के लिए है। आगे बढ़ने के लिए मास्टर टीम पासकी (Krish0386) आवश्यक है।' 
                        : 'This portal is restricted to Farm2Future team members. Authorized Master Passkey (Krish0386) is required.'}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* 1. REGISTER MODE (DEFAULT FIRST) */}
                {authMode === 'register' ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>{language === 'hi' ? 'पूरा नाम (Full Legal Name) *' : 'Full Legal Name *'}</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={activeModalRole === 'farmer' ? 'e.g. Ramesh Patil' : activeModalRole === 'buyer' ? 'e.g. Priya Sharma' : activeModalRole === 'admin' ? 'e.g. Dr. Anil Deshmukh' : 'e.g. Rajesh Verma'}
                          value={name}
                          onChange={e => {
                            setName(e.target.value);
                            setOtpError('');
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          {activeModalRole === 'farmer' ? (
                            <>
                              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{language === 'hi' ? 'कुल कृषि भूमि (एकड़) *' : 'Farm Land (Acres) *'}</span>
                            </>
                          ) : activeModalRole === 'buyer' ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{language === 'hi' ? 'कंपनी / व्यवसाय का नाम *' : 'Company / Business Name *'}</span>
                            </>
                          ) : activeModalRole === 'collection_centre' ? (
                            <>
                              <Boxes className="w-3.5 h-3.5 text-amber-600" />
                              <span>{language === 'hi' ? 'APMC हब सेंटर *' : 'APMC Hub Center *'}</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-3.5 h-3.5 text-purple-600" />
                              <span>{language === 'hi' ? 'विभाग *' : 'Department *'}</span>
                            </>
                          )}
                        </label>
                        {activeModalRole === 'farmer' ? (
                          <input
                            type="number"
                            placeholder="e.g. 5"
                            value={farmSize}
                            onChange={e => setFarmSize(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          />
                        ) : activeModalRole === 'buyer' ? (
                          <input
                            type="text"
                            placeholder="e.g. ITC Agri / Reliance Fresh"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. Nashik North Hub #04"
                            value={hubName}
                            onChange={e => setHubName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          />
                        )}
                      </div>
                    </div>

                    {/* Mobile Phone with Prefix Badge */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{language === 'hi' ? 'मोबाइल नंबर (OTP सत्यापन) *' : 'Mobile Phone Number *'}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ OTP Instant Verify
                        </span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs font-mono font-bold text-slate-500 select-none">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="98220 11223"
                          value={phone}
                          onChange={e => {
                            setPhone(e.target.value);
                            setOtpError('');
                          }}
                          className="w-full pl-18 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold font-mono bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>

                    {/* 🆔 12-Digit UIDAI Aadhaar Digital Smart Card */}
                    {(activeModalRole === 'farmer' || activeModalRole === 'buyer') && (
                      <div className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                        aadhaarNumber.replace(/\D/g, '').length === 12
                          ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 border-emerald-300 shadow-xs'
                          : 'bg-gradient-to-br from-slate-50 via-white to-slate-50/80 border-slate-200/90 shadow-2xs'
                      }`}>
                        {/* Top Tricolor Accent Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-80" />

                        {/* Aadhaar Header Row */}
                        <div className="flex items-center justify-between mb-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base leading-none">🇮🇳</span>
                            <div>
                              <p className="text-[10px] font-extrabold tracking-wider uppercase text-slate-700 leading-none">
                                UIDAI • Government of India
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium mt-0.5">National Identity & Direct Benefit Verification</p>
                            </div>
                          </div>
                          {aadhaarNumber.replace(/\D/g, '').length === 12 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 animate-pulse">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>UIDAI Verified</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {12 - aadhaarNumber.replace(/\D/g, '').length > 0
                                ? `${12 - aadhaarNumber.replace(/\D/g, '').length} digits left`
                                : '12 digits required'}
                            </span>
                          )}
                        </div>

                        {/* Input Row */}
                        <label className="block text-[11px] font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CreditCard className={`w-3.5 h-3.5 ${activeModalRole === 'buyer' ? 'text-blue-600' : 'text-emerald-600'}`} />
                            <span>
                              {language === 'hi' 
                                ? (activeModalRole === 'farmer' ? 'किसान आधार नंबर (12-अंक UIDAI) *' : 'थोक खरीदार आधार नंबर (12-अंक UIDAI) *') 
                                : `${activeModalRole === 'farmer' ? 'Farmer' : 'Buyer'} Aadhaar Card Number (12-Digit UIDAI) *`}
                            </span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-medium">XXXX XXXX XXXX</span>
                        </label>

                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={14}
                            placeholder="5432 8765 1098"
                            value={aadhaarNumber}
                            onChange={e => handleAadhaarInput(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-widest bg-white text-slate-900 placeholder:text-slate-300 placeholder:tracking-widest focus:bg-white transition-all ${
                              aadhaarNumber.replace(/\D/g, '').length === 12
                                ? 'border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 text-emerald-950 shadow-2xs'
                                : 'border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                            }`}
                          />
                          {aadhaarNumber.replace(/\D/g, '').length === 12 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] font-bold">
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              <span>Valid</span>
                            </div>
                          )}
                        </div>

                        {/* Security Subtext */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>
                              {language === 'hi'
                                ? '256-बिट सुरक्षित UIDAI सत्यापन: प्रत्यक्ष बैंक ट्रांसफर व सुरक्षित एस्क्रो हेतु अनिवार्य'
                                : '256-bit encrypted: Mandatory for direct MSP subsidies, mandi access & escrow safety'}
                            </span>
                          </span>
                          <span className="font-bold text-slate-600 shrink-0">Digital India 🇮🇳</span>
                        </div>
                      </div>
                    )}

                    {/* State & District */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{language === 'hi' ? 'राज्य (State) *' : 'State *'}</span>
                        </label>
                        <select
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold bg-slate-50/70 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
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
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <span>{language === 'hi' ? 'जिला (District) *' : 'District *'}</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Nashik"
                          value={district}
                          onChange={e => setDistrict(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium bg-slate-50/70 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>

                    {/* Team Passkey Field if registering Hub or Admin */}
                    {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
                        <label className="block text-purple-900 font-bold text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                            <span>{activeModalRole === 'admin' ? 'Master Admin Passkey *' : 'Master Team / Hub Passkey *'}</span>
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
                  /* 2. EXISTING USER LOGIN MODE */
                  <div className="space-y-3.5">
                    {/* Mobile Phone or Aadhaar Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {language === 'hi' 
                              ? (activeModalRole === 'farmer' || activeModalRole === 'buyer' 
                                  ? 'पंजीकृत मोबाइल या आधार नंबर (Mobile / Aadhaar) *' 
                                  : 'पंजीकृत मोबाइल नंबर (Registered Phone) *')
                              : (activeModalRole === 'farmer' || activeModalRole === 'buyer' 
                                  ? 'Registered Mobile or Aadhaar Number *' 
                                  : 'Registered Mobile Number *')}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">🇮🇳 +91 / UIDAI</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={
                          activeModalRole === 'farmer' || activeModalRole === 'buyer'
                            ? "e.g. 98220 11223 or 5432 8765 1098"
                            : "e.g. 98220 11223"
                        }
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value);
                          setOtpError('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold font-mono focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Full Name (Optional) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>{language === 'hi' ? 'पूरा नाम (वैकल्पिक / Optional)' : 'Registered Name (Optional)'}</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Patil / Priya Sharma"
                        value={name}
                        onChange={e => {
                          setName(e.target.value);
                          setOtpError('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Team Passkey Field if logging into Hub or Admin */}
                    {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5 mt-2">
                        <label className="block text-purple-900 font-bold text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                            <span>{activeModalRole === 'admin' ? 'Master Admin Passkey *' : 'Master Team / Hub Passkey *'}</span>
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
                {otpError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="flex-1">{otpError}</span>
                  </div>
                )}

                {adminError && (activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.99] cursor-pointer mt-2 ${
                    activeModalRole === 'farmer' 
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-700/25' 
                      : activeModalRole === 'buyer' 
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/25' 
                        : activeModalRole === 'admin' 
                          ? 'bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 shadow-purple-700/25' 
                          : 'bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/25'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Processing & Verifying...' : 
                     authMode === 'register' 
                       ? (activeModalRole === 'farmer' ? '🌾 Complete Registration & Launch Farmer Hub →' : '🏢 Complete Registration & Launch Buyer Hub →')
                       : (activeModalRole === 'farmer' ? '🌾 Sign In to Farmer Dashboard →' : '🏢 Sign In to Buyer Dashboard →')}
                  </span>
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>100% Free Signup</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-blue-600" />
                    <span>Instant Verification</span>
                  </span>
                  <span>•</span>
                  <span>Bank-Grade Escrow</span>
                </div>

                {/* Switch helper link */}
                <div className="text-center pt-1">
                  {authMode === 'register' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setOtpError('');
                        setAdminError('');
                      }}
                      className="text-[11px] text-slate-500 hover:text-blue-700 transition-colors cursor-pointer font-medium"
                    >
                      {language === 'hi' ? 'पहले से खाता है? यहाँ लॉगिन करें →' : 'Already have a registered account? Click here to Login →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setOtpError('');
                        setAdminError('');
                      }}
                      className="text-[11px] text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer font-medium"
                    >
                      {language === 'hi' ? 'नया खाता बनाना है? नया रजिस्ट्रेशन करें →' : 'Need a new account? Register new profile here →'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
