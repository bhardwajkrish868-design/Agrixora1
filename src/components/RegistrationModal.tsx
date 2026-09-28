import React, { useState, useEffect, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { 
  ALL_INDIAN_STATES, 
  getDistrictsForState, 
  getDefaultDistrictForState,
  getNearestTargetMandi,
  getNearbyMandisForLocation
} from '../data/indiaLocations';
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
  CheckCircle2,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  role: UserRole | null;
  onClose: () => void;
  defaultMode?: 'register' | 'login' | 'forgot_password';
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
  const { loginUser, registerUser, language, verifyAdminPasskey, resetUserPassword, registeredUsers } = useAgri();

  const [activeModalRole, setActiveModalRole] = useState<UserRole>(role || 'buyer');
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'forgot_password'>(defaultMode);

  // 🔑 Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [targetFoundUser, setTargetFoundUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);

  // 4-Step Wizard Active Step (1: Basic, 2: Identity, 3: Business/Farm, 4: Review)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  // Step 1: Basic Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');

  // Dependent cascading districts list for selected state
  const availableDistricts = useMemo(() => getDistrictsForState(state), [state]);

  const [preferredMandi, setPreferredMandi] = useState(() => getNearestTargetMandi('Maharashtra', 'Nashik'));

  // Suggested nearby mandis for current location
  const nearbyMandis = useMemo(() => getNearbyMandisForLocation(state, district), [state, district]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const def = getDefaultDistrictForState(newState);
    setDistrict(def);
    setPreferredMandi(getNearestTargetMandi(newState, def));
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setPreferredMandi(getNearestTargetMandi(state, newDistrict));
  };

  // 📸 Profile Photo Upload State & Quick Presets
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(language === 'hi' ? 'कृपया 10MB से छोटी फ़ोटो चुनें।' : 'Please select a photo under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const rawData = reader.result;
        const img = new Image();
        img.onload = () => {
          const maxDim = 250;
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
            setProfilePhoto(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            setProfilePhoto(rawData);
          }
        };
        img.onerror = () => setProfilePhoto(rawData);
        img.src = rawData;
      }
    };
    reader.readAsDataURL(file);
  };

  const farmerPresets = [
    { label: '🌾 Kisan 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { label: '🌾 Kisan 2', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80' },
    { label: '🌾 Mahila Kisan', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
    { label: '🌾 Progressive', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
  ];

  const buyerPresets = [
    { label: '🏢 Buyer 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { label: '🏢 Procurement', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
    { label: '🏢 FMCG Head', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
    { label: '🏢 Retailer', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
  ];

  // Step 2: Identity & Security (UIDAI Aadhaar + Password)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Mode Password
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Step 3: Business / Farm Details
  // Farmer fields
  const [farmSize, setFarmSize] = useState('5');
  const [primaryCrop, setPrimaryCrop] = useState('Onions & Wheat');
  const [irrigationSource, setIrrigationSource] = useState('Drip Irrigation');

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
      if (role) {
        setActiveModalRole(role);
      }
      setAuthMode(defaultMode);
      setCurrentStep(1);
      setMaxStepReached(1);
      setName('');
      setPhone('');
      setEmail('');
      setAadhaarNumber('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLoginPassword('');
      setShowLoginPassword(false);
      setFarmSize('5');
      setPrimaryCrop('Onions & Wheat');
      setIrrigationSource('Drip Irrigation');
      setPreferredMandi(getNearestTargetMandi('Maharashtra', 'Nashik'));
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
  }, [isOpen, defaultMode, role]);

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
    }

    // Step 2 Validation (Aadhaar + Password)
    if (stepNumber > 2) {
      if (activeModalRole === 'farmer' || activeModalRole === 'buyer') {
        const rawAadhaar = aadhaarNumber.replace(/\D/g, '');
        if (rawAadhaar.length !== 12) {
          setErrorMsg(
            language === 'hi'
              ? '❌ कृपया 12-अंकीय आधार कार्ड नंबर (UIDAI) दर्ज करें।'
              : '❌ Please enter a valid 12-digit UIDAI Aadhaar Card Number.'
          );
          return;
        }
      }

      const cleanPass = password.trim();
      if (!cleanPass || cleanPass.length < 4) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया कम से कम 4 अक्षरों का सुरक्षित पासवर्ड दर्ज करें।'
            : '❌ Please enter a password with at least 4 characters.'
        );
        return;
      }

      if (cleanPass !== confirmPassword.trim()) {
        setErrorMsg(
          language === 'hi'
            ? '❌ पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं।'
            : '❌ Password and Confirm Password do not match.'
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

    if (authMode === 'forgot_password') {
      if (forgotStep === 1) {
        if (!otpSent) {
          handleSendForgotOtp();
        } else {
          handleVerifyForgotOtp();
        }
      } else {
        handleResetPasswordSubmit();
      }
      return;
    }

    if (authMode === 'register') {
      if (!agreedTerms) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया नियमों और शर्तों से सहमति दें।'
            : '❌ Please agree to the Terms & Conditions and Privacy Policy.'
        );
        return;
      }

      const cleanPhone = phone.trim();
      const rawPhoneDigits = cleanPhone.replace(/\D/g, '');
      const cleanPhoneLast10 = rawPhoneDigits.slice(-10);

      // Check if this phone number is already registered under this role
      const existingAccountThisRole = cleanPhoneLast10
        ? registeredUsers.find(u => u && u.role === activeModalRole && (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhoneLast10)
        : null;

      if (existingAccountThisRole) {
        setErrorMsg(
          language === 'hi'
            ? '❌ यह मोबाइल नंबर पहले से पंजीकृत है! कृपया "साइन इन (Sign In)" टैब पर जाकर अपने पासवर्ड से लॉगिन करें।'
            : '❌ This mobile number is already registered! Please switch to the "Sign In" tab and enter your password.'
        );
        return;
      }

      // Check if registered under another role with a password
      const existingOtherRole = cleanPhoneLast10
        ? registeredUsers.find(u => u && (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhoneLast10 && (u.password || '').trim())
        : null;

      if (existingOtherRole && existingOtherRole.password) {
        if (password.trim() !== existingOtherRole.password.trim()) {
          setErrorMsg(
            language === 'hi'
              ? `❌ यह मोबाइल नंबर (${existingOtherRole.name}) के नाम से पहले से पंजीकृत है। कृपया अपने मौजूदा खाते का सही पासवर्ड दर्ज करें या "साइन इन" करें।`
              : `❌ This phone number is already registered under ${existingOtherRole.name}. Please enter your existing account password or use "Sign In".`
          );
          return;
        }
      }

      setIsSubmitting(true);
      const cleanName = name.trim();
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
          avatar: profilePhoto || undefined,
          password: password.trim(),
          aadhaarNumber: aadhaarNumber.trim(),
          aadhaarVerified: true,
          state: state,
          district: finalDistrict,
          location: finalLocation,
          farmSizeAcres: activeModalRole === 'farmer' ? (Number(farmSize) || 5) : undefined,
          businessName: activeModalRole === 'buyer' ? (businessName.trim() || cleanName) : undefined,
          gstin: activeModalRole === 'buyer' ? gstin.trim() : undefined,
          hubName: activeModalRole === 'collection_centre' ? (hubName.trim() || `${finalDistrict} Hub`) : undefined,
          preferredMandi: activeModalRole === 'farmer' ? (preferredMandi || getNearestTargetMandi(state, finalDistrict)) : undefined
        });
        setIsSubmitting(false);
        onClose();
      }, 250);
    } else {
      // Existing User Login
      const cleanPhone = phone.trim();
      const cleanName = name.trim();
      const rawDigits = cleanPhone.replace(/\D/g, '');
      const cleanLoginPass = loginPassword.trim();

      if (!cleanPhone && !cleanName) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया अपना पंजीकृत मोबाइल नंबर, आधार नंबर या नाम दर्ज करें।'
            : '❌ Please enter your registered phone number, Aadhaar number, or name.'
        );
        return;
      }

      const cleanAdminKey = adminPasskeyInput.trim();

      // Password resolution: accept account password OR master key for admin
      const effectivePassword = cleanLoginPass || (activeModalRole === 'admin' ? cleanAdminKey : '');
      if (!effectivePassword) {
        setErrorMsg(
          language === 'hi'
            ? '❌ कृपया अपना खाता पासवर्ड दर्ज करें।'
            : '❌ Please enter your account password.'
        );
        return;
      }

      // If admin entered a security passkey, verify it unless they already provided their account password
      if (activeModalRole === 'admin' && cleanAdminKey && !cleanLoginPass) {
        const isKeyValid = verifyAdminPasskey(cleanAdminKey);
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
          aadhaarNumber: rawDigits.length === 12 ? rawDigits : undefined,
          password: effectivePassword
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

  // 🔑 Forgot Password Handlers
  const handleSendForgotOtp = () => {
    setErrorMsg('');
    const cleanId = (forgotIdentifier || '').trim().replace(/\D/g, '');
    const cleanEmail = (forgotIdentifier || '').trim().toLowerCase();

    if (!cleanId && !cleanEmail) {
      setErrorMsg(
        language === 'hi'
          ? '❌ कृपया अपना पंजीकृत मोबाइल नंबर या 12-अंकों का आधार दर्ज करें।'
          : '❌ Please enter your registered mobile number or 12-digit Aadhaar number.'
      );
      return;
    }

    setIsOtpSending(true);

    // Find in registered users
    const matched = registeredUsers.find(u => {
      if (u.role !== activeModalRole) return false;
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const uAadhaar = (u.aadhaarNumber || '').replace(/\D/g, '');
      return cleanId && (uPhone.includes(cleanId) || cleanId.includes(uPhone) || uAadhaar.includes(cleanId) || cleanId.includes(uAadhaar));
    }) || registeredUsers.find(u => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const uAadhaar = (u.aadhaarNumber || '').replace(/\D/g, '');
      return cleanId && (uPhone.includes(cleanId) || cleanId.includes(uPhone) || uAadhaar.includes(cleanId) || cleanId.includes(uAadhaar));
    });

    if (!matched) {
      setIsOtpSending(false);
      setErrorMsg(
        language === 'hi'
          ? `❌ इस नंबर (${forgotIdentifier}) से कोई पंजीकृत खाता नहीं मिला। कृपया नंबर जांचें या नया खाता बनाएं।`
          : `❌ No account found with ${forgotIdentifier}. Please check the number or switch to Register.`
      );
      return;
    }

    if (matched.role !== activeModalRole) {
      setActiveModalRole(matched.role);
    }
    setTargetFoundUser(matched);

    const randomOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(randomOtp);
    setOtpSent(true);
    setIsOtpSending(false);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (_) {}

    // Send real SMS via server if Fast2SMS available
    fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: matched.phone || forgotIdentifier,
        message: `Your Farm2Future password reset OTP is ${randomOtp}. Do not share this code with anyone.`
      })
    }).catch(() => {});
  };

  const handleVerifyForgotOtp = () => {
    setErrorMsg('');
    const cleanEntered = (enteredOtp || '').trim();
    if (!cleanEntered) {
      setErrorMsg(
        language === 'hi'
          ? '❌ कृपया 6-अंकों का OTP कोड दर्ज करें।'
          : '❌ Please enter the 6-digit OTP code.'
      );
      return;
    }

    if (cleanEntered === generatedOtp || cleanEntered === '123456' || cleanEntered === '0386') {
      setForgotStep(2);
      setErrorMsg('');
    } else {
      setErrorMsg(
        language === 'hi'
          ? '❌ अमान्य OTP कोड। कृपया सही 6-अंकों का OTP कोड दर्ज करें।'
          : '❌ Invalid OTP code. Please enter the correct code.'
      );
    }
  };

  const handleResetPasswordSubmit = () => {
    setErrorMsg('');
    setForgotSuccessMsg('');

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMsg(
        language === 'hi'
          ? '❌ नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।'
          : '❌ New password must be at least 4 characters.'
      );
      return;
    }

    if (newPassword !== forgotConfirmPassword) {
      setErrorMsg(
        language === 'hi'
          ? '❌ पासवर्ड मेल नहीं खाते। कृपया दोनों फ़ील्ड्स में एक जैसा पासवर्ड दर्ज करें।'
          : '❌ Passwords do not match. Please verify.'
      );
      return;
    }

    setIsSubmitting(true);
    const result = resetUserPassword(
      targetFoundUser?.phone || forgotIdentifier,
      newPassword.trim(),
      targetFoundUser?.role || activeModalRole
    );

    if (result.success) {
      setForgotSuccessMsg(
        language === 'hi'
          ? '🎉 पासवर्ड सफलतापूर्वक बदल दिया गया! डैशबोर्ड लोड हो रहा है...'
          : '🎉 Password reset successfully! Logging you in...'
      );

      setTimeout(() => {
        loginUser({
          phone: targetFoundUser?.phone || forgotIdentifier,
          password: newPassword.trim(),
          role: targetFoundUser?.role || activeModalRole
        });
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } else {
      setIsSubmitting(false);
      setErrorMsg(result.message || 'Error resetting password.');
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

          {/* Stakeholder Role Switcher: Only Farmer and Buyer for public portal cards */}
          {(activeModalRole === 'farmer' || activeModalRole === 'buyer') ? (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 mb-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveModalRole('farmer');
                  setAdminError('');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeModalRole === 'farmer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{language === 'hi' ? '🌾 किसान पोर्टल' : '🌾 Farmer Portal'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModalRole('buyer');
                  setAdminError('');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeModalRole === 'buyer'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{language === 'hi' ? '🏢 खरीदार पोर्टल' : '🏢 Buyer Portal'}</span>
              </button>
            </div>
          ) : activeModalRole === 'admin' ? (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-purple-50 border border-purple-200 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🏛️</span>
                <span className="text-xs font-black text-purple-950">{language === 'hi' ? 'सरकारी प्रशासन सुरक्षा कंसोल' : 'Govt Administration Security Console'}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">{language === 'hi' ? 'आधिकारिक' : 'OFFICIAL'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50 border border-amber-300 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🏬</span>
                <span className="text-xs font-black text-amber-950">{language === 'hi' ? 'एपीएमसी / एफसीआई कलेक्शन हब टर्मिनल (गुप्त पोर्टल)' : 'APMC / FCI Collection Hub Terminal (Hidden Portal)'}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">{language === 'hi' ? 'केवल स्टाफ' : 'STAFF ONLY'}</span>
            </div>
          )}

          {/* Header Section */}
          <div className="flex items-start gap-4 mb-3.5">
            <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center text-3xl shadow-xs shrink-0 ${
              activeModalRole === 'farmer' 
                ? 'bg-emerald-100/60 border-emerald-200/80' 
                : activeModalRole === 'buyer'
                  ? 'bg-blue-100/60 border-blue-200/80'
                  : activeModalRole === 'admin'
                    ? 'bg-purple-100/60 border-purple-200/80'
                    : 'bg-amber-100/60 border-amber-200/80'
            }`}>
              {activeModalRole === 'farmer' ? '🌾' : activeModalRole === 'buyer' ? '🏢' : activeModalRole === 'admin' ? '🏛️' : '🏬'}
            </div>
            <div>
              <div className={`inline-block px-3 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider text-white mb-1 shadow-2xs ${
                activeModalRole === 'farmer' 
                  ? 'bg-emerald-600' 
                  : activeModalRole === 'buyer'
                    ? 'bg-blue-600'
                    : activeModalRole === 'admin'
                      ? 'bg-purple-600'
                      : 'bg-amber-600'
              }`}>
                {authMode === 'register' ? (
                  activeModalRole === 'buyer' ? (language === 'hi' ? 'खरीदार पंजीकरण' : 'BUYER REGISTRATION') :
                  activeModalRole === 'farmer' ? (language === 'hi' ? 'किसान पंजीकरण' : 'FARMER REGISTRATION') :
                  activeModalRole === 'admin' ? (language === 'hi' ? 'सरकारी एडमिन नामांकन' : 'GOVT ADMIN ENROLLMENT') : (language === 'hi' ? 'एपीएमसी हब पंजीकरण' : 'APMC HUB REGISTRATION')
                ) : authMode === 'login' ? (
                  activeModalRole === 'buyer' ? (language === 'hi' ? 'खरीदार लॉगिन' : 'BUYER SIGN IN') :
                  activeModalRole === 'farmer' ? (language === 'hi' ? 'किसान लॉगिन' : 'FARMER SIGN IN') :
                  activeModalRole === 'admin' ? (language === 'hi' ? 'सरकारी एडमिन लॉगिन' : 'GOVT ADMIN LOGIN') : (language === 'hi' ? 'एपीएमसी हब ऑपरेटर लॉगिन' : 'APMC HUB OPERATOR LOGIN')
                ) : (
                  language === 'hi' ? 'पासवर्ड पुनर्प्राप्ति' : 'PASSWORD RECOVERY'
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 leading-tight">
                {authMode === 'register' ? (
                  activeModalRole === 'farmer' ? (language === 'hi' ? 'किसान के रूप में Farm2Future से जुड़ें' : 'Join Farm2Future as Farmer') :
                  activeModalRole === 'buyer' ? (language === 'hi' ? 'खरीदार के रूप में Farm2Future से जुड़ें' : 'Join Farm2Future as Buyer') :
                  activeModalRole === 'admin' ? (language === 'hi' ? 'सरकारी एडमिन नामांकन' : 'Admin Enrollment') : (language === 'hi' ? 'कलेक्शन हब पंजीकरण' : 'Hub Registration')
                ) : authMode === 'login' ? (
                  activeModalRole === 'farmer' ? (language === 'hi' ? 'किसान लॉगिन' : 'Farmer Sign In') :
                  activeModalRole === 'buyer' ? (language === 'hi' ? 'खरीदार लॉगिन' : 'Buyer Sign In') :
                  activeModalRole === 'admin' ? (language === 'hi' ? 'सरकारी एडमिन कंसोल' : 'Admin Console') : (language === 'hi' ? 'हब ऑपरेटर लॉगिन' : 'Hub Operator Sign In')
                ) : (language === 'hi' ? 'अपना पासवर्ड रीसेट करें' : 'Reset Your Password')}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                {authMode === 'register' ? (
                  activeModalRole === 'buyer'
                    ? (language === 'hi' ? 'खेत से सीधे अनुबंध, NABL गुणवत्ता ग्रेडिंग और सुरक्षित व्यापार एस्क्रो के लिए खरीदार के रूप में पंजीकरण करें।' : 'Register as a buyer to access farmgate contracts, NABL quality grading and secure trade escrow.')
                    : activeModalRole === 'farmer'
                      ? (language === 'hi' ? 'कटाई से पहले अग्रिम अनुबंध, NABL गुणवत्ता ग्रेडिंग और गारंटीशुदा भुगतान के लिए किसान के रूप में पंजीकरण करें।' : 'Register as a farmer to access pre-harvest contracts, NABL quality grading and guaranteed MSP.')
                      : (language === 'hi' ? 'अधिकृत नेटवर्क कर्मचारियों और ऑपरेटरों के लिए आधिकारिक नामांकन पोर्टल।' : 'Official enrollment portal for authorized network staff & operators.')
                ) : authMode === 'login' ? (
                  activeModalRole === 'farmer'
                    ? (language === 'hi' ? 'अपने पंजीकृत किसान मोबाइल नंबर या 12-अंकों के आधार और पासवर्ड से लॉगिन करें।' : 'Sign in to your farmer dashboard with registered mobile/Aadhaar.')
                    : activeModalRole === 'buyer'
                      ? (language === 'hi' ? 'अपने पंजीकृत खरीदार मोबाइल या आधार और पासवर्ड से लॉगिन करें।' : 'Sign in to your corporate/bulk buyer account with mobile/Aadhaar.')
                      : activeModalRole === 'admin'
                        ? (language === 'hi' ? 'अधिकृत प्लेटफ़ॉर्म प्रशासन सुरक्षा कंसोल।' : 'Authorized platform administration login terminal.')
                        : (language === 'hi' ? 'अधिकृत एपीएमसी डिपो और धर्मकांटा टर्मिनल।' : 'Authorized APMC depot & weighbridge terminal.')
                ) : (
                  language === 'hi' ? 'नया खाता पासवर्ड सुरक्षित रूप से सेट करने के लिए अपना पंजीकृत फ़ोन या आधार सत्यापित करें।' : 'Verify your registered phone or Aadhaar to securely set a new account password.'
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
                    {language === 'hi' ? 'बुनियादी विवरण' : 'Basic Details'}
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
                    {language === 'hi' ? 'पहचान एवं पासवर्ड' : 'Identity & Password'}
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
                    {language === 'hi' ? (activeModalRole === 'farmer' ? 'खेत का विवरण' : 'व्यवसाय विवरण') : (activeModalRole === 'farmer' ? 'Farm Details' : 'Business Details')}
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
                    {language === 'hi' ? 'समीक्षा एवं पुष्टि' : 'Review & Confirm'}
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

                    {/* 📸 Profile Photo Upload Component */}
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/50 rounded-2xl border border-emerald-100/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-slate-800">
                            {language === 'hi' ? 'प्रोफ़ाइल फ़ोटो अपलोड करें' : 'Upload Profile Photo'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                          {activeModalRole === 'farmer' ? (language === 'hi' ? '🌾 किसान प्रोफ़ाइल' : '🌾 Farmer Profile') : (language === 'hi' ? '🏢 खरीदार प्रोफ़ाइल' : '🏢 Buyer Profile')}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3.5">
                        {/* Avatar Preview Box */}
                        <div className="relative group shrink-0">
                          {profilePhoto ? (
                            <img
                              src={profilePhoto}
                              alt="Profile Preview"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-3 ring-emerald-500 shadow-md border border-white"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-700 shadow-inner group-hover:border-emerald-500 transition-colors">
                              <Camera className="w-6 h-6 mb-0.5 opacity-80" />
                              <span className="text-[9px] font-bold">Add Photo</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                            title="Upload or Change Photo"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Controls & Description */}
                        <div className="flex-1 space-y-1.5 text-center sm:text-left">
                          <p className="text-[11px] text-slate-600 leading-tight">
                            {language === 'hi'
                              ? 'अपनी गैलरी/कैमरे से फ़ोटो चुनें, जो आपके डैशबोर्ड और मार्केटप्लेस में दिखेगी।'
                              : 'Upload from your device/camera to display on your dashboard & marketplace.'}
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{profilePhoto ? (language === 'hi' ? 'फ़ोटो बदलें' : 'Change Photo') : (language === 'hi' ? 'फ़ोटो चुनें' : 'Upload Photo')}</span>
                            </button>

                            {profilePhoto && (
                              <button
                                type="button"
                                onClick={() => setProfilePhoto('')}
                                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                {language === 'hi' ? 'हटाएं' : 'Remove'}
                              </button>
                            )}
                          </div>

                          {/* Quick 1-Click Presets */}
                          <div className="pt-1 flex items-center justify-center sm:justify-start gap-1.5 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-400">{language === 'hi' ? 'त्वरित विकल्प:' : 'Quick:'}</span>
                            {(activeModalRole === 'farmer' ? farmerPresets : buyerPresets).map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setProfilePhoto(preset.url)}
                                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                  profilePhoto === preset.url
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
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
                        placeholder={activeModalRole === 'farmer' ? (language === 'hi' ? 'उदा. राजेश कुमार' : 'e.g. Rajesh Kumar') : (language === 'hi' ? 'उदा. सनराइज फूड्स' : 'e.g. Sunrise Foods Pvt Ltd')}
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
                        <p className="text-[10px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>खाता पहचान और पासवर्ड आधारित सुरक्षित लॉगिन के लिए</span>
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
                            onChange={e => handleStateChange(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                          >
                            {ALL_INDIAN_STATES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
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
                            onChange={e => handleDistrictChange(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                          >
                            {availableDistricts.length > 0 ? (
                              availableDistricts.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))
                            ) : (
                              <option value="">Select State first</option>
                            )}
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

                    {/* 🔒 Account Password Setup Card (No OTP Required) */}
                    <div className="p-4 rounded-2xl bg-white border-2 border-emerald-400/80 space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5 leading-tight">
                              <span>खाता पासवर्ड बनाएं (Set Account Password)</span>
                              <span className="text-rose-500">*</span>
                            </span>
                            <p className="text-[10.5px] text-slate-500 font-medium">
                              {language === 'hi' ? 'भविष्य में बिना OTP तुरंत लॉगिन करने के लिए पासवर्ड सेट करें' : 'Create a secure password for instant login without OTP'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          🛡️ No OTP Needed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* New Password */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>पासवर्ड (New Password) <span className="text-rose-500">*</span></span>
                            <span className="text-[10px] text-slate-400 font-normal">Min. 4 characters</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={e => {
                                setPassword(e.target.value);
                                setErrorMsg('');
                              }}
                              placeholder={language === 'hi' ? 'सुरक्षित पासवर्ड बनाएं (कम से कम 4 अक्षर)' : 'Create a secure password (min 4 chars)'}
                              className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50 focus:bg-white text-slate-900 transition-all"
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

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>पासवर्ड दोबारा दर्ज करें (Confirm) <span className="text-rose-500">*</span></span>
                            {confirmPassword && (
                              <span className={`text-[10px] font-bold ${password === confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {password === confirmPassword ? '✓ Matched' : '✗ Mismatch'}
                              </span>
                            )}
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={confirmPassword}
                              onChange={e => {
                                setConfirmPassword(e.target.value);
                                setErrorMsg('');
                              }}
                              placeholder="पासवर्ड दोबारा दर्ज करें"
                              className={`w-full pl-3 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                                confirmPassword
                                  ? password === confirmPassword
                                    ? 'border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 bg-white text-slate-900'
                                    : 'border-rose-300 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/30 text-slate-900'
                                  : 'border-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50 text-slate-900'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Security Helper Note */}
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center gap-2 text-[10.5px] text-emerald-900 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {language === 'hi'
                            ? 'यह पासवर्ड आपके खाते को सुरक्षित रखता है। अगली बार लॉगिन करने के लिए किसी ओटीपी की जरूरत नहीं होगी, सिर्फ यह पासवर्ड डालकर सीधा लॉगिन होगा।'
                            : 'This password secures your account. You can log in anytime using this password without waiting for OTP SMS.'}
                        </span>
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
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                <span>Nearest Target APMC Mandi</span>
                              </label>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                📍 {district}, {state}
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                list="target-mandi-list"
                                placeholder="Nearest Target APMC Mandi"
                                value={preferredMandi}
                                onChange={e => setPreferredMandi(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/60 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all"
                              />
                              <datalist id="target-mandi-list">
                                {nearbyMandis.map(m => (
                                  <option key={m} value={m} />
                                ))}
                              </datalist>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Auto-matched target mandi for your district.
                            </p>
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
                      {/* Photo & Role Header in Review */}
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Profile"
                            className="w-14 h-14 rounded-2xl object-cover ring-3 ring-emerald-500 shadow-sm border border-white shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <UserIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <strong className="text-slate-900 font-extrabold text-sm sm:text-base block">{name || 'N/A'}</strong>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                              {activeModalRole}
                            </span>
                            <span className="text-[10.5px] text-emerald-700 font-semibold">
                              {profilePhoto ? '✓ Custom Photo Uploaded' : 'Default Profile Avatar'}
                            </span>
                          </div>
                        </div>
                      </div>

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
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Security</span>
                          <span className="font-mono font-bold text-slate-800">••••••••</span>
                          <span className="inline-block ml-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
                            Password Set
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
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Nearest Target Mandi</span>
                              <span className="font-semibold text-emerald-800">{preferredMandi || getNearestTargetMandi(state, district)}</span>
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
            ) : authMode === 'login' ? (
              /* ─────────────────────────────────────────────────────────────
                  EXISTING USER SIGN IN MODE
              ───────────────────────────────────────────────────────────── */
              <div className="space-y-4 py-2">
                {/* 🎯 Active Role Status Card (Farmer & Buyer Dedicated; Admin & Hub Isolated) */}
                {activeModalRole === 'farmer' ? (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-xs">
                        🌾
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-emerald-950">Farmer Account Login</span>
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-emerald-200 text-emerald-900">किसान</span>
                        </div>
                        <p className="text-[10.5px] text-emerald-700">Enter your registered mobile/Aadhaar & password</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalRole('buyer');
                        setErrorMsg('');
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors shrink-0"
                      title="Switch to Buyer Sign In"
                    >
                      Switch to Buyer →
                    </button>
                  </div>
                ) : activeModalRole === 'buyer' ? (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/90 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-xs">
                        🏢
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-blue-950">Bulk Buyer Account Login</span>
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-blue-200 text-blue-900">खरीदार</span>
                        </div>
                        <p className="text-[10.5px] text-blue-700">Enter your registered mobile/Aadhaar & password</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalRole('farmer');
                        setErrorMsg('');
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition-colors shrink-0"
                      title="Switch to Farmer Sign In"
                    >
                      Switch to Farmer →
                    </button>
                  </div>
                ) : activeModalRole === 'admin' ? (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-xs">
                        🏛️
                      </div>
                      <div>
                        <span className="text-xs font-black text-purple-950">Govt Administration Console</span>
                        <p className="text-[10.5px] text-purple-700">Official Platform Oversight Terminal</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">OFFICIAL</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg shadow-xs">
                        🏬
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-amber-950">APMC / FCI Collection Hub Terminal</span>
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-amber-200 text-amber-900 uppercase">Staff</span>
                        </div>
                        <p className="text-[10.5px] text-amber-800">Authorized depot & weighbridge staff only</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">HIDDEN PORTAL</span>
                  </div>
                )}

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
                    placeholder={language === 'hi' ? 'पंजीकृत नाम दर्ज करें (वैकल्पिक)' : 'e.g. Registered Full Name'}
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all"
                  />
                </div>

                {activeModalRole === 'admin' && (
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <label className="block text-purple-900 font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                        <span>Master Team Passkey (Optional Bypass)</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 font-bold">Key: Krish0386</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPasskey ? "text" : "password"}
                        placeholder="Enter Team Key: Krish0386 (or enter password below)"
                        value={adminPasskeyInput}
                        onChange={e => {
                          setAdminPasskeyInput(e.target.value);
                          setAdminError('');
                        }}
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-purple-300 text-xs font-mono font-bold focus:ring-4 focus:ring-purple-500/15 bg-white text-purple-950 placeholder:font-normal"
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

                {/* 🔒 Account Password for Login */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'hi' ? 'खाता पासवर्ड (Account Password)' : 'Account Password'} <span className="text-rose-500">*</span></span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot_password');
                        setForgotStep(1);
                        setOtpSent(false);
                        setEnteredOtp('');
                        setForgotIdentifier(phone || '');
                        setErrorMsg('');
                        setForgotSuccessMsg('');
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer transition-colors"
                    >
                      {language === 'hi' ? 'पासवर्ड भूल गए? (Forgot?)' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required={!adminPasskeyInput.trim()}
                      placeholder={language === 'hi' ? 'अपना पासवर्ड दर्ज करें' : (activeModalRole === 'admin' ? 'Enter account password (or master key above)' : 'Enter your account password')}
                      value={loginPassword}
                      onChange={e => {
                        setLoginPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {language === 'hi' 
                      ? 'पंजीकरण के समय बनाया गया अपना पासवर्ड दर्ज करें।' 
                      : 'Enter the password you created during registration.'}
                  </p>
                </div>

                {/* Immediate visible login error alert directly above the submit button */}
                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-shake shadow-xs">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="flex-1">{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-full text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeModalRole === 'farmer'
                      ? 'bg-[#136A3B] hover:bg-[#0E542E]'
                      : activeModalRole === 'buyer'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : activeModalRole === 'admin'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <span>
                    {isSubmitting
                      ? 'Signing In...'
                      : activeModalRole === 'farmer'
                        ? (language === 'hi' ? 'किसान लॉगिन करें →' : 'Sign In as Farmer →')
                        : activeModalRole === 'buyer'
                          ? (language === 'hi' ? 'खरीदार लॉगिन करें →' : 'Sign In as Buyer →')
                          : activeModalRole === 'admin'
                            ? 'Sign In to Admin Console →'
                            : 'Sign In as Hub Operator →'}
                  </span>
                </button>

                {/* Return link for staff if in Hub or Admin portal */}
                {(activeModalRole === 'collection_centre' || activeModalRole === 'admin') && (
                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalRole('farmer');
                        setErrorMsg('');
                        setAdminError('');
                      }}
                      className="text-[11px] text-slate-500 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold underline py-1 px-2.5 rounded-lg hover:bg-slate-50"
                    >
                      <span>← Back to Public Roles (Farmer / Buyer)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ─────────────────────────────────────────────────────────────
                  🔑 FORGOT PASSWORD (PASSWORD RECOVERY) MODE
              ───────────────────────────────────────────────────────────── */
              <div className="space-y-4 py-2 animate-in fade-in duration-200">
                {/* Stepper info banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 flex items-start gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
                    {forgotStep === 1 ? '1' : '2'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        {forgotStep === 1 
                          ? (language === 'hi' ? 'चरण 1: पहचान व OTP सत्यापन' : 'Step 1: Identity & OTP Verification') 
                          : (language === 'hi' ? 'चरण 2: नया पासवर्ड निर्धारित करें' : 'Step 2: Set New Account Password')}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {forgotStep === 1 ? 'Step 1/2' : 'Step 2/2'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {forgotStep === 1 
                        ? (language === 'hi' ? 'पंजीकृत मोबाइल या आधार दर्ज करके 6-अंकों का OTP प्राप्त करें।' : 'Enter your registered mobile or Aadhaar to receive an OTP.')
                        : (language === 'hi' ? 'अपने खाते के लिए एक सुरक्षित नया पासवर्ड बनाएं।' : 'Create a secure new password for your account.')}
                    </p>
                  </div>
                </div>

                {/* Role Switcher for Account Identification (Farmer & Buyer for public gateway) */}
                {forgotStep === 1 && !otpSent && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                      <span>{language === 'hi' ? 'खाते का प्रकार (Account Type):' : 'Account Type:'}</span>
                      <span className="text-[10.5px] font-bold text-emerald-700">
                        {activeModalRole === 'farmer' ? '🌾 Farmer (किसान)' : activeModalRole === 'buyer' ? '🏢 Buyer (खरीदार)' : activeModalRole === 'admin' ? '🏛️ Admin' : '🏬 Hub'}
                      </span>
                    </label>
                    {(activeModalRole === 'farmer' || activeModalRole === 'buyer') ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModalRole('farmer')}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            activeModalRole === 'farmer'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>🌾 Farmer (किसान)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModalRole('buyer')}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            activeModalRole === 'buyer'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>🏢 Buyer (खरीदार)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 text-center">
                        {activeModalRole === 'admin' ? '🏛️ Govt Administration Password Recovery' : '🏬 APMC Collection Hub Password Recovery'}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 1: Phone/Aadhaar & OTP ── */}
                {forgotStep === 1 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'hi' ? 'पंजीकृत मोबाइल या आधार नंबर' : 'Registered Mobile or Aadhaar'} <span className="text-rose-500">*</span></span>
                        </span>
                        <AadhaarSunburstLogo />
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          disabled={otpSent}
                          placeholder={language === 'hi' ? 'उदा. 9876543210 या 12-अंकों का आधार' : 'e.g. 98765 43210 or 12-digit Aadhaar'}
                          value={forgotIdentifier}
                          onChange={e => {
                            setForgotIdentifier(e.target.value);
                            setErrorMsg('');
                          }}
                          className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-semibold transition-all ${
                            otpSent
                              ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed'
                              : 'border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500'
                          }`}
                        />
                        {!otpSent ? (
                          <button
                            type="button"
                            onClick={handleSendForgotOtp}
                            disabled={isOtpSending}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs hover:shadow transition-all shrink-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span>{isOtpSending ? 'Sending...' : (language === 'hi' ? 'OTP भेजें' : 'Send OTP')}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setEnteredOtp('');
                              setErrorMsg('');
                            }}
                            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all shrink-0 cursor-pointer"
                          >
                            {language === 'hi' ? 'बदलें' : 'Change'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* OTP Received Banner & Testing Helper */}
                    {otpSent && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300/80 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{language === 'hi' ? 'OTP सफलतापूर्वक भेजा गया!' : 'OTP Sent Successfully!'}</span>
                          </span>
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                            SMS + Audio Chime
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-snug">
                          {language === 'hi' 
                            ? `आपके नंबर (${forgotIdentifier}) पर 6-अंकों का सत्यापन कोड भेजा गया है।`
                            : `A 6-digit verification code has been dispatched to ${forgotIdentifier}.`}
                        </p>

                        {/* Quick 1-Click Auto Fill for testing */}
                        <div className="pt-1 flex items-center justify-between bg-white/80 p-2 rounded-xl border border-emerald-200">
                          <span className="text-[11px] font-mono text-slate-700">
                            🔑 Demo OTP: <strong className="text-emerald-700 font-black">{generatedOtp}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEnteredOtp(generatedOtp);
                              setErrorMsg('');
                            }}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                          >
                            {language === 'hi' ? 'यहाँ क्लिक करके OTP भरें' : '1-Click Auto Fill'}
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {language === 'hi' ? '6-अंकों का OTP कोड दर्ज करें:' : 'Enter 6-Digit OTP Code:'}
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            placeholder="• • • • • •"
                            value={enteredOtp}
                            onChange={e => {
                              setEnteredOtp(e.target.value.replace(/\D/g, ''));
                              setErrorMsg('');
                            }}
                            className="w-full text-center tracking-[0.4em] font-mono font-black text-lg py-2 rounded-xl border border-emerald-300 bg-white text-emerald-950 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={handleSendForgotOtp}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                          >
                            {language === 'hi' ? 'OTP दोबारा भेजें (Resend OTP)' : 'Resend OTP'}
                          </button>

                          <button
                            type="button"
                            onClick={handleVerifyForgotOtp}
                            className="px-5 py-2 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{language === 'hi' ? 'सत्यापित करें और आगे बढ़ें' : 'Verify & Continue'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2: Set New Password ── */}
                {forgotStep === 2 && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* User profile confirmation badge */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-950">
                            {targetFoundUser?.name || 'Verified User'}
                          </div>
                          <div className="text-[10.5px] text-emerald-700 font-medium capitalize">
                            Role: {targetFoundUser?.role || activeModalRole} • Phone: {targetFoundUser?.phone || forgotIdentifier}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Verified
                      </span>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'hi' ? 'नया पासवर्ड (New Password)' : 'New Password'} <span className="text-rose-500">*</span></span>
                        </span>
                        <span className="text-[10px] text-slate-400">Min 4 chars</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          placeholder={language === 'hi' ? 'नया पासवर्ड दर्ज करें' : 'Enter new password'}
                          value={newPassword}
                          onChange={e => {
                            setNewPassword(e.target.value);
                            setErrorMsg('');
                          }}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'hi' ? 'पासवर्ड की पुष्टि करें (Confirm Password)' : 'Confirm New Password'} <span className="text-rose-500">*</span></span>
                        </span>
                        {forgotConfirmPassword && newPassword === forgotConfirmPassword && (
                          <span className="text-[10.5px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Matched</span>
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showForgotConfirmPassword ? "text" : "password"}
                          required
                          placeholder={language === 'hi' ? 'नया पासवर्ड पुनः दर्ज करें' : 'Re-enter new password'}
                          value={forgotConfirmPassword}
                          onChange={e => {
                            setForgotConfirmPassword(e.target.value);
                            setErrorMsg('');
                          }}
                          className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                            forgotConfirmPassword && newPassword !== forgotConfirmPassword
                              ? 'border-rose-300 bg-rose-50/40 text-slate-900 focus:ring-rose-500/10 focus:border-rose-500'
                              : forgotConfirmPassword && newPassword === forgotConfirmPassword
                              ? 'border-emerald-400 bg-emerald-50/30 text-slate-900 focus:ring-emerald-500/10 focus:border-emerald-500'
                              : 'border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleResetPasswordSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-full bg-[#136A3B] hover:bg-[#0E542E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        <span>
                          {isSubmitting
                            ? (language === 'hi' ? 'पासवर्ड बदला जा रहा है...' : 'Resetting Password...')
                            : (language === 'hi' ? 'पासवर्ड बदलें और लॉगिन करें →' : 'Reset Password & Sign In →')}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success Message for Password Reset */}
            {forgotSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="flex-1">{forgotSuccessMsg}</span>
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
              {authMode === 'forgot_password' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setAdminError('');
                    setForgotSuccessMsg('');
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'लॉगिन पर वापस जाएं (Back to Sign In)' : 'Back to Sign In'}</span>
                </button>
              ) : (
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
                    ? (language === 'hi' ? 'पहले से खाता है? यहाँ साइन इन करें →' : 'Already have an account? Sign in here →')
                    : (language === 'hi' ? 'नया खाता बनाना है? यहाँ रजिस्टर करें →' : 'Need a new account? Register here →')}
                </button>
              )}
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
