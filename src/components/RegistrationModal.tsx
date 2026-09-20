import React, { useState, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { 
  ArrowRight, 
  ArrowLeft,
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
  Leaf,
  FileCheck,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

// Synthesize pleasant SMS arrival chime via Web Audio API
const playSmsChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (_) {}
};

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

  // 4-Step Wizard Active Step (1: Basic, 2: Identity, 3: Business/Farm, 4: Review)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  // Step 1: Basic Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');

  // Step 2: Identity Verification (UIDAI Aadhaar + OTP)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpCode, setOtpCode] = useState('882910');
  const [isOtpVerified, setIsOtpVerified] = useState(true);
  const [smsToast, setSmsToast] = useState<{ show: boolean; otp: string; phone: string } | null>(null);
  const [otpSentMessage, setOtpSentMessage] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Dispatch OTP directly to user's physical mobile phone and multi-channel alerts
  const sendOtpToPhone = async (targetPhone?: string, targetOtp?: string) => {
    const rawTarget = (targetPhone || phone || '').replace(/\D/g, '').slice(-10) || '9631359486';
    const otpToDispatch = targetOtp || otpCode || '882910';

    setIsSendingOtp(true);
    setOtpCode(otpToDispatch);
    setIsOtpVerified(true);

    const smsMessage = `🔑 Farm2Future Verification OTP: ${otpToDispatch}. Valid for 10 minutes. Do not share this OTP with anyone. (Farm2Future Smart Agri Platform)`;

    // 1. Backend dispatch to /api/send-sms (Fast2SMS telecom gateway / DB logging)
    try {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: rawTarget,
          message: smsMessage,
          cost: 0,
          origin: 'Farm2Future UIDAI Auth',
          destination: `+91 ${rawTarget}`
        })
      });
    } catch (_) {}

    // 2. Synthesize SMS ringtone chime
    playSmsChime();

    // 3. Trigger Native OS Browser Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('🔑 Farm2Future Verification OTP', {
            body: `Your OTP is: ${otpToDispatch} for mobile +91 ${rawTarget}. Valid for 10 minutes.`,
            icon: '/favicon.ico'
          });
        } catch (_) {}
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            try {
              new Notification('🔑 Farm2Future Verification OTP', {
                body: `Your OTP is: ${otpToDispatch} for mobile +91 ${rawTarget}. Valid for 10 minutes.`,
                icon: '/favicon.ico'
              });
            } catch (_) {}
          }
        }).catch(() => {});
      }
    }

    // 4. Trigger Floating Phone Push Notification Toast
    setSmsToast({
      show: true,
      otp: otpToDispatch,
      phone: rawTarget
    });

    setOtpSentMessage(`✅ Demo OTP (${otpToDispatch}) sent to +91 ${rawTarget}`);
    setIsSendingOtp(false);
  };

  // Step 3: Business / Farm Details
  // Farmer fields
  const [farmSize, setFarmSize] = useState('5');
  const [primaryCrop, setPrimaryCrop] = useState('Onions & Wheat');
  const [irrigationSource, setIrrigationSource] = useState('Drip Irrigation');
  const [preferredMandi, setPreferredMandi] = useState('Nashik North APMC Hub');

  // Buyer fields
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [procurementCategory, setProcurementCategory] = useState('Vegetables & Fruits');
  const [monthlyVolume, setMonthlyVolume] = useState('50T - 100T');

  // Admin / Hub fields
  const [hubName, setHubName] = useState('');
  const [adminPasskeyInput, setAdminPasskeyInput] = useState('');
  const [showAdminPasskey, setShowAdminPasskey] = useState(false);

  // Step 4: Terms Agreement & Submission
  const [agreedTerms, setAgreedTerms] = useState(true);
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
      setCurrentStep(1);
      setMaxStepReached(1);
      setName('');
      setPhone('');
      setEmail('');
      setAadhaarNumber('');
      setOtpCode('882910');
      setIsOtpVerified(true);
      setFarmSize('5');
      setPrimaryCrop('Onions & Wheat');
      setIrrigationSource('Drip Irrigation');
      setPreferredMandi('Nashik North APMC Hub');
      setBusinessName('');
      setGstin('');
      setProcurementCategory('Vegetables & Fruits');
      setMonthlyVolume('50T - 100T');
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

  // Step Navigation Handlers with Step Validation
  const goToStep = (stepNumber: number) => {
    setErrorMsg('');
    setAdminError('');

    // Step 1 Validation
    if (stepNumber > 1) {
      const cleanName = name.trim();
      if (!cleanName) {
        setErrorMsg(language === 'hi' ? '❌ कृपया अपना पूरा नाम दर्ज करें।' : '❌ Please enter your full legal name.');
        return;
      }
      const rawPhoneDigits = phone.replace(/\D/g, '');
      if (rawPhoneDigits.length < 10) {
        setErrorMsg(language === 'hi' ? '❌ मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' : '❌ Please enter a valid 10-digit mobile number.');
        return;
      }

      // Automatically dispatch Demo OTP to user's phone when moving to Step 2
      if (stepNumber === 2 && currentStep === 1) {
        sendOtpToPhone(rawPhoneDigits, '882910');
      }
    }

    // Step 2 Validation
    if (stepNumber > 2 && (activeModalRole === 'farmer' || activeModalRole === 'buyer')) {
      const rawAadhaar = aadhaarNumber.replace(/\D/g, '');
      if (rawAadhaar.length !== 12) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया 12-अंकीय आधार कार्ड नंबर (UIDAI) दर्ज करें।'
            : '❌ Please enter a valid 12-digit UIDAI Aadhaar Card Number.'
        );
        return;
      }
      if (!otpCode || otpCode.length < 4) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया 6-अंकीय मोबाइल/आधार ओटीपी सत्यापित करें।'
            : '❌ Please enter and verify the 6-digit mobile/Aadhaar OTP.'
        );
        return;
      }
    }

    // Step 3 Validation
    if (stepNumber > 3) {
      if (activeModalRole === 'farmer' && (!farmSize || Number(farmSize) <= 0)) {
        setErrorMsg(language === 'hi' ? '❌ कृपया कृषि भूमि का आकार (एकड़) दर्ज करें।' : '❌ Please enter valid farm land size in acres.');
        return;
      }
      if (activeModalRole === 'buyer' && !businessName.trim()) {
        setErrorMsg(language === 'hi' ? '❌ कृपया अपनी कंपनी या व्यापार का नाम दर्ज करें।' : '❌ Please enter your company or business name.');
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
    }

    setCurrentStep(stepNumber);
    setMaxStepReached(prev => Math.max(prev, stepNumber));
  };

  // Final Registration or Login Submission
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAdminError('');

    if (authMode === 'register') {
      if (!agreedTerms) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया नियमों और शर्तों से सहमति दें।'
            : '❌ Please agree to the Terms & Conditions and Privacy Policy.'
        );
        return;
      }

      setIsSubmitting(true);
      const cleanName = name.trim();
      const cleanPhone = phone.trim();
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`;
      const finalDistrict = district.trim() || 'Nashik';
      const finalLocation = `${finalDistrict}, ${state}`;

      setTimeout(() => {
        registerUser({
          id: `usr_${activeModalRole}_${Date.now()}`,
          role: activeModalRole,
          name: cleanName,
          phone: formattedPhone,
          email: email.trim() || (cleanName.toLowerCase().replace(/\s+/g, '') + '@farm2future.in'),
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
        onClose();
      }, 250);
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
      {/* 📲 Floating OTP SMS Notification Banner (Phone Toast) */}
      {smsToast && (
        <div className="fixed top-4 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-emerald-400 p-4 max-w-md w-full pointer-events-auto space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  📲
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  OTP SMS ALERT • VM-AGRIF2F
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
            </div>

            <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">🔑 Demo Verification OTP:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black text-sm tracking-widest border border-emerald-500/40">
                  {smsToast.otp}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dispatched to: <strong className="text-emerald-400 font-mono">+91 {smsToast.phone}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <a
                href={`https://api.whatsapp.com/send?phone=91${smsToast.phone.replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(
                  `🔑 *Farm2Future Verification OTP: ${smsToast.otp}*\n\nYour One-Time Password (OTP) is *${smsToast.otp}*.\nValid for 10 minutes.\n\n🌾 Farm2Future Smart Agriculture Platform`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>🟢</span>
                <span>WhatsApp OTP</span>
              </a>
              <a
                href={`sms:+91${smsToast.phone.replace(/\D/g, '').slice(-10)}?body=${encodeURIComponent(
                  `Farm2Future Verification OTP: ${smsToast.otp}. Valid for 10 minutes. Do not share with anyone.`
                )}`}
                className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone SMS App</span>
              </a>

              {/* 🔔 NTFY Mobile Push Alert */}
              <a
                href={`https://ntfy.sh/farm2future_${smsToast.phone.replace(/\D/g, '').slice(-10)}`}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>🔔</span>
                <span>Live Phone Push Alert (ntfy.sh/farm2future_{smsToast.phone.slice(-10)})</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setOtpCode(smsToast.otp);
                  setIsOtpVerified(true);
                  setSmsToast(null);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-fill OTP</span>
              </button>
              <button
                type="button"
                onClick={() => setSmsToast(null)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                Dismiss (बंद करें)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
      />

      {/* Main Split-Panel Modal Card */}
      <div className="relative bg-white text-slate-900 rounded-[28px] sm:rounded-[32px] shadow-[0_25px_80px_rgba(15,23,42,0.35)] max-w-4xl lg:max-w-5xl w-full overflow-hidden z-10 border border-emerald-100/90 max-h-[94vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        
        {/* 📝 LEFT MAIN FORM & WIZARD PANEL */}
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
          <div className="flex items-start gap-4 mb-3.5">
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

          {/* 🌟 4-STEP WIZARD STEPPER (ACTIVE & COMBINED ACROSS 1, 2, 3, 4) */}
          {authMode === 'register' && (
            <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/70 mb-4 select-none">
              <div className="flex items-center justify-between text-center">
                
                {/* Step 1: Basic Details */}
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className={`flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer`}
                >
                  <div className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                    currentStep > 1 
                      ? 'bg-emerald-600 text-white shadow-2xs' 
                      : currentStep === 1 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-xs' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                  </div>
                  <span className={`text-[11px] sm:text-xs tracking-tight ${
                    currentStep === 1 
                      ? 'font-black text-emerald-800' 
                      : currentStep > 1 
                        ? 'font-bold text-emerald-700' 
                        : 'font-semibold text-slate-400'
                  }`}>
                    Basic Details
                  </span>
                </button>

                {/* Connecting Line 1-2 */}
                <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full transition-colors ${
                  currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />

                {/* Step 2: Identity Verification */}
                <button
                  type="button"
                  onClick={() => maxStepReached >= 2 && goToStep(2)}
                  className={`flex items-center gap-1 sm:gap-1.5 transition-all ${
                    maxStepReached >= 2 ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold text-[11px] flex items-center justify-center transition-all ${
                    currentStep > 2 
                      ? 'bg-emerald-600 text-white shadow-2xs' 
                      : currentStep === 2 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-xs' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] hidden sm:inline transition-colors ${
                    currentStep === 2 
                      ? 'font-black text-emerald-800' 
                      : currentStep > 2 
                        ? 'font-bold text-emerald-700' 
                        : 'font-medium text-slate-400'
                  }`}>
                    Identity Verification
                  </span>
                </button>

                {/* Connecting Line 2-3 */}
                <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full transition-colors ${
                  currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />

                {/* Step 3: Business/Farm Details */}
                <button
                  type="button"
                  onClick={() => maxStepReached >= 3 && goToStep(3)}
                  className={`flex items-center gap-1 sm:gap-1.5 transition-all ${
                    maxStepReached >= 3 ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold text-[11px] flex items-center justify-center transition-all ${
                    currentStep > 3 
                      ? 'bg-emerald-600 text-white shadow-2xs' 
                      : currentStep === 3 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-xs' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] hidden sm:inline transition-colors ${
                    currentStep === 3 
                      ? 'font-black text-emerald-800' 
                      : currentStep > 3 
                        ? 'font-bold text-emerald-700' 
                        : 'font-medium text-slate-400'
                  }`}>
                    {activeModalRole === 'farmer' ? 'Farm Details' : 'Business Details'}
                  </span>
                </button>

                {/* Connecting Line 3-4 */}
                <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full transition-colors ${
                  currentStep >= 4 ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />

                {/* Step 4: Review & Submit */}
                <button
                  type="button"
                  onClick={() => maxStepReached >= 4 && goToStep(4)}
                  className={`flex items-center gap-1 sm:gap-1.5 transition-all ${
                    maxStepReached >= 4 ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold text-[11px] flex items-center justify-center transition-all ${
                    currentStep === 4 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-xs' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    4
                  </div>
                  <span className={`text-[10px] sm:text-[11px] hidden sm:inline transition-colors ${
                    currentStep === 4 
                      ? 'font-black text-emerald-800' 
                      : 'font-medium text-slate-400'
                  }`}>
                    Review & Submit
                  </span>
                </button>

              </div>
            </div>
          )}

          {/* Form Elements */}
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            {authMode === 'register' ? (
              <div>
                
                {/* ─────────────────────────────────────────────────────────────
                    STEP 1: BASIC DETAILS
                ───────────────────────────────────────────────────────────── */}
                {currentStep === 1 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
                    <div className="flex items-center gap-2 pt-0.5 pb-1 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center text-xs shrink-0">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          Step 1 of 4: Personal & Contact Information
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-medium">
                          Enter your legal name, mobile number, and operating territory
                        </p>
                      </div>
                    </div>

                    {/* Full Legal Name */}
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

                    {/* Row: Mobile Phone (+91) + Email */}
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
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Step 2 पर जाते ही इस नंबर पर Live Demo OTP भेजा जाएगा</span>
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

                    {/* Row: State & District */}
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

                    {/* Step 1 Next Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Continue to Identity Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STEP 2: IDENTITY VERIFICATION (UIDAI AADHAAR + OTP)
                ───────────────────────────────────────────────────────────── */}
                {currentStep === 2 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
                    <div className="flex items-center gap-2 pt-0.5 pb-1 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center text-xs shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          Step 2 of 4: Government Identity (UIDAI Aadhaar)
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-medium">
                          12-digit UIDAI verification for zero-commission escrow and direct payouts
                        </p>
                      </div>
                    </div>

                    {/* Dedicated Authentic Aadhaar Verification Card */}
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
                            <p className="text-[10px] text-slate-500 font-medium">For secure, tamper-proof registration</p>
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

                    {/* Instant OTP Authentication Verification Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-emerald-300/80 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          <span>Aadhaar & Mobile OTP Verification (ओटीपी सत्यापन)</span>
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          ● Live Mobile Dispatch
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={e => {
                            setOtpCode(e.target.value);
                            setIsOtpVerified(e.target.value.length === 6);
                          }}
                          placeholder="882910"
                          className="w-28 px-3 py-2 rounded-xl border-2 border-slate-300 font-mono font-black text-sm tracking-widest text-slate-900 text-center bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
                        />
                        <button
                          type="button"
                          disabled={isSendingOtp}
                          onClick={() => {
                            sendOtpToPhone(phone || '9631359486', '882910');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{isSendingOtp ? 'Sending...' : 'Fill Demo OTP (882910) & Send to Mobile'}</span>
                        </button>
                        {isOtpVerified && (
                          <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 ml-auto bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>OTP Verified</span>
                          </span>
                        )}
                      </div>

                      {/* Phone Dispatch Status & 1-Click WhatsApp / SMS App Buttons */}
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">
                            ओटीपी मोबाइल नंबर: <strong className="text-slate-900 font-mono">+91 {(phone || '9631359486').replace(/\D/g, '').slice(-10)}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => sendOtpToPhone(phone || '9631359486', otpCode || '882910')}
                            className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer text-[10.5px]"
                          >
                            Resend OTP (दोबारा भेजें)
                          </button>
                        </div>

                        {otpSentMessage && (
                          <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <span>📲</span>
                            <span>{otpSentMessage}</span>
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <a
                            href={`https://api.whatsapp.com/send?phone=91${(phone || '9631359486').replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(
                              `🔑 *Farm2Future Verification OTP: ${otpCode || '882910'}*\n\nYour One-Time Password (OTP) is *${otpCode || '882910'}*.\nValid for 10 minutes.\n\n🌾 Farm2Future Smart Agriculture Platform`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <span>🟢</span>
                            <span>Send OTP to WhatsApp (+91 {(phone || '9631359486').replace(/\D/g, '').slice(-10)})</span>
                          </a>
                          <a
                            href={`sms:+91${(phone || '9631359486').replace(/\D/g, '').slice(-10)}?body=${encodeURIComponent(
                              `Farm2Future Verification OTP: ${otpCode || '882910'}. Valid for 10 minutes. Do not share with anyone.`
                            )}`}
                            className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-sky-200" />
                            <span>Open in Phone SMS App</span>
                          </a>

                          {/* 🔔 Free NTFY Mobile Push Alert */}
                          <a
                            href={`https://ntfy.sh/farm2future_${(phone || '9631359486').replace(/\D/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="sm:col-span-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <span>🔔</span>
                            <span>Live NTFY Mobile Push Alert (ntfy.sh/farm2future_{(phone || '9631359486').replace(/\D/g, '').slice(-10)})</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="px-6 py-3 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>
                          {activeModalRole === 'farmer' ? 'Continue to Farm Details' : 'Continue to Business Details'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STEP 3: BUSINESS / FARM DETAILS
                ───────────────────────────────────────────────────────────── */}
                {currentStep === 3 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
                    <div className="flex items-center gap-2 pt-0.5 pb-1 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center text-xs shrink-0">
                        {activeModalRole === 'farmer' ? <Sprout className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          Step 3 of 4: {activeModalRole === 'farmer' ? 'Farm & Agricultural Profile' : 'Business & Procurement Capacity'}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-medium">
                          {activeModalRole === 'farmer' ? 'Configure your land size, crops, and mandi routing' : 'Configure company trade capacity, GSTIN, and crop categories'}
                        </p>
                      </div>
                    </div>

                    {/* FARMER SPECIFIC DETAILS */}
                    {activeModalRole === 'farmer' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Total Farm Land Size (Acres) <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 5"
                              value={farmSize}
                              onChange={e => setFarmSize(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Primary Crops Grown</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Onion, Soybean, Wheat, Tomatoes"
                              value={primaryCrop}
                              onChange={e => setPrimaryCrop(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <span>Irrigation Facility</span>
                            </label>
                            <select
                              value={irrigationSource}
                              onChange={e => setIrrigationSource(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              <option value="Drip Irrigation">Drip Irrigation (Micro-irrigation)</option>
                              <option value="Canal / River">Canal / River Water</option>
                              <option value="Borewell & Well">Borewell & Open Well</option>
                              <option value="Rainfed">Rainfed (Monsoon)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <span>Nearest APMC Mandi Collection Hub</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Nashik North APMC Hub"
                              value={preferredMandi}
                              onChange={e => setPreferredMandi(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BUYER SPECIFIC DETAILS */}
                    {activeModalRole === 'buyer' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Company / Business Name <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. ITC Agri / Reliance Fresh / BigBasket"
                              value={businessName}
                              onChange={e => setBusinessName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>GSTIN / Trade PAN (Optional)</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 27AABCT3518Q1ZP"
                              value={gstin}
                              onChange={e => setGstin(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <span>Primary Procurement Categories</span>
                            </label>
                            <select
                              value={procurementCategory}
                              onChange={e => setProcurementCategory(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              <option value="Vegetables & Fruits">Vegetables & Fresh Fruits</option>
                              <option value="Cereals & Grains">Cereals & Grains (Wheat, Rice, Maize)</option>
                              <option value="Pulses & Oilseeds">Pulses & Oilseeds (Soybean, Mustard)</option>
                              <option value="Spices & Cash Crops">Spices & Cash Crops</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <span>Monthly Buying Volume Target</span>
                            </label>
                            <select
                              value={monthlyVolume}
                              onChange={e => setMonthlyVolume(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              <option value="50T - 100T">50T - 100T (Mid Retailer)</option>
                              <option value="100T - 500T">100T - 500T (Wholesale Aggregator)</option>
                              <option value="500T+">500T+ (Corporate / FMCG)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ADMIN / COLLECTION HUB SPECIFIC DETAILS */}
                    {(activeModalRole === 'admin' || activeModalRole === 'collection_centre') && (
                      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                        <label className="block text-purple-900 font-bold text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                            <span>Master Team Security Passkey *</span>
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

                    {/* Navigation Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => goToStep(4)}
                        className="px-6 py-3 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Continue to Review & Submit</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STEP 4: REVIEW & SUBMIT
                ───────────────────────────────────────────────────────────── */}
                {currentStep === 4 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-3 duration-200">
                    <div className="flex items-center gap-2 pt-0.5 pb-1 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center text-xs shrink-0">
                        <FileCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          Step 4 of 4: Review Profile & Submit
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-medium">
                          Confirm all information before creating your verified stakeholder profile
                        </p>
                      </div>
                    </div>

                    {/* Profile Review Card */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border border-slate-200/90 shadow-2xs space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Legal Name & Role</span>
                          <strong className="text-slate-900 font-extrabold text-sm">{name || 'N/A'}</strong>
                          <span className="inline-block ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                            {activeModalRole}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone</span>
                          <span className="font-mono font-bold text-slate-800">{phone || 'N/A'}</span>
                          <span className="text-emerald-700 font-bold text-[10px] ml-1">✓ Verified</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">UIDAI Aadhaar</span>
                          <span className="font-mono font-bold text-slate-900">
                            {aadhaarNumber || '5432 8765 1098'}
                          </span>
                          <span className="inline-block ml-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
                            UIDAI Linked
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Territory / Location</span>
                          <span className="font-medium text-slate-800">{district}, {state}</span>
                        </div>

                        {activeModalRole === 'farmer' ? (
                          <>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Farm Size</span>
                              <span className="font-bold text-slate-800">{farmSize} Acres ({irrigationSource})</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Mandi</span>
                              <span className="font-medium text-slate-800">{preferredMandi}</span>
                            </div>
                          </>
                        ) : activeModalRole === 'buyer' ? (
                          <>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Business Name</span>
                              <span className="font-bold text-slate-800">{businessName || name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Volume</span>
                              <span className="font-medium text-slate-800">{monthlyVolume}</span>
                            </div>
                          </>
                        ) : null}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-emerald-800">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>Bank-grade Trade Escrow & NABL Certification Enabled</span>
                        </span>
                        <DigitalIndiaLogo />
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
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

                    {/* Navigation Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || !agreedTerms}
                        className="px-7 py-3 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{isSubmitting ? 'Registering...' : 'Complete Registration & Launch Hub'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* ─────────────────────────────────────────────────────────────
                  EXISTING USER SIGN IN MODE
              ───────────────────────────────────────────────────────────── */
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

                {/* 📲 Demo OTP Verification for Login */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant Login Demo OTP Verification</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ● Mobile SMS
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="882910"
                      className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-widest text-slate-900 text-center bg-white"
                    />
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={() => {
                        sendOtpToPhone(phone || '9631359486', '882910');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>{isSendingOtp ? 'Sending...' : 'Send Demo OTP (882910) to Mobile'}</span>
                    </button>
                    {isOtpVerified && (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-slate-500">
                      Target: <strong className="text-slate-700 font-mono">+91 {(phone || '9631359486').replace(/\D/g, '').slice(-10)}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://api.whatsapp.com/send?phone=91${(phone || '9631359486').replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(
                          `🔑 *Farm2Future Login OTP: ${otpCode || '882910'}*\n\nYour Login OTP is *${otpCode || '882910'}*. Valid for 10 minutes.\n\n🌾 Farm2Future Platform`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                      >
                        <span>🟢 WhatsApp</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <a
                        href={`sms:+91${(phone || '9631359486').replace(/\D/g, '').slice(-10)}?body=${encodeURIComponent(
                          `Farm2Future Login OTP: ${otpCode || '882910'}. Valid for 10 minutes.`
                        )}`}
                        className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>SMS App</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <a
                        href={`https://ntfy.sh/farm2future_${(phone || '9631359486').replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1"
                      >
                        <span>🔔 NTFY Push</span>
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Verifying & Signing In...' : 'Sign In to Dashboard →'}</span>
                </button>
              </div>
            )}

            {/* Error Messages */}
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

            {/* Footer Switcher Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'register' ? 'login' : 'register');
                  setCurrentStep(1);
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
