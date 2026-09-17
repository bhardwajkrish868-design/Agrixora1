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
  KeyRound 
} from 'lucide-react';

export const WelcomeGatewayView: React.FC = () => {
  const { loginUser, registerUser, language, setLanguage, verifyAdminPasskey } = useAgri();

  // Selected role & modal state
  const [activeModalRole, setActiveModalRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Form states (clean / un-prefilled)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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
        setOtpError(language === 'hi' ? '❌ कृपया अपना पंजीकृत मोबाइल नंबर या नाम दर्ज करें।' : '❌ Please enter your registered phone number or name.');
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
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : cleanPhone ? `+91 ${cleanPhone}` : '';

      setTimeout(() => {
        const result = loginUser({
          role: activeModalRole,
          name: cleanName || undefined,
          phone: formattedPhone || undefined
        });

        if (!result.success) {
          setOtpError(result.message || (language === 'hi' ? '❌ कोई पंजीकृत खाता नहीं मिला। कृपया पहले नया खाता बनाएं (Register)।' : '❌ No registered account found with this phone/name. Please register first.'));
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setActiveModalRole(null);
      }, 200);
    }
  };

  return (
    <div className="relative h-screen w-full flex flex-col justify-between overflow-y-auto md:overflow-hidden font-sans select-none bg-gradient-to-br from-[#0c1e13] via-[#09150e] to-[#040a06] text-slate-100">
      
      {/* 🌾 Cinematic Scenic Farm Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/farm2future-bg.jpg')" }}
      />

      {/* Atmospheric Dark & Vignette Overlay for High Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#07170c]/65 to-[#030905]/85 pointer-events-none backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#06120a]/35 to-black/80 pointer-events-none" />

      {/* Sleek Tech Matrix Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 🌟 Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between shrink-0 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="Farm2Future"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-400 flex items-center justify-center text-white text-lg shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            🌱
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
              Farm<span className="text-emerald-400">2Future</span>
            </span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold shadow-md border border-white/15 transition-all cursor-pointer hover:scale-105"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </header>

      {/* 🚀 SINGLE UNIFIED HOME PAGE */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center my-auto py-2 sm:py-3 space-y-3 sm:space-y-4 animate-in fade-in duration-300 flex-1 flex flex-col justify-center">
        
        {/* Main Hero Header */}
        <div className="space-y-1.5 sm:space-y-2 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white leading-snug">
            {language === 'hi' ? (
              <>
                भारतीय कृषि का <span className="text-emerald-400">स्मार्ट डिजिटल नेटवर्क</span>
              </>
            ) : (
              <>
                Connecting Indian Agriculture with <span className="text-emerald-400">Direct Markets</span> & Guaranteed Escrow
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mx-auto leading-normal line-clamp-2">
            {language === 'hi'
              ? '4 महीने पहले अग्रिम अनुबंध, ₹0 खेत से परिवहन, NABL प्रमाणित गुणवत्ता और 100% सुरक्षित भुगतान प्रणाली के साथ किसान और खरीदार को सीधे जोड़ने वाला एकीकृत मंच।'
              : 'Direct farm-to-enterprise procurement with 4-month pre-harvest contracts, ₹0 farmgate logistics pickup, NABL quality grading, and automated escrow settlement.'}
          </p>

          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-emerald-500/40" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-500/30">
              🌱 {language === 'hi' ? 'रजिस्ट्रेशन या लॉगिन के लिए अपना पोर्टल चुनें' : 'Select your stakeholder portal to Register or Sign In'}
            </span>
            <span className="h-px w-10 bg-emerald-500/40" />
          </div>
        </div>

        {/* 🌟 2 PRIMARY PUBLIC CARDS (FOR ALL VISITORS COMING ON THE WEBSITE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-left max-w-4xl mx-auto w-full">
          
          {/* Primary Public Card 1: Farmer */}
          <div 
            onClick={() => handleOpenRoleModal('farmer')}
            className="group relative bg-gradient-to-b from-[#112a1a]/95 via-[#0e2215]/95 to-[#09170e]/95 rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/35 shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:border-emerald-400 hover:shadow-[0_12px_30px_rgba(16,185,129,0.25)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-950/80 border-2 border-emerald-400/40 flex items-center justify-center text-2xl sm:text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  👨‍🌾
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  {language === 'hi' ? '🌾 किसान पोर्टल' : '🌾 Farmer Portal'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-200 transition-colors font-display leading-tight">
                {language === 'hi' ? 'भारतीय किसान (Kisan Portal)' : 'Farmers & Producers'}
              </h3>
              
              <p className="text-xs text-slate-300 mt-1.5 leading-snug line-clamp-2">
                {language === 'hi'
                  ? '4 महीने पहले अग्रिम कॉर्पोरेट अनुबंध, शून्य (₹0) खेत से परिवहन खर्च, NABL गुणवत्ता जांच और सीधे बैंक खाते में सुरक्षित एस्क्रो भुगतान।'
                  : 'Get guaranteed advance procurement contracts, ₹0 farmgate pickup logistics, transparent grading, and direct escrow bank payouts.'}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/20">
                  ✓ ₹0 Farmgate Pickup
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/20">
                  ✓ 4-Month Contracts
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/20">
                  ✓ Guaranteed Escrow
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-emerald-500/20 mt-3">
              <div className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md shadow-emerald-950/50 group-hover:scale-[1.01] transition-transform">
                <span>{language === 'hi' ? 'किसान पोर्टल में प्रवेश करें →' : 'Enter Farmer Portal →'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Primary Public Card 2: Buyer */}
          <div 
            onClick={() => handleOpenRoleModal('buyer')}
            className="group relative bg-gradient-to-b from-[#0f233a]/95 via-[#0b1b2d]/95 to-[#07121f]/95 rounded-2xl p-4 sm:p-5 border-2 border-blue-500/35 shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:border-blue-400 hover:shadow-[0_12px_30px_rgba(59,130,246,0.25)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-950/80 border-2 border-blue-400/40 flex items-center justify-center text-2xl sm:text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  🏢
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  {language === 'hi' ? '🏢 खरीदार पोर्टल' : '🏢 Bulk Buyer Portal'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-200 transition-colors font-display leading-tight">
                {language === 'hi' ? 'थोक खरीदार एवं कॉर्पोरेट (Buyer Portal)' : 'Bulk Buyers & Retailers'}
              </h3>
              
              <p className="text-xs text-slate-300 mt-1.5 leading-snug line-clamp-2">
                {language === 'hi'
                  ? '50T–500T थोक मांग पूलिंग, NABL मान्यता प्राप्त प्रयोगशाला जांच, लाइव जीपीएस वाहन ट्रैकिंग और सुरक्षित एस्क्रो फंड सुरक्षा।'
                  : 'Pool 50T-500T bulk crop requirements, verify NABL lab quality parameters, track refrigerated delivery fleets, and secure payment via escrow.'}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 text-[10px] sm:text-[11px] font-bold border border-blue-500/20">
                  ✓ 50T–500T Pooling
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 text-[10px] sm:text-[11px] font-bold border border-blue-500/20">
                  ✓ NABL Lab Quality
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 text-[10px] sm:text-[11px] font-bold border border-blue-500/20">
                  ✓ Escrow Protection
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-blue-500/20 mt-3">
              <div className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md shadow-blue-950/50 group-hover:scale-[1.01] transition-transform">
                <span>{language === 'hi' ? 'खरीदार पोर्टल में प्रवेश करें →' : 'Enter Buyer Portal →'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 🌿 Bottom Pillar Ribbon */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-2.5 pt-1 shrink-0">
        <div className="bg-slate-900/90 backdrop-blur-md text-slate-200 rounded-xl sm:rounded-full py-1.5 sm:py-2 px-4 sm:px-6 border border-white/10 shadow-lg flex items-center justify-around gap-2 text-[11px] sm:text-xs font-bold">
          
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="text-sm">🌱</span>
            <span className="font-extrabold tracking-wide">Stronger Farms</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-blue-300">
            <span className="text-sm">👥</span>
            <span className="font-extrabold tracking-wide">Fairer Markets</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-teal-300">
            <span className="text-sm">🍃</span>
            <span className="font-extrabold tracking-wide">Cleaner Planet</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-amber-300">
            <span className="text-sm">📊</span>
            <span className="font-extrabold tracking-wide">Brighter Futures</span>
          </div>

          {/* Discreet Team Staff Access Icon (subtle, non-intrusive) */}
          <button 
            type="button"
            onClick={() => handleOpenRoleModal('admin')} 
            className="opacity-20 hover:opacity-100 text-slate-500 hover:text-amber-400 transition-opacity p-1 cursor-pointer"
            title=""
            aria-label="Staff Portal"
          >
            <Lock className="w-3 h-3" />
          </button>

        </div>
      </footer>

      {/* 🔐 AUTHENTICATION MODAL (Opens cleanly when any Role Card is clicked) */}
      {activeModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          
          {/* Backdrop Blur */}
          <div 
            onClick={() => setActiveModalRole(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
          />

          <div className="relative bg-slate-900 text-slate-100 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 border border-white/15 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`p-5 text-white relative shrink-0 border-b border-white/10 ${
              activeModalRole === 'farmer' ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900' :
              activeModalRole === 'buyer' ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900' :
              activeModalRole === 'admin' ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-900' :
              'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900'
            }`}>
              <button
                onClick={() => setActiveModalRole(null)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors absolute top-3.5 right-3.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shadow-inner">
                  {activeModalRole === 'farmer' ? '🌾' : activeModalRole === 'buyer' ? '🏢' : activeModalRole === 'admin' ? '🏛️' : '🏬'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold font-display leading-tight text-white">
                      {authMode === 'register' ? (
                        activeModalRole === 'farmer' ? '🌾 New Farmer Registration' :
                        activeModalRole === 'buyer' ? '🏢 New Buyer Registration' :
                        activeModalRole === 'admin' ? '🏛️ Govt Admin Enrollment' :
                        '🏬 New APMC Hub Registration'
                      ) : (
                        activeModalRole === 'farmer' ? '🌾 Farmer Login' :
                        activeModalRole === 'buyer' ? '🏢 Buyer Login' :
                        activeModalRole === 'admin' ? '🏛️ Govt Admin Console' :
                        '🏬 APMC Collection Hub Login'
                      )}
                    </h3>
                    {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-200 border border-amber-400/40">
                        🔒 Team Only
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {authMode === 'register' 
                      ? (language === 'hi' ? 'नया प्रोफाइल बनाएं और तुरंत डैशबोर्ड में प्रवेश करें' : 'Create a new stakeholder profile & enter dashboard')
                      : (language === 'hi' ? 'पंजीकृत मोबाइल नंबर दर्ज करके लॉगिन करें' : 'Enter your registered mobile phone number to log in')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Team Role Switcher inside Modal (Only visible when secret team access is open) */}
            {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
              <div className="flex bg-slate-950 p-1.5 border-b border-amber-500/30 gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalRole('admin');
                    setAdminError('');
                    setOtpError('');
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeModalRole === 'admin'
                      ? 'bg-purple-900/90 text-purple-200 border border-purple-400/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
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
                      ? 'bg-amber-900/90 text-amber-200 border border-amber-400/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏬 APMC Collection Hub</span>
                </button>
              </div>
            )}

            {/* Toggle: Register (Default) vs Existing User Login */}
            <div className="flex border-b border-white/10 bg-slate-950/60 p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setOtpError('');
                  setAdminError('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'register'
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
                  setAuthMode('login');
                  setOtpError('');
                  setAdminError('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-slate-800 text-white shadow-xs border border-white/15'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'hi' ? '🔑 पुराना खाता (Existing User)' : '🔑 Existing User Login'}</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              
              {/* Notice for Team Roles */}
              {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2 text-amber-200">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="block text-amber-300 font-bold">
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

              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* 1. REGISTER MODE (DEFAULT FIRST) */}
                {authMode === 'register' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
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
                          className="w-full px-3.5 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-800/80 text-white placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          {activeModalRole === 'farmer' ? (language === 'hi' ? 'कुल कृषि भूमि (एकड़) *' : 'Farm Land (Acres) *') : 
                           activeModalRole === 'buyer' ? (language === 'hi' ? 'कंपनी / व्यवसाय का नाम *' : 'Company / Business *') : 
                           activeModalRole === 'collection_centre' ? (language === 'hi' ? 'APMC हब सेंटर *' : 'APMC Hub Center *') : 
                           (language === 'hi' ? 'विभाग *' : 'Department *')}
                        </label>
                        {activeModalRole === 'farmer' ? (
                          <input
                            type="number"
                            placeholder="e.g. 5"
                            value={farmSize}
                            onChange={e => setFarmSize(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-800/80 text-white placeholder:text-slate-500"
                          />
                        ) : activeModalRole === 'buyer' ? (
                          <input
                            type="text"
                            placeholder="e.g. ITC Agri / Reliance Fresh"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-800/80 text-white placeholder:text-slate-500"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. Nashik North Hub #04"
                            value={hubName}
                            onChange={e => setHubName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-800/80 text-white placeholder:text-slate-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* Mobile Phone */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{language === 'hi' ? 'मोबाइल नंबर (Aadhaar / Mobile) *' : 'Mobile Phone Number *'}</span>
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
                          setOtpError('');
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 font-medium font-mono bg-slate-800/80 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* State & District */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">{language === 'hi' ? 'राज्य (State) *' : 'State *'}</label>
                        <input
                          type="text"
                          placeholder="State"
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-white/10 text-xs bg-slate-800/80 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">{language === 'hi' ? 'जिला (District) *' : 'District *'}</label>
                        <input
                          type="text"
                          placeholder="District"
                          value={district}
                          onChange={e => setDistrict(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-white/10 text-xs bg-slate-800/80 text-white"
                        />
                      </div>
                    </div>

                    {/* Team Passkey Field if registering Hub or Admin */}
                    {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                      <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1.5">
                        <label className="block text-purple-300 font-bold text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                            <span>{activeModalRole === 'admin' ? 'Master Admin Passkey *' : 'Master Team / Hub Passkey *'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">Key: Krish0386</span>
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
                            className="w-full pl-3 pr-10 py-2 rounded-xl border border-purple-500/40 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 bg-slate-800 text-purple-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPasskey(!showAdminPasskey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showAdminPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-400" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. EXISTING USER LOGIN MODE */
                  <div className="space-y-3">
                    {/* Mobile Phone Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-400" />
                          <span>{language === 'hi' ? 'पंजीकृत मोबाइल नंबर (Registered Phone) *' : 'Registered Mobile Number *'}</span>
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
                          setOtpError('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 text-xs font-semibold font-mono focus:ring-2 focus:ring-blue-500 bg-slate-800/90 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* Full Name (Optional) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-blue-400" />
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-800/90 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* Team Passkey Field if logging into Hub or Admin */}
                    {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                      <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/40 space-y-1.5 mt-2">
                        <label className="block text-purple-300 font-bold text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                            <span>{activeModalRole === 'admin' ? 'Master Admin Passkey *' : 'Master Team / Hub Passkey *'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">Key: Krish0386</span>
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
                            className="w-full pl-3 pr-10 py-2 rounded-xl border border-purple-500/40 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 bg-slate-800 text-purple-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPasskey(!showAdminPasskey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showAdminPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-400" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error messages */}
                {otpError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="flex-1">{otpError}</span>
                  </div>
                )}

                {adminError && (activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer mt-3 ${
                    activeModalRole === 'farmer' ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-900/40' :
                    activeModalRole === 'buyer' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40' :
                    activeModalRole === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/40' :
                    'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/40'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Processing...' : 
                     authMode === 'register' ? `Register & Launch ${activeModalRole.toUpperCase()} Dashboard →` :
                     `Login to ${activeModalRole.toUpperCase()} Portal →`}
                  </span>
                </button>

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
                      className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-medium"
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
                      className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors cursor-pointer font-medium"
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
