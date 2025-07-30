import React, { useState, useContext } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomePage from '@/components/pages/HomePage';
import PortfolioPage from '@/components/pages/PortfolioPage';
import CommissionPage from '@/components/pages/CommissionPage';
import TermsPage from '@/components/pages/TermsPage';
import PricingPage from '@/components/pages/PricingPage';
import WorkHoursPage from '@/components/pages/WorkHoursPage';
import AdminPage from '@/components/pages/AdminPage';
import LoginModal from '@/components/LoginModal';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setCurrentPage('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'commission':
        return <CommissionPage setCurrentPage={setCurrentPage} />;
      case 'terms':
        return <TermsPage />;
      case 'pricing':
        return <PricingPage setCurrentPage={setCurrentPage} />;
      case 'hours':
        return <WorkHoursPage />;
      case 'admin':
        return isAuthenticated ? <AdminPage /> : <HomePage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Floating Admin Button */}
      {!isAuthenticated && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-40 glass-card hover-lift"
          onClick={handleAdminAccess}
        >
          <Settings className="w-5 h-5" />
        </Button>
      )}
      
      <main>
        {renderPage()}
      </main>
      
      <Footer />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default Index;
