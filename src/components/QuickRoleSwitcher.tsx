import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { 
  Sprout, 
  ShoppingCart, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  LogOut, 
  Edit3, 
  Lock, 
  X, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  KeyRound
} from 'lucide-react';

export const QuickRoleSwitcher: React.FC = () => {
  const { 
    activeRole, 
    switchRole, 
    currentUser, 
    setIsAuthModalOpen, 
    openAuthModal,
    logoutUser,
    isAdminAuthenticated,
    verifyAdminPasskey,
    lockAdminConsole
  } = useAgri();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('admin');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const roles: { role: UserRole; label: string; icon: React.FC<{ className?: string }>; desc: string; protected?: boolean }[] = [
    {
      role: 'farmer',
      label: 'Farmer',
      icon: Sprout,
      desc: 'Sell Crops & Track Payouts'
    },
    {
      role: 'buyer',
      label: 'Buyer / Retailer',
      icon: ShoppingCart,
      desc: 'Browse Market & Track Orders'
    },
    {
      role: 'collection_centre',
      label: 'Hub (Team)',
      icon: Building2,
      desc: 'QC, Weight & Dispatch',
      protected: true
    },
    {
      role: 'admin',
      label: 'Admin (Team)',
      icon: ShieldCheck,
      desc: 'Oversight & Escrow Analytics',
      protected: true
    }
  ];

  const handleRoleClick = (role: UserRole) => {
    if (role === 'admin' || role === 'collection_centre') {
      if (isAdminAuthenticated) {
        switchRole(role);
      } else {
        setTargetRole(role);
        setPasskeyInput('');
        setErrorMsg('');
        setIsAdminModalOpen(true);
      }
    } else {
      switchRole(role);
    }
  };

  const handleVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = verifyAdminPasskey(passkeyInput);
    if (isValid) {
      setIsAdminModalOpen(false);
      setPasskeyInput('');
      setErrorMsg('');
      switchRole(targetRole);
    } else {
      setErrorMsg('❌ Access Denied: Incorrect Team Master Passkey (Krish0386).');
    }
  };

  return (
    <>
      <div className="bg-slate-900 text-white px-4 py-2 text-xs border-b border-slate-800 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Active logged-in user information */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Account:</span>
              <strong className="text-white ml-0.5">{currentUser?.name || 'Guest'}</strong>
            </div>
            
            <button
              onClick={() => openAuthModal(activeRole, 'login')}
              className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
              title="Enter your custom name, location, and details"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
              <span>Change Details / New User</span>
            </button>
          </div>

          {/* Right: Role Switcher & Logout */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {roles.map(({ role, label, icon: Icon, protected: isProt }) => {
              const isActive = activeRole === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleClick(role)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-white/30 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={isProt && !isAdminAuthenticated ? 'Requires Master Admin Security Key' : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {isProt && !isAdminAuthenticated && (
                    <Lock className="w-2.5 h-2.5 text-amber-400 ml-0.5" />
                  )}
                </button>
              );
            })}

            {activeRole === 'admin' && (
              <button
                onClick={lockAdminConsole}
                className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors border border-purple-500/30 cursor-pointer"
                title="Lock Admin Console"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Console</span>
              </button>
            )}

            <button
              onClick={logoutUser}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors border border-rose-500/30 cursor-pointer"
              title="Log out from current account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Security Authorization Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-purple-200 z-50 text-slate-900 animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 relative">
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-display">
                    {targetRole === 'collection_centre' ? 'Collection Hub Operator Access' : 'Government / Admin Access'}
                  </h3>
                  <p className="text-[11px] text-purple-200">Restricted to authorized Farm2Future team members</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleVerifyAdmin} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[11px]">Team Security Verification Required:</strong>
                  <p className="text-[10px] text-amber-800">
                    Enter the master team security passkey to access internal {targetRole === 'collection_centre' ? 'hub operations & weighbridge dispatch' : 'national agri-analytics, MSP controls & escrow audit matrix'}.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                  Master Team Passkey (अधिकृत टीम पासकी) *
                </label>
                <div className="relative">
                  <input
                    type={showPasskey ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Enter Secret Passkey (Default: Krish0386)"
                    value={passkeyInput}
                    onChange={e => {
                      setPasskeyInput(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-purple-300 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Default Master Key:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPasskeyInput('Krish0386');
                    setErrorMsg('');
                  }}
                  className="text-purple-700 font-bold hover:underline cursor-pointer"
                >
                  Krish0386
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold shadow-md shadow-purple-700/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verify & Enter →</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
