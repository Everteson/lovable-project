import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Star, Package, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PricingPageProps {
  setCurrentPage: (page: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ setCurrentPage }) => {
  const [pricingData, setPricingData] = useState<Array<{service: string, price: string, description: string}>>([]);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'pricing_info')
        .maybeSingle();

      if (data?.value) {
        setPricingData(JSON.parse(data.value));
      } else {
        // Fallback para dados padrão
        setPricingData(getDefaultPricingData());
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
      setPricingData(getDefaultPricingData());
    }
  };

  const getDefaultPricingData = () => {
    return [
      { service: 'Ícone', price: 'R$ 25', description: 'Avatar simples, busto básico' },
      { service: 'Meio Corpo', price: 'R$ 40', description: 'Cintura para cima, mais detalhado' },
      { service: 'Corpo Todo', price: 'R$ 60', description: 'Personagem completo' },
      { service: 'Emotes', price: 'R$ 15', description: 'Cada emote para stream' },
      { service: 'Banner', price: 'R$ 50', description: 'Header para redes sociais' },
      { service: 'Wallpaper', price: 'R$ 80', description: 'Papel de parede personalizado' },
      { service: 'Badges', price: 'R$ 20', description: 'Distintivos para stream' },
      { service: "Chibi's", price: 'R$ 30', description: 'Estilo fofo e simplificado' },
    ];
  };

  // Separar entre serviços individuais e pacotes
  const individualServices = pricingData.filter(item => !item.service.toLowerCase().includes('pacote'));
  const packages = pricingData.filter(item => item.service.toLowerCase().includes('pacote'));

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Tabela de Valores
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Preços transparentes para todos os tipos de arte digital
          </p>
          <Badge variant="outline" className="text-sm">
            Preços em Reais (BRL) • USD disponível sob consulta
          </Badge>
        </div>

        {/* Individual Pricing */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Preços Individuais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {individualServices.map((item, index) => (
              <Card key={index} className="glass-card hover-lift text-center">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg gradient-primary bg-clip-text text-transparent">
                    {item.service}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{item.price}</div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Package Deals */}
        {packages.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Pacotes Especiais</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {packages.map((pkg, index) => (
                <Card key={index} className="glass-card hover-lift relative">
                  {index === 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant="default" className="animate-pulse-glow">
                        <Star className="w-4 h-4 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl gradient-primary bg-clip-text text-transparent">
                      {pkg.service}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-6 h-6 text-accent" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-primary mb-2">Taxas por Alterações</h4>
                <p className="text-muted-foreground">
                  Revisões além das 2 incluídas: 20% do valor total por revisão adicional.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Personagens Extras</h4>
                <p className="text-muted-foreground">
                  Cada personagem adicional: +50% do valor base da ilustração.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Complexidade</h4>
                <p className="text-muted-foreground">
                  Designs muito complexos podem ter acréscimo de 20-30% no valor.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Prazo Urgente</h4>
                <p className="text-muted-foreground">
                  Entrega em menos de 3 dias: taxa adicional de 50%.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6 text-accent" />
                O que está Incluído
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-primary mb-2">Formato de Entrega</h4>
                <p className="text-muted-foreground">
                  PNG em alta resolução (300 DPI), sem marca d'água.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Revisões Inclusas</h4>
                <p className="text-muted-foreground">
                  2 revisões gratuitas: uma no esboço e uma na arte quase final.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Comunicação</h4>
                <p className="text-muted-foreground">
                  Updates regulares via Discord e email durante o processo.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Garantia</h4>
                <p className="text-muted-foreground">
                  Satisfação garantida ou reembolso conforme termos de serviço.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12 animate-fade-in">
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
                Pronto para Começar?
              </h3>
              <p className="text-muted-foreground mb-6">
                Entre em contato para discutir seu projeto e receber um orçamento personalizado!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => setCurrentPage('commission')}
                  className="group"
                >
                  <DollarSign className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Solicitar Orçamento
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setCurrentPage('terms')}
                >
                  Ver Termos de Serviço
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />
        
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Preços sujeitos a alteração • Orçamentos personalizados disponíveis • art by: @Limnushi
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;