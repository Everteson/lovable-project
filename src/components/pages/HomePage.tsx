import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Palette, MessageSquare, Clock, Star } from 'lucide-react';
import { AppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const { commissionsOpen, portfolioItems } = useContext(AppContext);
  const { t } = useLanguage();
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  
  const featuredItems = portfolioItems.slice(0, 4);

  // Load admin profile picture and background image
  useEffect(() => {
    loadAdminProfile();
    loadSiteSettings();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('role', 'admin')
        .maybeSingle();

      if (data?.avatar_url) {
        setProfilePicture(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'background_image')
        .maybeSingle();

      if (data?.value) {
        setBackgroundImage(data.value);
      }
    } catch (error) {
      console.error('Error loading background image:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 gradient-hero opacity-50"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="animate-fade-in">
            {/* Profile Picture */}
            {profilePicture && (
              <div className="mb-6 animate-scale-in">
                <Avatar className="w-32 h-32 mx-auto border-4 border-primary/30 shadow-2xl hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={profilePicture} alt="Artist Profile" />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    M
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 neon-text">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              {t('home.subtitle')}
            </p>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              {t('home.aboutText')}
            </p>
          </div>
          
          {/* Commission Status */}
          <div className="animate-fade-in-scale mb-8">
            <Badge 
              variant={commissionsOpen ? "default" : "secondary"}
              className={`text-lg px-6 py-2 ${commissionsOpen ? 'animate-pulse-glow' : ''}`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {commissionsOpen ? t('home.commissionsOpen') : t('home.commissionsClosed')}
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => setCurrentPage('commission')}
              disabled={!commissionsOpen}
              className="group"
            >
              <MessageSquare className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              {t('home.requestCommission')}
            </Button>
            <Button 
              variant="glass" 
              size="xl"
              onClick={() => setCurrentPage('portfolio')}
              className="group"
            >
              <Palette className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              {t('home.viewPortfolio')}
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => setCurrentPage('hours')}
              className="group"
            >
              <Clock className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              {t('home.workHours')}
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 gradient-primary bg-clip-text text-transparent">
            About the Artist
          </h2>
          <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
            Welcome to my creative world! I'm passionate about bringing characters and ideas to life through digital art. 
            Specializing in vibrant illustrations, eye-catching banners, expressive emotes, and charming chibi characters. 
            Each piece is crafted with attention to detail and a touch of magic. ✨
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card hover-lift">
              <CardContent className="p-6 text-center">
                <Palette className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Custom Illustrations</h3>
                <p className="text-muted-foreground">
                  Original artwork tailored to your vision and style preferences
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-semibold mb-2">Emotes & Banners</h3>
                <p className="text-muted-foreground">
                  Perfect for streaming, gaming, and social media presence
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-primary-glow" />
                <h3 className="text-xl font-semibold mb-2">Chibi Characters</h3>
                <p className="text-muted-foreground">
                  Adorable, stylized character designs full of personality
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Portfolio */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
              Featured Artwork
            </h2>
            <p className="text-lg text-muted-foreground">
              A glimpse into my creative world
            </p>
          </div>
          
          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredItems.map((item, index) => (
                <Card key={item.id} className="glass-card hover-lift group overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${1500 + index}x1500/?art,digital,illustration`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        <p className="text-white/80 text-sm">{item.category}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-float">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Portfolio Coming Soon!</h3>
              <p className="text-muted-foreground">New artwork will be showcased here soon.</p>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              variant="neon" 
              size="lg"
              onClick={() => setCurrentPage('portfolio')}
            >
              View Complete Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Credit */}
      <section className="py-8 text-center">
        <p className="text-muted-foreground">
          art by: <span className="gradient-primary bg-clip-text text-transparent font-semibold">@Limnushi</span>
        </p>
      </section>
    </div>
  );
};

export default HomePage;