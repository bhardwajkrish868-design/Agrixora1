import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  X, 
  Loader2, 
  Copy, 
  ShieldCheck, 
  Server, 
  Wifi, 
  RefreshCw,
  HelpCircle,
  HardDrive,
  Zap,
  Lock,
  ArrowRight,
  DatabaseZap
} from 'lucide-react';
import { useAgri } from '../context/AgriContext';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({ isOpen, onClose }) => {
  const { registeredUsers, listings, orders, notifications, activityHistory } = useAgri();

  const [activeTab, setActiveTab] = useState<'turso' | 'mongo'>('turso');

  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    provider: string;
    database: string;
    maskedUri: string;
    tursoConnected?: boolean;
    mongoConnected?: boolean;
    storageTier?: string;
  }>({
    connected: false,
    provider: 'local_json',
    database: 'Local farm2future_db.json',
    maskedUri: '',
    tursoConnected: false,
    mongoConnected: false,
    storageTier: 'Local Disk'
  });

  // Turso Inputs
  const [tursoUrl, setTursoUrl] = useState('');
  const [tursoToken, setTursoToken] = useState('');

  // MongoDB Input
  const [mongoUri, setMongoUri] = useState('');

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
        if (data.tursoConnected) setActiveTab('turso');
        else if (data.mongoConnected) setActiveTab('mongo');
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Turso Connect
  const handleConnectTurso = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = tursoUrl.trim();
    const authToken = tursoToken.trim();

    if (!url) {
      setMsg({ type: 'error', text: 'कृपया मान्य Turso Database URL दर्ज करें (उदा. libsql://farm2future-xxx.turso.io)।' });
      return;
    }

    setIsConnecting(true);
    setMsg(null);

    try {
      const res = await fetch('/api/db/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'turso',
          url,
          authToken
        })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ 
          type: 'success', 
          text: '🎉 Turso Cloud (9 GB SQL) से सफलतापूर्वक कनेक्ट हो गया! आपका सारा डेटा (किसान, लिस्टिंग्स, ऑर्डर्स) अब 9 GB ऑनलाइन क्लाउड में 24/7 लाइव है।' 
        });
        setTursoUrl('');
        setTursoToken('');
        fetchStatus();
      } else {
        setMsg({ 
          type: 'error', 
          text: `❌ कनेक्शन विफल: ${data.error || 'अमान्य Turso URL या Auth Token। कृपया turso.tech डैशबोर्ड से चेक करें।'}` 
        });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: `❌ सर्वर त्रुटि: ${err.message}` });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle MongoDB Connect
  const handleConnectMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    const uri = mongoUri.trim();
    if (!uri) {
      setMsg({ type: 'error', text: 'कृपया मान्य MongoDB Connection URI दर्ज करें।' });
      return;
    }

    setIsConnecting(true);
    setMsg(null);

    try {
      const res = await fetch('/api/db/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'mongo', uri })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ 
          type: 'success', 
          text: '🎉 MongoDB Atlas से सफलतापूर्वक कनेक्ट हो गया! आपका डेटा ऑनलाइन क्लाउड डेटाबेस में सिंक है।' 
        });
        setMongoUri('');
        fetchStatus();
      } else {
        setMsg({ 
          type: 'error', 
          text: `❌ कनेक्शन विफल: ${data.error || 'अमान्य URI या नेटवर्क त्रुटि। IP 0.0.0.0/0 allowed चेक करें।'}` 
        });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: `❌ सर्वर त्रुटि: ${err.message}` });
    } finally {
      setIsConnecting(false);
    }
  };

  // Trigger manual sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: registeredUsers,
          listings,
          orders
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({
          type: 'success',
          text: `✅ संपूर्ण डेटा सफलतापूर्वक सिंक हुआ! (${registeredUsers.length} उपयोगकर्ता, ${listings.length} लिस्टिंग, ${orders.length} ऑर्डर्स क्लाउड में सेव हैं)`
        });
        fetchStatus();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: `सिंक विफल: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              ☁️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Online Cloud Database</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  dbStatus.connected ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                }`}>
                  {dbStatus.connected ? 'Online Active' : 'Local Mode'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                किसी को भी लिंक देने पर ऑनलाइन क्लाउड डेटाबेस (9 GB) से डेटा लाइव रहेगा
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('turso')}
            className={`py-2 px-3.5 rounded-t-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'turso'
                ? 'bg-white text-emerald-700 border-t-2 border-x border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Turso Cloud (9 GB Free)</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[9px] font-black">
              Recommended
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mongo')}
            className={`py-2 px-3.5 rounded-t-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'mongo'
                ? 'bg-white text-emerald-700 border-t-2 border-x border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-teal-600" />
            <span>MongoDB Atlas (512 MB)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Current Status Card */}
          <div className={`p-4 rounded-2xl border ${
            dbStatus.connected 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {dbStatus.connected ? (
                  <Wifi className="w-5 h-5 text-emerald-600 animate-pulse" />
                ) : (
                  <Server className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">वर्तमान डेटाबेस प्रदाता & स्टोरेज</p>
                  <p className="text-sm font-black flex items-center gap-1.5 mt-0.5">
                    {dbStatus.database}
                    {dbStatus.connected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    📦 Quota: <span className="underline">{dbStatus.storageTier || '9 GB Cloud SQL'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {dbStatus.connected && (
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    title="Sync current data to cloud"
                  >
                    {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">सिंक करें</span>
                  </button>
                )}

                <button
                  onClick={fetchStatus}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  title="Refresh Status"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">रीफ्रेश</span>
                </button>
              </div>
            </div>

            {dbStatus.connected && dbStatus.maskedUri && (
              <p className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 p-2 rounded-xl mt-3 border border-emerald-200/80 break-all">
                🔒 Connected URI: {dbStatus.maskedUri}
              </p>
            )}
          </div>

          {/* Alert Message */}
          {msg && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in ${
              msg.type === 'success' 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                : 'bg-rose-50 text-rose-900 border border-rose-300'
            }`}>
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="leading-relaxed">{msg.text}</div>
            </div>
          )}

          {/* Tab 1: Turso Cloud (9 GB) */}
          {activeTab === 'turso' && (
            <form onSubmit={handleConnectTurso} className="space-y-3">
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-black text-emerald-950 flex items-center gap-1">
                    <DatabaseZap className="w-4 h-4 text-emerald-700" />
                    Turso Cloud 9 GB Free SQL Database
                  </span>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    SQLite Cloud (LibSQL) - 9,000 MB फ्री स्टोरेज + अल्ट्रा फास्ट लैटेंसी
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                  9 GB Free
                </span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  1. Turso Database URL
                </label>
                <input
                  type="text"
                  value={tursoUrl}
                  onChange={e => setTursoUrl(e.target.value)}
                  placeholder="libsql://farm2future-yourname.turso.io"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-xs font-mono text-slate-800 placeholder-slate-400 bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  2. Turso Auth Token
                </label>
                <textarea
                  value={tursoToken}
                  onChange={e => setTursoToken(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-xs font-mono text-slate-800 placeholder-slate-400 bg-white transition-all resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 क्रेडेंशियल्स आपके प्रोजेक्ट के <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-bold">.env</code> में सुरक्षित रूप से सेव हो जाएंगे।
                </p>
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Turso Cloud (9 GB) से कनेक्ट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>{dbStatus.tursoConnected ? 'Turso Cloud क्रेडेंशियल्स अपडेट करें' : '🚀 Turso Cloud (9 GB) से कनेक्ट करें'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: MongoDB Atlas (512 MB) */}
          {activeTab === 'mongo' && (
            <form onSubmit={handleConnectMongo} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  MongoDB Atlas Cloud Connection String (URI)
                </label>
                <textarea
                  value={mongoUri}
                  onChange={e => setMongoUri(e.target.value)}
                  placeholder="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/farm2future?retryWrites=true&w=majority"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-xs font-mono text-slate-800 placeholder-slate-400 bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>MongoDB Atlas से कनेक्ट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>MongoDB Atlas से कनेक्ट करें</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step-by-Step 2-Minute Guide for Turso */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>{activeTab === 'turso' ? 'फ्री Turso 9 GB डेटाबेस कैसे बनाएं? (2 मिनट की गाइड)' : 'फ्री MongoDB Atlas डेटाबेस कैसे बनाएं?'}</span>
              </span>
              <span className="text-emerald-700 text-xs font-bold">
                {showGuide ? 'छिपाएं ▲' : 'देखें ▼'}
              </span>
            </button>

            {showGuide && activeTab === 'turso' && (
              <div className="p-4 bg-white text-xs text-slate-600 space-y-2.5 border-t border-slate-200">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p>
                    <a href="https://turso.tech" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                      turso.tech <ExternalLink className="w-3 h-3" />
                    </a> पर जाएं और <strong>Sign Up with Google or GitHub</strong> (100% Free Forever, 9 GB Storage)।
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <p>डैशबोर्ड में <strong>"Create Database"</strong> पर क्लिक करें और नाम रखें <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-emerald-700 font-bold">farm2future</code>.</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p>डेटाबेस पेज से <strong>Database URL</strong> (जैसे <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-emerald-700">libsql://farm2future-xxx.turso.io</code>) कॉपी करके ऊपर बॉक्स 1 में पेस्ट करें।</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                  <p><strong>"Create Token"</strong> बटन पर क्लिक करके Auth Token कॉपी करें और बॉक्स 2 में पेस्ट करके <strong>"Turso Cloud से कनेक्ट करें"</strong> दबाएं!</p>
                </div>
              </div>
            )}

            {showGuide && activeTab === 'mongo' && (
              <div className="p-4 bg-white text-xs text-slate-600 space-y-2.5 border-t border-slate-200">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p>
                    <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" rel="noreferrer" className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1">
                      mongodb.com/cloud/atlas <ExternalLink className="w-3 h-3" />
                    </a> पर जाएं और Free Account बनाएं।
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <p>M0 (Free 512 MB) क्लस्टर बनाएं और Network Access में <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">0.0.0.0/0</code> Allow करें।</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p>Connect ➔ Drivers से Connection String कॉपी करके ऊपर पेस्ट करें।</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Cloud Synchronization</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
