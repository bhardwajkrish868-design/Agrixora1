import React from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  X, 
  CheckCheck, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Bell,
  ArrowRight
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser, notifications, markNotificationRead, clearNotifications, setActiveTab, setActiveTrackingOrderId } = useAgri();

  if (!isOpen) return null;

  const userNotifications = notifications.filter(n => 
    (!n.recipientId || n.recipientId === currentUser?.id) &&
    (!n.recipientRole || n.recipientRole === currentUser?.role)
  );

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10">
                <Bell className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Live Notifications</h3>
                <p className="text-xs text-emerald-200">Instant updates across your supply chain</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              {userNotifications.filter(n => !n.read).length} Unread Updates
            </span>
            <button
              onClick={clearNotifications}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {userNotifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-slate-600">No notifications yet</p>
                <p className="text-xs mt-1">Platform alerts and order events will show up here.</p>
              </div>
            ) : (
              userNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    n.read 
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                      : 'bg-emerald-50/70 border-emerald-200 text-slate-900 shadow-xs hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${n.read ? 'bg-slate-100' : 'bg-white shadow-xs'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-sm font-semibold truncate text-slate-900">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{n.timestamp}</span>
                        {(n.orderId || n.linkTab) && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5 hover:underline">
                            View details <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
