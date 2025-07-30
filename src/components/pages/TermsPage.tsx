import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Check, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TermsPage: React.FC = () => {
  const [termsContent, setTermsContent] = useState('');

  useEffect(() => {
    loadTermsContent();
  }, []);

  const loadTermsContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'terms_of_service')
        .maybeSingle();

      if (data?.value) {
        setTermsContent(data.value);
      } else {
        // Fallback para o conteúdo padrão se não houver no banco
        setTermsContent(getDefaultTermsContent());
      }
    } catch (error) {
      console.error('Error loading terms:', error);
      setTermsContent(getDefaultTermsContent());
    }
  };

  const getDefaultTermsContent = () => {
    return `# Termos de Serviço

## Especificações da Comissão
Todas as comissões são criadas digitalmente em alta resolução (300 DPI mínimo) e entregues em formato PNG. O cliente receberá a arte final sem marca d'água após o pagamento completo.

O prazo de entrega varia entre 3 a 14 dias úteis, dependendo da complexidade do projeto. Prazos específicos serão acordados antes do início do trabalho.

## Condições de Pagamento
O pagamento é dividido em duas partes: 50% no início do projeto (após aprovação do esboço) e 50% na entrega final.

Pagamentos são aceitos via PIX, PayPal ou transferência bancária. Outras formas de pagamento podem ser negociadas.

## Processo de Revisão
O cliente terá direito a 2 revisões gratuitas durante o processo: uma no esboço inicial e uma na arte quase finalizada.

Revisões adicionais serão cobradas 20% do valor total da comissão por revisão.

## Direitos Autorais
O artista mantém todos os direitos autorais da obra criada. O cliente recebe direitos de uso conforme especificado no acordo.

Uso comercial deve ser especificado e acordado previamente, podendo haver cobrança adicional.

## FAÇO / NÃO FAÇO

### FAÇO:
• Personagens originais e fanart
• Emotes para streaming
• Banners e headers
• Ilustrações de personagens
• Arte estilo chibi
• Badges e ícones
• Wallpapers personalizados
• Arte de casal (romantic)
• Redesigns de personagens

### NÃO FAÇO:
• Conteúdo NSFW explícito
• Arte com teor político
• Conteúdo que promova ódio
• Cópia exata de outros artistas
• Mechs complexos
• Paisagens realistas detalhadas
• Anatomia hiper-realista
• Arte para uso em NFTs (sem acordo prévio)`;
  };

  const renderTermsContent = () => {
    if (!termsContent) return null;

    const sections = termsContent.split('##').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace('#', '').trim();
      const content = lines.slice(1).join('\n').trim();
      
      if (index === 0) return null; // Skip the main title
      
      return (
        <Card key={index} className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="whitespace-pre-line text-sm leading-relaxed">
              {content}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Please read carefully before commissioning artwork
          </p>
        </div>

        <div className="space-y-8 animate-fade-in">
          {renderTermsContent()}

          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Ao solicitar uma comissão, você concorda com todos os termos acima.
            </p>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              Última atualização: Dezembro 2024 • art by: @Limnushi
            </p>
          </div>
        </div>
      </div>
    </div>
  );

};

export default TermsPage;