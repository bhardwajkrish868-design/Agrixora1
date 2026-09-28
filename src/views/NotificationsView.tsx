import React, { useState, useMemo } from 'react';
import { useAgri, filterNotificationsForUser } from '../context/AgriContext';
import { 
  Bell, 
  CheckCheck, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Inbox,
  AlertCircle
} from 'lucide-react';

type NotificationCategory = 'all' | 'unread' | 'order' | 'payment' | 'quality' | 'dispatch' | 'market';

export const NotificationsView: React.FC = () => {
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
    navigateBack,
    language
  } = useAgri();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userNotifications = useMemo(() => {
    return filterNotificationsForUser(notifications, currentUser, activeRole);
  }, [notifications, currentUser, activeRole]);

  const filteredNotifications = useMemo(() => {
    return userNotifications.filter(n => {
      // Category Filter
      if (activeCategory === 'unread' && n.read) return false;
      if (activeCategory === 'order' && n.type !== 'order') return false;
      if (activeCategory === 'payment' && n.type !== 'payment') return false;
      if (activeCategory === 'quality' && n.type !== 'quality') return false;
      if (activeCategory === 'dispatch' && n.type !== 'dispatch' && n.type !== 'delivery') return false;
      if (activeCategory === 'market' && n.type !== 'market' && n.type !== 'alert') return false;

      // Search Query
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

  const unreadCount = userNotifications.filter(n => !n.read).length;
  const orderCount = userNotifications.filter(n => n.type === 'order').length;
  const paymentCount = userNotifications.filter(n => n.type === 'payment').length;
  const logisticsCount = userNotifications.filter(n => n.type === 'dispatch' || n.type === 'delivery').length;

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
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'order':
        return { label: language === 'hi' ? 'ऑर्डर अलर्ट' : 'Order Alert', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'payment':
        return { label: language === 'hi' ? 'एस्क्रो व भुगतान' : 'Escrow & Payout', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'quality':
        return { label: language === 'hi' ? 'NABL लैब ग्रेडिंग' : 'NABL Lab Quality', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'dispatch':
      case 'delivery':
        return { label: language === 'hi' ? 'लॉजिस्टिक्स व जीपीएस' : 'Logistics & GPS', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'alert':
        return { label: language === 'hi' ? 'सिस्टम अलर्ट' : 'System Alert', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: language === 'hi' ? 'मंडी व बाज़ार' : 'Market & MSP', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
    }
  };

  const handleAction = (notif: any) => {
    markNotificationRead(notif.id);
    if (notif.orderId) {
      setActiveTrackingOrderId(notif.orderId);
      setActiveTab('track_delivery');
    } else if (notif.linkTab) {
      setActiveTab(notif.linkTab);
    }
  };

  const categories: { id: NotificationCategory; label: string; count?: number }[] = [
    { id: 'all', label: language === 'hi' ? 'सभी सूचनाएं' : 'All Alerts', count: userNotifications.length },
    { id: 'unread', label: language === 'hi' ? 'अपठित' : 'Unread', count: unreadCount },
    { id: 'order', label: language === 'hi' ? 'ऑर्डर' : 'Orders', count: orderCount },
    { id: 'payment', label: language === 'hi' ? 'भुगतान / एस्क्रो' : 'Payments', count: paymentCount },
    { id: 'dispatch', label: language === 'hi' ? 'परिवहन व जीपीएस' : 'Logistics', count: logisticsCount },
    { id: 'quality', label: language === 'hi' ? 'गुणवत्ता व लैब' : 'Lab & QC' },
    { id: 'market', label: language === 'hi' ? 'मंडी भाव व नीतियां' : 'Market & MSP' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              type="button"
              onClick={navigateBack}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              title={language === 'hi' ? 'वापस जाएँ' : 'Go Back'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Bell className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                  {language === 'hi' ? 'सप्लाई चेन सूचनाएं एवं रीयल-टाइम अलर्ट' : 'Supply Chain Notifications & Live Alerts'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                {language === 'hi' 
                  ? 'अग्रिम खरीद ऑर्डर, धर्मकांटा आवक, NABL लैब ग्रेडिंग, रीफर जीपीएस और बैंक एस्क्रो भुगतान के ताज़ा संदेश।'
                  : 'Instant updates on advance bids, weighbridge intake, NABL lab certificates, GPS dispatch, and direct escrow bank payouts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                title={language === 'hi' ? 'सभी को पढ़ा हुआ चिह्नित करें' : 'Mark all as read'}
              >
                <CheckCheck className="w-4 h-4 text-emerald-700" />
                <span>{language === 'hi' ? 'सभी पढ़ा हुआ करें' : 'Mark All Read'}</span>
              </button>
            )}

            {userNotifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(language === 'hi' ? 'क्या आप इस रोल की सभी सूचनाएं हटाना चाहते हैं?' : 'Are you sure you want to clear all notifications for this role?')) {
                    clearAllNotifications();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                title={language === 'hi' ? 'सभी सूचनाएं हटाएं' : 'Clear all notifications'}
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{language === 'hi' ? 'सभी साफ़ करें' : 'Clear All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">{userNotifications.length}</div>
              <div className="text-[11px] font-medium text-slate-500">{language === 'hi' ? 'कुल सूचनाएं' : 'Total Alerts'}</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold text-amber-700">{unreadCount}</div>
              <div className="text-[11px] font-medium text-slate-500">{language === 'hi' ? 'अपठित संदेश' : 'Unread'}</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">{orderCount}</div>
              <div className="text-[11px] font-medium text-slate-500">{language === 'hi' ? 'ऑर्डर अलर्ट' : 'Orders'}</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">{paymentCount}</div>
              <div className="text-[11px] font-medium text-slate-500">{language === 'hi' ? 'एस्क्रो / बैंक' : 'Escrow & Bank'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'सूचनाएं खोजें (उदा: प्याज़, गेहूँ, ORD-..., एस्क्रो, ट्रक)...' : 'Search notifications by crop, keyword, or order ID (e.g. ORD-2026, Onion)...'}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium shrink-0 self-center">
            {language === 'hi' ? 'परिणाम:' : 'Showing:'} <span className="font-bold text-slate-800">{filteredNotifications.length}</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent'
              }`}
            >
              <span>{cat.label}</span>
              {cat.count !== undefined && cat.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Cards Stream */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft space-y-3">
            <Bell className="w-14 h-14 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-lg">
              {language === 'hi' ? 'कोई सूचना नहीं मिली' : 'No Notifications Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? (language === 'hi' ? 'आपकी खोज के अनुरूप कोई परिणाम नहीं मिला। कृपया अन्य शब्द आज़माएं।' : 'No matches for current search criteria. Try clearing the search query.')
                : (language === 'hi' ? 'फसल बिक्री, नीलामी, लैब रिपोर्ट और बैंक भुगतान से जुड़े सभी अलर्ट यहां दिखाई देंगे।' : 'Supply chain status updates and escrow payment notifications will appear here.')}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'सर्च फ़िल्टर साफ़ करें' : 'Reset Search'}
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map(notif => {
            const badge = getTypeBadge(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => handleAction(notif)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative group ${
                  notif.read
                    ? 'bg-white border-slate-200 shadow-soft text-slate-700 hover:border-emerald-300 hover:shadow-md'
                    : 'bg-emerald-50/70 border-emerald-300 shadow-sm text-slate-900 ring-2 ring-emerald-400/20 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Leading Icon Box */}
                  <div className={`p-3.5 rounded-2xl shrink-0 ${
                    notif.read 
                      ? 'bg-slate-100 border border-slate-200' 
                      : 'bg-white shadow-sm ring-1 ring-emerald-300 border border-emerald-200'
                  }`}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{notif.title}</span>
                          {!notif.read && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                              {language === 'hi' ? 'नया' : 'New'}
                            </span>
                          )}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-slate-400">{notif.timestamp}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title={language === 'hi' ? 'हटाएं' : 'Dismiss notification'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {notif.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                      {notif.orderId && (
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {language === 'hi' ? 'ऑर्डर:' : 'Order:'} {notif.orderId}
                        </span>
                      )}

                      {(notif.orderId || notif.linkTab) && (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 ml-auto">
                          <span>
                            {notif.orderId 
                              ? (language === 'hi' ? 'खेप ट्रैक करें' : 'Track Consignment')
                              : (language === 'hi' ? 'विवरण खोलें' : 'Open Details')}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
