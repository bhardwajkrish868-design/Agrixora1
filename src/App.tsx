import React, { useState } from 'react';
import { AgriProvider, useAgri } from './context/AgriContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';

// Farmer Views
import { FarmerDashboard } from './views/FarmerDashboard';
import { AddProduceView } from './views/AddProduceView';
import { FarmerListingsView } from './views/FarmerListingsView';
import { FarmerOrdersView } from './views/FarmerOrdersView';
import { FarmerEarningsView } from './views/FarmerEarningsView';
import { MarketPriceIntelligenceView } from './views/MarketPriceIntelligenceView';

// Buyer Views
import { BuyerDashboardView } from './views/BuyerDashboardView';
import { MarketplaceView } from './views/MarketplaceView';
import { BuyerOrdersView } from './views/BuyerOrdersView';
import { SupplyChainTracker } from './views/SupplyChainTracker';
import { BuyerPaymentsView } from './views/BuyerPaymentsView';

// Collection Centre & Admin Views
import { CollectionCentreView } from './views/CollectionCentreView';
import { AdminDashboard } from './views/AdminDashboard';
import { ProfileView } from './views/ProfileView';
import { NotificationsView } from './views/NotificationsView';
import { StateTransportDirectoryView } from './views/StateTransportDirectoryView';
import { BulkDemandPoolView } from './views/BulkDemandPoolView';
import { NotificationToast } from './components/NotificationToast';

// Entry Gateway
import { WelcomeGatewayView } from './views/WelcomeGatewayView';

import { ErrorBoundary } from './components/ErrorBoundary';

const MainLayout: React.FC = () => {
  const { activeRole, activeTab, isAuthenticated, currentUser, showWelcomeGateway } = useAgri();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If on initial open / session start / logged out, show Welcome Gateway landing screen
  if (showWelcomeGateway || !isAuthenticated || !currentUser) {
    return <WelcomeGatewayView />;
  }

  // Render view based on active role and tab
  const renderCurrentView = () => {
    // Global views accessible from anywhere
    if (activeTab === 'profile') return <ProfileView />;
    if (activeTab === 'market_prices') return <MarketPriceIntelligenceView />;
    if (activeTab === 'track_delivery') return <SupplyChainTracker />;
    if (activeTab === 'transport_services') return <StateTransportDirectoryView />;
    if (activeTab === 'bulk_pooling') return <BulkDemandPoolView />;
    if (activeTab === 'add_produce') return <AddProduceView />;
    if (activeTab === 'notifications') return <NotificationsView />;

    // Farmer Role Routing
    if (activeRole === 'farmer') {
      switch (activeTab) {
        case 'overview':
          return <FarmerDashboard />;
        case 'my_listings':
          return <FarmerListingsView />;
        case 'orders':
          return <FarmerOrdersView />;
        case 'earnings':
          return <FarmerEarningsView />;
        default:
          return <FarmerDashboard />;
      }
    }

    // Buyer Role Routing
    if (activeRole === 'buyer') {
      switch (activeTab) {
        case 'overview':
          return <BuyerDashboardView />;
        case 'marketplace':
          return <MarketplaceView />;
        case 'my_orders':
          return <BuyerOrdersView />;
        case 'payments':
          return <BuyerPaymentsView />;
        case 'market_prices':
          return <MarketPriceIntelligenceView />;
        case 'profile':
          return <ProfileView />;
        case 'track_delivery':
          return <SupplyChainTracker />;
        default:
          return <BuyerDashboardView />;
      }
    }

    // Collection Centre Routing
    if (activeRole === 'collection_centre') {
      return <CollectionCentreView />;
    }

    // Admin Routing
    if (activeRole === 'admin') {
      if (activeTab === 'profile') {
        return <ProfileView />;
      }
      return <AdminDashboard />;
    }

    return <FarmerDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Top Navigation */}
      <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main App Container */}
      <div className="flex-1 flex max-w-7xl 2xl:max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Dynamic View Workspace with Error Boundary */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <ErrorBoundary>
            {renderCurrentView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Role-Based Authentication & Registration Modal */}
      <AuthModal />

      {/* Real-Time Floating Notification Toast */}
      <NotificationToast />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AgriProvider>
        <MainLayout />
      </AgriProvider>
    </ErrorBoundary>
  );
}

export default App;

