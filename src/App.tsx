import React, { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { LoginPage } from './components/LoginPage';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { ClaimRequests } from './components/ClaimRequests';
import { ManualEntry } from './components/ManualEntry';
import { RewardManagement } from './components/RewardManagement';
import { CreateReward } from './components/CreateReward';
import { EditReward } from './components/EditReward';
import { TierConfig } from './components/TierConfig';

import { MemberManagement } from './components/MemberManagement';
import { Toaster } from './components/ui/sonner';

interface RouteParams {
  page: string;
  subPage?: string;
  id?: string;
}

function AppContent() {
  const { isAuthenticated } = useAppContext();
  const [currentRoute, setCurrentRoute] = useState<RouteParams>({ page: 'dashboard' });

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const navigateToPage = (page: string, subPage?: string, id?: string) => {
    setCurrentRoute({ page, subPage, id });
  };

  const renderPage = () => {
    const { page, subPage, id } = currentRoute;
    
    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'claims':
        return <ClaimRequests />;
      case 'manual-request':
        return <ManualEntry />;
      case 'rewards':
        if (subPage === 'create') {
          return <CreateReward onNavigate={navigateToPage} />;
        } else if (subPage === 'edit' && id) {
          return <EditReward rewardId={id} onNavigate={navigateToPage} />;
        } else {
          return <RewardManagement onNavigate={navigateToPage} />;
        }
      case 'tier-config':
        return <TierConfig />;
      case 'members':
        return <MemberManagement />;
      default:
        return <Dashboard />;
    }
  };

  const getCurrentPageForNavigation = () => {
    if (currentRoute.page === 'rewards' && (currentRoute.subPage === 'create' || currentRoute.subPage === 'edit')) {
      return 'rewards';
    }
    return currentRoute.page;
  };

  return (
    <AppLayout 
      currentPage={getCurrentPageForNavigation()} 
      setCurrentPage={(page) => navigateToPage(page)}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <AppContent />
        <Toaster position="top-right" richColors />
      </div>
    </AppProvider>
  );
}