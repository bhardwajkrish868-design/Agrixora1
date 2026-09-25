import React, { useState, useEffect, useRef } from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { RegistrationModal } from '../components/RegistrationModal';
import { CloudDatabaseModal } from '../components/CloudDatabaseModal';
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
  Cloud, 
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
  BadgeCheck,
  Mail,
  ChevronDown,
  BarChart3,
  Users,
  Leaf
} from 'lucide-react';

// 🇮🇳 Authentic UIDAI Sunburst Aadhaar Logo
const AadhaarSunburstLogo: React.FC = () => (
  <div className="w-14 h-12 flex flex-col items-center justify-center shrink-0 bg-white/90 p-1 rounded-xl border border-amber-200/60 shadow-2xs">
    <svg viewBox="0 0 100 68" className="w-full h-full drop-shadow-2xs">
      <defs>
        <linearGradient id="aadhaarSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      {/* Sun rays fan */}
      <g fill="url(#aadhaarSunGrad)">
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


export const WelcomeGatewayView: React.FC = () => {
  const { language, setLanguage, bulkDemands } = useAgri();

  // Cloud Database Modal & Status
  const [isCloudDbOpen, setIsCloudDbOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{ connected: boolean; tursoConnected: boolean }>({
    connected: false,
    tursoConnected: false
  });

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/db/status');
        if (res.ok) {
          const data = await res.json();
          setCloudStatus({
            connected: Boolean(data.connected),
            tursoConnected: Boolean(data.tursoConnected)
          });
        }
      } catch (_) {}
    };
    checkDb();
    const interval = setInterval(checkDb, 8000);
    return () => clearInterval(interval);
  }, []);

  // Selected role & modal state
  const [activeModalRole, setActiveModalRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

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

  // Open role modal
  const handleOpenRoleModal = (role: UserRole, mode: 'login' | 'register' = 'register') => {
    setActiveModalRole(role);
    setAuthMode(mode);
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

        {/* ⚡ Live Bulk Demands Alert Banner (Visible to any visitor on any device immediately) */}
        {bulkDemands && bulkDemands.length > 0 && (
          <div 
            onClick={() => handleOpenRoleModal('farmer', 'login')}
            className="max-w-4xl mx-auto w-full bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-3 sm:p-4 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-left cursor-pointer hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-lg">
                📦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Live Bulk Demands ({bulkDemands.length})
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    100% Escrow Funded
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5 font-medium line-clamp-1">
                  {bulkDemands.map(b => `${b.demandNumber}: ${b.cropName} (${b.targetQuantityTons}T @ ₹${b.pricePerTon.toLocaleString('en-IN')}/T by ${b.buyerName})`).join(' • ')}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <span>{language === 'hi' ? 'किसान लॉगिन करके सप्लाई करें' : 'Login as Farmer to Supply'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 🌟 2 PRIMARY PUBLIC CARDS (FOR ALL VISITORS COMING ON THE WEBSITE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-left max-w-4xl mx-auto w-full">
          
          {/* Primary Public Card 1: Farmer */}
          <div 
            onClick={() => handleOpenRoleModal('farmer', 'register')}
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

            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRoleModal('farmer', 'register');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'नया खाता बनाएं' : 'Register'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRoleModal('farmer', 'login');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-semibold pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'hi' ? 'पासवर्ड से सुरक्षित प्रमाणन' : 'Password Protected Authentication'}</span>
              </div>
            </div>
          </div>

          {/* Primary Public Card 2: Buyer */}
          <div 
            onClick={() => handleOpenRoleModal('buyer', 'register')}
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

            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRoleModal('buyer', 'register');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'नया खाता बनाएं' : 'Register'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRoleModal('buyer', 'login');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-semibold pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'hi' ? 'पासवर्ड से सुरक्षित प्रमाणन' : 'Password Protected Authentication'}</span>
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

      {/* 🔐 AUTHENTICATION & REGISTRATION MODAL */}
      {activeModalRole && (
        <RegistrationModal
          isOpen={!!activeModalRole}
          role={activeModalRole}
          onClose={() => setActiveModalRole(null)}
          defaultMode={authMode}
        />
      )}

      {/* ☁️ CLOUD DATABASE MODAL (TURSO 9 GB) */}
      <CloudDatabaseModal
        isOpen={isCloudDbOpen}
        onClose={() => setIsCloudDbOpen(false)}
      />

    </div>
  );
};
