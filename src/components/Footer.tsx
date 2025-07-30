import React from 'react';
import { Instagram, Twitter, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  return (
    <footer className="glass-card border-t border-border/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              ✨ MINSK ✨
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              art by: @Limnushi
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hover-lift">
              <Instagram className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover-lift">
              <Twitter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover-lift">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover-lift">
              <Mail className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-6 pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 MINSK. All rights reserved. • ILUSTRAÇÕES • BANNERS • EMOTES • CHIBI'S
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;