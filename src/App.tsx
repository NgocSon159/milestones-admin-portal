import React, { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { LoginPage } from './components/LoginPage';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { ClaimRequests } from './components/ClaimRequests';
import { ManualEntry } from './components/ManualEntry';
import { RewardManagement } from './components/RewardManagement';
import { TierConfig } from './components/TierConfig';
import { HistoryLog } from './components/HistoryLog';
import { MemberManagement } from './components/MemberManagement';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAuthenticated } = useAppContext();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'claims':
        return <ClaimRequests />;
      case 'manual-entry':
        return <ManualEntry />;
      case 'rewards':
        return <RewardManagement />;
      case 'tier-config':
        return <TierConfig />;
      case 'history':
        return <HistoryLog />;
      case 'members':
        return <MemberManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
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