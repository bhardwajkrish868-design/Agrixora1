import React, { useEffect, useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  Bell, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  TrendingUp, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { 
    latestToast, 
    dismissToast, 
    language, 
    setActiveTab, 
    setActiveTrackingOrderId 
  } = useAgri();

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!latestToast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= step) {
          clearInterval(timer);
          dismissToast();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [latestToast, dismissToast]);

  if (!latestToast) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'payment':
        return <CheckCircle2 className="w-5 h-5 text-emerald-700" />;
      case 'quality':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'dispatch':
      case 'delivery':
        return <Truck className="w-5 h-5 text-amber-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
    }
  };

  const handleClick = () => {
    if (latestToast.orderId) {
      setActiveTrackingOrderId(latestToast.orderId);
      setActiveTab('track_delivery');
    } else if (latestToast.linkTab) {
      setActiveTab(latestToast.linkTab);
    }
    dismissToast();
  };

  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[100] max-w-sm sm:max-w-md w-full animate-bounce-short">
      <div 
        onClick={handleClick}
        className="bg-white/95 backdrop-blur-md border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-4 cursor-pointer hover:shadow-emerald-900/20 hover:scale-[1.01] transition-all duration-200 relative overflow-hidden group"
      >
        {/* Animated Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-start gap-3.5">
          {/* Icon Badge */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shrink-0 mt-0.5 shadow-xs group-hover:bg-emerald-100 transition-colors">
            {getIcon(latestToast.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" />
                {language === 'hi' ? 'लाइव अलर्ट' : 'Live Alert'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {latestToast.timestamp || (language === 'hi' ? 'अभी-अभी' : 'Just now')}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug group-hover:text-emerald-700 transition-colors">
              {latestToast.title}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
              {latestToast.message}
            </p>

            {(latestToast.orderId || latestToast.linkTab) && (
              <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                <span>{language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissToast();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title={language === 'hi' ? 'बंद करें' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
