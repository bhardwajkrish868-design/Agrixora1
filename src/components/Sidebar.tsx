import React from 'react';
import { useAgri } from '../context/AgriContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Layers, 
  ShoppingBag, 
  TrendingUp, 
  Wallet, 
  Bell, 
  User, 
  Store, 
  Truck, 
  Receipt, 
  PackageSearch, 
  ShieldCheck, 
  Warehouse, 
  SendHorizontal, 
  Users, 
  Boxes, 
  Building2, 
  CreditCard, 
  BarChart3,
  PhoneCall,
  Lock,
  ChevronRight,
  Database
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeRole, activeTab, setActiveTab, listings, orders, notifications, currentUser, isFarmerOrder, isFarmerListing, activityHistory, vehicles, bulkDemands } = useAgri();

  // Role based navigation configuration
  const getNavItems = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'bulk_pooling', label: '📥 Receive Bulk Orders', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'add_produce', label: 'Add Produce', icon: PlusCircle },
          { id: 'my_listings', label: 'My Listings', icon: Layers, badge: listings.filter(l => isFarmerListing(l, currentUser)).length },
          { id: 'orders', label: 'Orders Received', icon: ShoppingBag, badge: orders.filter(o => isFarmerOrder(o, currentUser)).length, highlight: orders.some(o => isFarmerOrder(o, currentUser) && o.currentStage === 'order_placed') },
          { id: 'transport_services', label: 'State Transport', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'market_prices', label: 'Market Prices', icon: TrendingUp },
          { id: 'earnings', label: 'Earnings', icon: Wallet },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.read && (n.recipientRole === 'farmer' || n.recipientRole === 'all')).length },
          { id: 'profile', label: 'Profile', icon: User }
        ];

      case 'buyer':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'bulk_pooling', label: '⚡ 4-Mo Bulk Orders', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'marketplace', label: 'Marketplace', icon: Store, badge: listings.filter(l => l.status === 'Active').length },
          { id: 'my_orders', label: 'My Orders', icon: ShoppingBag, badge: orders.length },
          { id: 'track_delivery', label: 'Track Delivery', icon: Truck, highlight: true },
          { id: 'transport_services', label: 'State Transport Fleet', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'profile', label: 'Profile', icon: User }
        ];

      case 'collection_centre':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'bulk_pooling', label: 'Bulk Hub Aggregation', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'incoming', label: 'Incoming Produce', icon: PackageSearch, badge: orders.filter(o => o.currentStage === 'order_placed' || o.currentStage === 'collected_at_hub').length },
          { id: 'verification', label: 'Verification & QC', icon: ShieldCheck },
          { id: 'storage', label: 'Storage Status', icon: Warehouse },
          { id: 'dispatch', label: 'Dispatch Fleet', icon: SendHorizontal },
          { id: 'fleet', label: 'Vehicle Registry', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'transport_services', label: 'State Transport Directory', icon: Truck },
          { id: 'profile', label: 'Profile', icon: User }
        ];

      case 'admin':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'users', label: 'Users & Stakeholders', icon: Users },
          { id: 'listings', label: 'All Listings', icon: Boxes, badge: listings.length },
          { id: 'bulk_pooling', label: '500T+ Bulk Demand Pools', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'orders', label: 'Orders Monitoring', icon: ShoppingBag, badge: orders.length },
          { id: 'collection_centres', label: 'Collection Hubs', icon: Building2 },
          { id: 'vehicles', label: 'Fleet & Vehicles', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'transport_services', label: 'State Transport Network', icon: Truck },
          { id: 'transactions', label: 'Escrow & Txns', icon: Receipt },
          { id: 'database', label: 'Database & Audit Logs', icon: Database, badge: activityHistory?.length || 0 },
          { id: 'analytics', label: 'Supply Analytics', icon: BarChart3 },
          { id: 'profile', label: 'Admin Profile & KYC', icon: User }
        ];
    }
  };

  const navItems = getNavItems(activeRole);

  const roleThemeBadge = {
    farmer: { text: 'Farmer Portal', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    buyer: { text: 'Buyer Portal', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
    collection_centre: { text: 'Collection Hub Bay', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    admin: { text: 'Admin Console', bg: 'bg-slate-100 text-slate-800 border-slate-300' }
  }[activeRole];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 lg:top-16 inset-y-0 left-0 z-40
        w-64 bg-white border-r border-slate-200 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        h-screen lg:h-[calc(100vh-4rem)]
      `}>
        {/* Navigation Links */}
        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {/* Active Role Indicator */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Workspace</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleThemeBadge.bg}`}>
              {roleThemeBadge.text}
            </span>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20' 
                      : item.highlight
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${isActive 
                        ? 'bg-white text-emerald-800' 
                        : 'bg-slate-100 text-slate-700'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Trust & Helpline Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-emerald-50/90 rounded-2xl p-3 border border-emerald-200 text-emerald-950">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[11px] font-bold">Escrow Guarantee</span>
            </div>
            <p className="text-[10px] text-emerald-800 leading-tight">
              100% payout security. Funds released only upon delivery verification.
            </p>
            <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] font-semibold text-emerald-900">
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-emerald-600" /> Kisan Helpline
              </span>
              <span>1800-180-1551</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
