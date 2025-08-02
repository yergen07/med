import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StockView } from './components/StockView';
import { ReceiptForm } from './components/ReceiptForm';
import { TransferForm } from './components/TransferForm';
import { SaleForm } from './components/SaleForm';
import { ReturnForm } from './components/ReturnForm';
import { ManagerAnalytics } from './components/ManagerAnalytics';
import { TransactionHistory } from './components/TransactionHistory';
import { Reports } from './components/Reports';
import { ContractorForm } from './components/ContractorForm';
import { SalesEditView } from './components/SalesEditView';
import { UsersManagement } from './components/UsersManagement';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
      case 'my-stock':
        return <StockView />;
      case 'receipt':
        return user?.role === 'admin' ? <ReceiptForm /> : <Dashboard />;
      case 'transfer':
        return user?.role === 'admin' ? <TransferForm /> : <Dashboard />;
      case 'contractor':
        return user?.role === 'admin' ? <ContractorForm /> : <Dashboard />;
      case 'sale':
        return user?.role === 'manager' ? <SaleForm /> : <Dashboard />;
      case 'return':
        return user?.role === 'manager' ? <ReturnForm /> : <Dashboard />;
      case 'analytics':
        return <ManagerAnalytics />;
      case 'transactions':
      case 'my-sales':
        return <TransactionHistory />;
      case 'reports':
        return user?.role === 'admin' ? <Reports /> : <Dashboard />;
      case 'edit-sales':
        return user?.role === 'admin' ? <SalesEditView /> : <Dashboard />;
      case 'users':
        return user?.role === 'admin' ? <UsersManagement /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-col sm:flex-row">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full sm:w-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;