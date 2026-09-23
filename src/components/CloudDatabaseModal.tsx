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
  Users,
  Boxes,
  Truck
} from 'lucide-react';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({ isOpen, onClose }) => {
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    provider: string;
    database: string;
    maskedUri: string;
  }>({
    connected: false,
    provider: 'local_json',
    database: 'Local farm2future_db.json',
    maskedUri: ''
  });

  const [mongoUriInput, setMongoUriInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
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

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const uri = mongoUriInput.trim();
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
        body: JSON.stringify({ uri })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ 
          type: 'success', 
          text: '🎉 MongoDB Cloud Atlas से सफलतापूर्वक कनेक्ट हो गया! आपका सारा डेटा (किसान, लिस्टिंग्स, ऑर्डर्स) अब ऑनलाइन क्लाउड डेटाबेस में सिंक है।' 
        });
        setMongoUriInput('');
        fetchStatus();
      } else {
        setMsg({ 
          type: 'error', 
          text: `❌ कनेक्शन विफल: ${data.error || 'अमान्य URI या नेटवर्क त्रुटि। कृपया चेक करें कि Atlas में 0.0.0.0/0 IP allowed है।'}` 
        });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: `❌ सर्वर त्रुटि: ${err.message}` });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              ☁️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">MongoDB Cloud Database</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  dbStatus.connected ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40' : 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                }`}>
                  {dbStatus.connected ? 'Online Active' : 'Local Mode'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                किसी को भी लिंक देने पर ऑनलाइन क्लाउड डेटाबेस सिंक रहेगा
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
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">वर्तमान डेटाबेस प्रदाता</p>
                  <p className="text-sm font-black flex items-center gap-1.5 mt-0.5">
                    {dbStatus.database}
                    {dbStatus.connected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={fetchStatus}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">रीफ्रेश</span>
              </button>
            </div>

            {dbStatus.connected && dbStatus.maskedUri && (
              <p className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 p-2 rounded-xl mt-3 border border-emerald-200/80 break-all">
                🔒 URI: {dbStatus.maskedUri}
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

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                MongoDB Atlas Cloud Connection String (URI)
              </label>
              <textarea
                value={mongoUriInput}
                onChange={e => setMongoUriInput(e.target.value)}
                placeholder="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/farm2future?retryWrites=true&w=majority"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-xs font-mono text-slate-800 placeholder-slate-400 bg-white transition-all resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                💡 यह स्ट्रिंग आपके प्रोजेक्ट के <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-bold">.env</code> में भी सुरक्षित सेव हो जाएगी।
              </p>
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MongoDB Cloud से कनेक्ट हो रहा है...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>{dbStatus.connected ? 'क्लाउड कनेक्शन अपडेट करें' : 'ऑनलाइन MongoDB Cloud से कनेक्ट करें'}</span>
                </>
              )}
            </button>
          </form>

          {/* Expandable Step-by-Step Guide */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>फ्री MongoDB Atlas ऑनलाइन डेटाबेस कैसे बनाएं? (2 मिनट की गाइड)</span>
              </span>
              <span className="text-emerald-700 text-xs font-bold">
                {showGuide ? 'छिपाएं ▲' : 'देखें ▼'}
              </span>
            </button>

            {showGuide && (
              <div className="p-4 bg-white text-xs text-slate-600 space-y-2.5 border-t border-slate-200">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p>
                    <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                      mongodb.com/cloud/atlas <ExternalLink className="w-3 h-3" />
                    </a> पर जाएं और Google से 100% फ्री अकाउंट बनाएं।
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <p><strong>M0 (Free Forever)</strong> क्लस्टर चुनें और Create पर क्लिक करें।</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p><strong>Database Access</strong> में यूजरनेम और पासवर्ड (जैसे <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">farm2future</code>) बनाएं।</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                  <p><strong>Network Access</strong> में <strong>Add IP Address</strong> पर क्लिक करके <strong>Allow Access from Anywhere (<code className="bg-slate-100 px-1 py-0.2 rounded font-mono">0.0.0.0/0</code>)</strong> चुनें ताकि कोई भी व्यक्ति कहीं से भी कनेक्ट हो सके!</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">5</span>
                  <p><strong>Connect</strong> ➔ <strong>Drivers</strong> पर क्लिक करके कनेक्शन स्ट्रिंग कॉपी करें और ऊपर बॉक्स में पेस्ट कर दें!</p>
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
