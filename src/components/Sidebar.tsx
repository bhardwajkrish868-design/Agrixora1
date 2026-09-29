import React from 'react';
import { useAgri, filterNotificationsForUser } from '../context/AgriContext';
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
  Database,
  Landmark,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeRole, activeTab, setActiveTab, listings, orders, notifications, currentUser, isFarmerOrder, isFarmerListing, isBuyerOrder, activityHistory, vehicles, bulkDemands, collectionHubs, language } = useAgri();

  // Role based navigation configuration
  const getNavItems = (role: UserRole) => {
    const roleUnreadNotifs = filterNotificationsForUser(notifications, currentUser, role).filter(n => !n.read).length;

    switch (role) {
      case 'farmer':
        return [
          { id: 'overview', label: language === 'hi' ? 'डैशबोर्ड' : 'Overview', icon: LayoutDashboard },
          { id: 'bulk_pooling', label: language === 'hi' ? '📥 थोक खरीद मांग' : '📥 Receive Bulk Orders', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'add_produce', label: language === 'hi' ? 'फसल जोड़ें' : 'Add Produce', icon: PlusCircle },
          { id: 'my_listings', label: language === 'hi' ? 'मेरी फसलें' : 'My Listings', icon: Layers, badge: listings.filter(l => isFarmerListing(l, currentUser)).length },
          { id: 'orders', label: language === 'hi' ? 'प्राप्त ऑर्डर' : 'Orders Received', icon: ShoppingBag, badge: orders.filter(o => isFarmerOrder(o, currentUser)).length, highlight: orders.some(o => isFarmerOrder(o, currentUser) && o.currentStage === 'order_placed') },
          { id: 'transport_services', label: language === 'hi' ? 'राज्य परिवहन' : 'State Transport', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'market_prices', label: language === 'hi' ? 'मंडी भाव' : 'Market Prices', icon: TrendingUp },
          { id: 'earnings', label: language === 'hi' ? 'मेरी कमाई' : 'Earnings', icon: Wallet },
          { id: 'notifications', label: language === 'hi' ? 'सूचनाएं' : 'Notifications', icon: Bell, badge: roleUnreadNotifs },
          { id: 'profile', label: language === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: User }
        ];

      case 'buyer':
        const buyerOrdersCount = orders.filter(o => isBuyerOrder(o, currentUser)).length;
        return [
          { id: 'overview', label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard },
          { id: 'bulk_pooling', label: language === 'hi' ? '⚡ 4-माह थोक खरीद' : '⚡ 4-Mo Bulk Orders', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'marketplace', label: language === 'hi' ? 'फसल मार्केटप्लेस' : 'Marketplace', icon: Store, badge: listings.filter(l => l.status === 'Active').length },
          { id: 'my_orders', label: language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders', icon: ShoppingBag, badge: buyerOrdersCount, highlight: orders.some(o => isBuyerOrder(o, currentUser) && o.currentStage === 'in_transit') },
          { id: 'track_delivery', label: language === 'hi' ? 'डिलीवरी ट्रैक करें' : 'Track Delivery', icon: Truck, highlight: true },
          { id: 'transport_services', label: language === 'hi' ? 'राज्य परिवहन बेड़ा' : 'State Transport Fleet', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'market_prices', label: language === 'hi' ? 'मंडी भाव व विश्लेषण' : 'Market Prices', icon: TrendingUp },
          { id: 'payments', label: language === 'hi' ? 'भुगतान व एस्क्रो' : 'Payments', icon: CreditCard },
          { id: 'notifications', label: language === 'hi' ? 'सूचनाएं' : 'Notifications', icon: Bell, badge: roleUnreadNotifs },
          { id: 'profile', label: language === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: User }
        ];

      case 'collection_centre':
        const hubIncomingCount = orders.filter(o => o.currentStage === 'order_placed' || o.currentStage === 'collected_at_hub').length;
        const hubReadyDispatchCount = orders.filter(o => o.currentStage === 'quality_verified').length;
        return [
          { id: 'overview', label: language === 'hi' ? 'हब कमांड डैशबोर्ड' : 'Hub Command Dashboard', icon: LayoutDashboard },
          { id: 'incoming', label: language === 'hi' ? 'आवक फसल (धर्मकांटा)' : 'Incoming Harvest Intake', icon: PackageSearch, badge: hubIncomingCount },
          { id: 'verification', label: language === 'hi' ? 'NABL लैब व ग्रेडिंग' : 'QC Lab & Grading', icon: ShieldCheck },
          { id: 'storage', label: language === 'hi' ? 'साइलो व कोल्ड स्टोरेज' : 'Cold Storage & Silos', icon: Warehouse },
          { id: 'dispatch', label: language === 'hi' ? 'फ्लीट डिस्पैच व रवानगी' : 'Fleet Dispatch Manager', icon: SendHorizontal, badge: hubReadyDispatchCount },
          { id: 'fleet', label: language === 'hi' ? 'वाहन व चालक रजिस्ट्री' : 'Fleet & Drivers Registry', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'collection_centres', label: language === 'hi' ? 'अखिल भारतीय FCI केंद्र' : 'All-India FCI Centres', icon: Building2, badge: collectionHubs.length },
          { id: 'bulk_pooling', label: language === 'hi' ? '⚡ थोक मांग एकत्रीकरण' : '⚡ Bulk Hub Pooling', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'transport_services', label: language === 'hi' ? 'राज्य परिवहन नेटवर्क' : 'State Transport Network', icon: Truck },
          { id: 'notifications', label: language === 'hi' ? 'सूचनाएं एवं अलर्ट' : 'Notifications & Alerts', icon: Bell, badge: roleUnreadNotifs },
          { id: 'profile', label: language === 'hi' ? 'हब प्रोफ़ाइल' : 'Hub Profile', icon: User }
        ];

      case 'admin':
        return [
          { id: 'overview', label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard },
          { id: 'users', label: language === 'hi' ? 'उपयोगकर्ता व हितधारक' : 'Users & Stakeholders', icon: Users },
          { id: 'listings', label: language === 'hi' ? 'सभी फसल लिस्टिंग' : 'All Listings', icon: Boxes, badge: listings.length },
          { id: 'bulk_pooling', label: language === 'hi' ? '500T+ थोक मांग पूल' : '500T+ Bulk Demand Pools', icon: Boxes, badge: bulkDemands?.length || 0, highlight: true },
          { id: 'orders', label: language === 'hi' ? 'ऑर्डर निगरानी' : 'Orders Monitoring', icon: ShoppingBag, badge: orders.length },
          { id: 'collection_centres', label: language === 'hi' ? 'कलेक्शन हब केंद्र' : 'Collection Hubs', icon: Building2 },
          { id: 'vehicles', label: language === 'hi' ? 'फ्लीट व वाहन' : 'Fleet & Vehicles', icon: Truck, badge: vehicles?.length || 0 },
          { id: 'transport_services', label: language === 'hi' ? 'राज्य परिवहन नेटवर्क' : 'State Transport Network', icon: Truck },
          { id: 'transactions', label: language === 'hi' ? 'एस्क्रो एवं लेनदेन' : 'Escrow & Txns', icon: Receipt },
          { id: 'database', label: language === 'hi' ? 'डेटाबेस व ऑडिट लॉग' : 'Database & Audit Logs', icon: Database, badge: activityHistory?.length || 0 },
          { id: 'analytics', label: language === 'hi' ? 'आपूर्ति विश्लेषण' : 'Supply Analytics', icon: BarChart3 },
          { id: 'notifications', label: language === 'hi' ? 'सिस्टम अलर्ट व सूचनाएं' : 'Notifications & Logs', icon: Bell, badge: roleUnreadNotifs },
          { id: 'profile', label: language === 'hi' ? 'एडमिन प्रोफ़ाइल' : 'Admin Profile & KYC', icon: User }
        ];
    }
  };

  const navItems = getNavItems(activeRole);

  const roleThemeBadge = {
    farmer: { text: language === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    buyer: { text: language === 'hi' ? 'खरीदार पोर्टल' : 'Buyer Portal', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
    collection_centre: { text: language === 'hi' ? 'कलेक्शन हब केंद्र' : 'Collection Hub Bay', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    admin: { text: language === 'hi' ? 'एडमिन कंसोल' : 'Admin Console', bg: 'bg-slate-100 text-slate-800 border-slate-300' }
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
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{language === 'hi' ? 'सक्रिय वर्कस्पेस' : 'Active Workspace'}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleThemeBadge.bg}`}>
              {roleThemeBadge.text}
            </span>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{language === 'hi' ? 'नेविगेशन' : 'Navigation'}</p>
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
              <span className="text-[11px] font-bold">{language === 'hi' ? 'एस्क्रो सुरक्षा गारंटी' : 'Escrow Guarantee'}</span>
            </div>
            <p className="text-[10px] text-emerald-800 leading-tight">
              {language === 'hi'
                ? '100% भुगतान सुरक्षा। डिलीवरी सत्यापन के बाद ही राशि सीधे बैंक खाते में भेजी जाती है।'
                : '100% payout security. Funds released only upon delivery verification.'}
            </p>
            <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] font-semibold text-emerald-900">
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-emerald-600" /> {language === 'hi' ? 'किसान हेल्पलाइन' : 'Kisan Helpline'}
              </span>
              <span>1800-180-1551</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
