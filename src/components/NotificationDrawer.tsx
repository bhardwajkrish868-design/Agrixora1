import React, { useState, useMemo } from 'react';
import { useAgri, filterNotificationsForUser } from '../context/AgriContext';
import { 
  X, 
  CheckCheck, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Bell,
  ArrowRight,
  Trash2,
  Search,
  Maximize2,
  SlidersHorizontal
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationCategory = 'all' | 'unread' | 'order' | 'payment' | 'dispatch' | 'quality';

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    activeRole,
    notifications, 
    markNotificationRead, 
    clearNotifications, 
    clearAllNotifications, 
    deleteNotification, 
    setActiveTab, 
    setActiveTrackingOrderId,
    language 
  } = useAgri();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userNotifications = useMemo(() => {
    return filterNotificationsForUser(notifications, currentUser, activeRole);
  }, [notifications, currentUser, activeRole]);

  const filteredNotifications = useMemo(() => {
    return userNotifications.filter(n => {
      // Category filter
      if (activeCategory === 'unread' && n.read) return false;
      if (activeCategory === 'order' && n.type !== 'order') return false;
      if (activeCategory === 'payment' && n.type !== 'payment') return false;
      if (activeCategory === 'dispatch' && n.type !== 'dispatch' && n.type !== 'delivery') return false;
      if (activeCategory === 'quality' && n.type !== 'quality') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = n.title?.toLowerCase().includes(query);
        const msgMatch = n.message?.toLowerCase().includes(query);
        const orderMatch = n.orderId?.toLowerCase().includes(query);
        return titleMatch || msgMatch || orderMatch;
      }

      return true;
    });
  }, [userNotifications, activeCategory, searchQuery]);

  if (!isOpen) return null;

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'payment':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case 'quality':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'dispatch':
      case 'delivery':
        return <Truck className="w-4 h-4 text-amber-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'order':
        return { label: language === 'hi' ? 'ऑर्डर' : 'Order', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'payment':
        return { label: language === 'hi' ? 'भुगतान / एस्क्रो' : 'Payment', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'quality':
        return { label: language === 'hi' ? 'NABL लैब' : 'Quality Lab', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'dispatch':
      case 'delivery':
        return { label: language === 'hi' ? 'लॉजिस्टिक्स' : 'Logistics', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: language === 'hi' ? 'अलर्ट' : 'Alert', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const handleClick = (notif: any) => {
    markNotificationRead(notif.id);
    if (notif.orderId) {
      setActiveTrackingOrderId(notif.orderId);
      setActiveTab('track_delivery');
    } else if (notif.linkTab) {
      setActiveTab(notif.linkTab);
    }
    onClose();
  };

  const filterTabs: { id: NotificationCategory; label: string; count?: number }[] = [
    { id: 'all', label: language === 'hi' ? 'सभी' : 'All', count: userNotifications.length },
    { id: 'unread', label: language === 'hi' ? 'अपठित' : 'Unread', count: unreadCount },
    { id: 'order', label: language === 'hi' ? 'ऑर्डर' : 'Orders' },
    { id: 'payment', label: language === 'hi' ? 'भुगतान' : 'Payments' },
    { id: 'dispatch', label: language === 'hi' ? 'परिवहन' : 'Logistics' },
    { id: 'quality', label: language === 'hi' ? 'लैब व गुणवत्ता' : 'Quality' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-emerald-850 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 shadow-xs">
                <Bell className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  {language === 'hi' ? 'लाइव सूचनाएं एवं अलर्ट' : 'Live Notifications'}
                </h3>
                <p className="text-[11px] text-emerald-200">
                  {language === 'hi' ? 'सप्लाई चेन व व्यापार की ताज़ा अपडेट्स' : 'Instant updates across your supply chain'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('notifications');
                  onClose();
                }}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                title={language === 'hi' ? 'पूर्ण स्क्रीन में देखें' : 'View Full Screen'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                title={language === 'hi' ? 'बंद करें' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'सूचनाएं खोजें (फसल, ऑर्डर ID, भुगतान)...' : 'Search alerts, crops, or order IDs...'}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                    activeCategory === tab.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      activeCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 text-[11px]">
              {unreadCount} {language === 'hi' ? 'अपठित' : 'Unread'} • {filteredNotifications.length} {language === 'hi' ? 'दिख रहे हैं' : 'Showing'}
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer"
                  title={language === 'hi' ? 'सभी को पढ़ा हुआ चिह्नित करें' : 'Mark all as read'}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'सभी पढ़ें' : 'Mark read'}</span>
                </button>
              )}
              {userNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === 'hi' ? 'क्या आप सभी सूचनाएं साफ़ करना चाहते हैं?' : 'Clear all notifications for this role?')) {
                      clearAllNotifications();
                    }
                  }}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold text-[11px] transition-colors cursor-pointer"
                  title={language === 'hi' ? 'सभी सूचनाएं हटाएं' : 'Clear all notifications'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'सभी हटाएं' : 'Clear All'}</span>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-25" />
                <p className="font-bold text-slate-700 text-sm">
                  {language === 'hi' ? 'कोई सूचना नहीं मिली' : 'No notifications found'}
                </p>
                <p className="text-xs mt-1 text-slate-500 max-w-xs mx-auto">
                  {searchQuery 
                    ? (language === 'hi' ? 'खोज के अनुसार कोई परिणाम नहीं मिला।' : 'Try different keywords or clear filters.')
                    : (language === 'hi' ? 'ऑर्डर, भुगतान और डिस्पैच अलर्ट यहां प्रदर्शित होंगे।' : 'Live order, escrow, and dispatch events will show up here.')}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {language === 'hi' ? 'फ़िल्टर हटाएं' : 'Clear Filter'}
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const badge = getTypeBadge(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      n.read 
                        ? 'bg-white border-slate-200/90 text-slate-700 hover:border-emerald-200 hover:bg-slate-50/80' 
                        : 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${n.read ? 'bg-slate-100' : 'bg-white shadow-xs border border-emerald-200'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border shrink-0 ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold truncate text-slate-900">
                              {n.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title={language === 'hi' ? 'हटाएं' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-medium">{n.timestamp}</span>
                          {(n.orderId || n.linkTab) && (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5 group-hover:underline">
                              <span>{language === 'hi' ? 'विवरण देखें' : 'View details'}</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab('notifications');
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'hi' ? 'सभी सूचनाएं पूर्ण स्क्रीन में देखें' : 'Open Full Notifications Center'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
