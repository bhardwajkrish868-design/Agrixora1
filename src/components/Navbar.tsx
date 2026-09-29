import React, { useState } from 'react';
import { useAgri, filterNotificationsForUser } from '../context/AgriContext';
import { 
  Sprout, 
  Search, 
  Bell, 
  Globe, 
  User as UserIcon, 
  ChevronDown, 
  ShieldCheck, 
  Menu, 
  LogOut,
  Sparkles,
  TrendingUp,
  ArrowLeft,
  Cloud,
  Landmark
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { CloudDatabaseModal } from './CloudDatabaseModal';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { 
    currentUser, 
    activeRole, 
    notifications, 
    language, 
    setLanguage, 
    setIsAuthModalOpen,
    openAuthModal,
    setActiveTab,
    navigateBack,
    canGoBack,
    mandiPrices,
    logoutUser,
    openGateway
  } = useAgri();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCloudDbOpen, setIsCloudDbOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{
    connected: boolean;
    tursoConnected: boolean;
    mongoConnected: boolean;
  }>({
    connected: false,
    tursoConnected: false,
    mongoConnected: false
  });

  React.useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/db/status');
        if (res.ok) {
          const data = await res.json();
          setCloudStatus({
            connected: Boolean(data.connected),
            tursoConnected: Boolean(data.tursoConnected),
            mongoConnected: Boolean(data.mongoConnected)
          });
        }
      } catch (_) {}
    };
    checkDb();
    const interval = setInterval(checkDb, 8000);
    return () => clearInterval(interval);
  }, []);

  const userNotifications = filterNotificationsForUser(notifications, currentUser, activeRole);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const roleLabel = {
    farmer: { title: 'Verified Farmer', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    buyer: { title: 'Institutional Buyer', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
    collection_centre: { title: 'Hub Operator', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    admin: { title: 'Govt Administrator', badge: 'bg-slate-100 text-slate-800 border-slate-300' },
  }[activeRole];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Back Button, Mobile Toggle & Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Global Navigation Back Button */}
              {canGoBack && (
                <button
                  type="button"
                  onClick={navigateBack}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200/90 text-slate-700 text-xs font-bold transition-all shadow-xs group cursor-pointer"
                  title="Go Back / वापस जाएँ"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-emerald-700 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="inline font-bold">{language === 'hi' ? 'वापस' : 'Back'}</span>
                </button>
              )}

              {/* Return to Main Welcome Gateway */}
              <button
                type="button"
                onClick={openGateway}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 border border-emerald-200/90 text-emerald-800 text-xs font-bold transition-all shadow-xs group cursor-pointer"
                title="Return to Main Welcome Gateway / मुख्य गेटवे पर जाएं"
              >
                <span className="text-sm">🏠</span>
                <span className="hidden sm:inline font-bold">{language === 'hi' ? 'गेटवे' : 'Gateway'}</span>
              </button>

              <button
                type="button"
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div 
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                      Agri<span className="text-emerald-700">xora</span>
                    </span>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      v2.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                    {language === 'hi' ? 'स्मार्ट मार्केटप्लेस और पारदर्शी आपूर्ति श्रृंखला' : 'Smart Marketplace & Transparent Supply Chain'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Language, Notifications, User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Selector Dual Switch */}
              <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="Switch to English"
                >
                  <Globe className={`w-3.5 h-3.5 ${language === 'en' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'hi'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="हिंदी में बदलें"
                >
                  <span>हिन्दी</span>
                </button>
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                title={language === 'hi' ? 'सूचनाएं एवं अलर्ट' : 'Notifications & Alerts'}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Pill & Actions */}
              <div className="flex items-center gap-2">

                {/* 💼 Dedicated Standalone AI Business & Finance Advisory Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('rural_advisory')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 hover:from-amber-600 hover:to-teal-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-105 cursor-pointer border border-amber-300/40 relative group"
                  title="AI Rural Business Advisory & Financial Structuring (ग्रामीण बिज़नेस व सब्सिडी AI)"
                >
                  <Landmark className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                  <span className="hidden md:inline font-bold">
                    {language === 'hi' ? '💼 बिज़नेस व सब्सिडी AI' : '💼 Business & Finance AI'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 ml-0.5 shadow-xs">
                    35% GRANT
                  </span>
                </button>

                {/* 1-Click Quick Login / Persona Switcher Trigger */}
                <button
                  type="button"
                  onClick={() => openAuthModal(activeRole === 'farmer' ? 'buyer' : 'farmer', 'login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
                  title="Switch Role / Login (भूमिका बदलें या लॉगिन करें)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">{language === 'hi' ? '⚡ भूमिका बदलें / लॉगिन' : '⚡ Switch Role'}</span>
                </button>

                {currentUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={logoutUser}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Lock Admin Console"
                  >
                    <span>{language === 'hi' ? '🔒 कंसोल लॉक करें' : '🔒 Lock Console'}</span>
                  </button>
                )}

                {/* Direct Normal Logout Button */}
                <button
                  type="button"
                  onClick={logoutUser}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Logout from Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser?.name || 'User'}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/20"
                    />
                    <div className="text-left hidden md:block">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 leading-none">{currentUser?.name || 'User'}</span>
                        {currentUser?.verified && (
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        )}
                      </div>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border ${roleLabel.badge}`}>
                        {roleLabel.title}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="fixed inset-0 z-40" 
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900">{currentUser?.name || 'User'}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || ''}</p>
                          <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                            📍 {currentUser?.location || 'India'}, {currentUser?.state || ''}
                          </p>
                          {currentUser?.aadhaarNumber && (
                            <p className="text-[10px] text-emerald-800 font-mono font-bold mt-1 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>UIDAI: {currentUser.aadhaarNumber}</span>
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 cursor-pointer"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Manage Profile & KYC</span>
                        </button>

                        <button
                          onClick={() => {
                            openAuthModal(activeRole === 'farmer' ? 'buyer' : 'farmer', 'login');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Switch Stakeholder Account</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logoutUser();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout / Exit to Gateway</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Notifications */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* ☁️ MongoDB Cloud Database Configuration & Connection Modal */}
      <CloudDatabaseModal isOpen={isCloudDbOpen} onClose={() => setIsCloudDbOpen(false)} />
    </>
  );
};
