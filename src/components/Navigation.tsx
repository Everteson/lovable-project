import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Palette, FileImage, MessageSquare, FileText, DollarSign, Clock, Settings } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Palette },
    { id: 'portfolio', label: t('nav.portfolio'), icon: FileImage },
    { id: 'commission', label: t('nav.commission'), icon: MessageSquare },
    { id: 'terms', label: t('nav.terms'), icon: FileText },
    { id: 'pricing', label: t('nav.pricing'), icon: DollarSign },
    { id: 'hours', label: t('nav.workHours'), icon: Clock },
  ];

  if (isAuthenticated) {
    navItems.push({ id: 'admin', label: t('nav.admin'), icon: Settings });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent neon-text">
              ✨ MINSK ✨
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'hero' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(item.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'hero' : 'ghost'}
                    className="justify-start gap-2 w-full"
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
              <div className="pt-2 border-t border-border/50 mt-2">
                <LanguageToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;