import React from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  Bell, 
  CheckCheck, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    currentUser,
    notifications, 
    markNotificationRead, 
    clearNotifications, 
    setActiveTab, 
    setActiveTrackingOrderId,
    navigateBack
  } = useAgri();

  const userNotifications = notifications.filter(n => 
    (!n.recipientId || n.recipientId === currentUser?.id) &&
    (!n.recipientRole || n.recipientRole === currentUser?.role)
  );

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

  const handleAction = (notif: any) => {
    markNotificationRead(notif.id);
    if (notif.orderId) {
      setActiveTrackingOrderId(notif.orderId);
      setActiveTab('track_delivery');
    } else if (notif.linkTab) {
      setActiveTab(notif.linkTab);
    }
  };

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={navigateBack}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-emerald-600" />
              Supply Chain Notifications & Real-Time Alerts
            </h1>
            <p className="text-xs text-slate-500">
              Instant updates on bids, order placements, weighbridge receipts, lab grading, and escrow payouts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {unreadCount} New Alerts
            </span>
          )}
          <button
            onClick={clearNotifications}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {userNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft space-y-3">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-lg">No Notifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Supply chain status updates and escrow payment notifications will appear here.
            </p>
          </div>
        ) : (
          userNotifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => handleAction(notif)}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              notif.read
                ? 'bg-white border-slate-100 shadow-soft text-slate-700 hover:border-slate-300'
                : 'bg-emerald-50/60 border-emerald-300 shadow-sm text-slate-900 ring-1 ring-emerald-400/20'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${notif.read ? 'bg-slate-100' : 'bg-white shadow-sm ring-1 ring-emerald-200'}`}>
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{notif.title}</span>
                    {!notif.read && (
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold uppercase">
                        New
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0">{notif.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                {(notif.orderId || notif.linkTab) && (
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                    <span>Open Consignment Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
