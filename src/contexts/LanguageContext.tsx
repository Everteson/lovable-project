import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'pt' | 'en';

interface Translations {
  [key: string]: string | Translations;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traduções
const translations: Record<Language, Translations> = {
  pt: {
    // Navigation
    nav: {
      home: 'Início',
      portfolio: 'Portfólio',
      commission: 'Comissionar',
      terms: 'Termos de Serviço',
      pricing: 'Preços',
      workHours: 'Horário de Atendimento',
      admin: 'Admin'
    },
    
    // Home Page
    home: {
      title: '✨ MINSK ✨',
      subtitle: 'ILUSTRAÇÕES • BANNERS • EMOTES • CHIBI\'S',
      commissionsOpen: 'Comissões: Abertas',
      commissionsClosed: 'Comissões: Fechadas',
      requestCommission: 'Solicitar Comissão',
      viewPortfolio: 'Ver Portfólio',
      workHours: 'Horário de Atendimento',
      aboutTitle: 'Sobre a Artista',
      aboutText: 'Olá! Sou uma artista especializada em ilustrações digitais, emotes para Discord/Twitch, banners personalizados e arte estilo chibi. Cada trabalho é feito com amor e atenção aos detalhes para trazer suas ideias à vida!',
      featuredWorks: 'Trabalhos em Destaque',
      viewMore: 'Ver Mais'
    },
    
    // Portfolio Page
    portfolio: {
      title: 'Meu Portfólio',
      allCategories: 'Todas as Categorias',
      inConstruction: 'Portfólio em construção. Novos trabalhos em breve!',
      viewFullSize: 'Ver Tamanho Completo',
      loadMore: 'Carregar Mais'
    },
    
    // Commission Page
    commission: {
      title: 'Solicitar Comissão',
      subtitle: 'Vamos dar vida às suas ideias!',
      fullName: 'Nome Completo',
      discordId: 'ID do Discord',
      email: 'E-mail',
      projectDescription: 'Descrição do Projeto',
      projectDescriptionPlaceholder: 'Descreva seu projeto em detalhes...',
      referenceFiles: 'Arquivos de Referência',
      tips: 'Dicas para um orçamento preciso:',
      tip1: 'Descreva seu projeto em detalhes',
      tip2: 'Mencione o estilo preferido',
      tip3: 'Indique prazo desejado',
      tip4: 'Especifique o uso pretendido',
      submit: 'Enviar Solicitação',
      sending: 'Enviando...',
      successMessage: 'Solicitação enviada com sucesso! Entrarei em contato em até 24 horas via Discord ou e-mail.',
      agreeTerms: 'Eu concordo com os',
      termsLink: 'Termos de Serviço',
      fillAllFields: 'Por favor, preencha todos os campos obrigatórios.',
      agreeToTerms: 'Você deve concordar com os termos de serviço.'
    },
    
    // Terms Page
    terms: {
      title: 'Termos de Serviço',
      specifications: 'Especificações da Comissão',
      paymentConditions: 'Condições de Pagamento',
      reviewProcess: 'Processo de Revisão',
      copyright: 'Direitos Autorais',
      cancellations: 'Cancelamentos e Reembolsos',
      usageRestrictions: 'Restrições de Uso',
      generalConsiderations: 'Considerações Gerais',
      doList: 'FAÇO',
      dontList: 'NÃO FAÇO'
    },
    
    // Pricing Page
    pricing: {
      title: 'Tabela de Preços',
      requestQuote: 'Solicitar Orçamento',
      packages: 'Pacotes',
      additionalNotes: 'Observações Adicionais'
    },
    
    // Work Hours Page
    workHours: {
      title: 'Horário de Atendimento',
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo',
      notAvailable: 'Não disponível',
      timezone: 'Fuso horário: UTC-3 (Brasília)'
    },
    
    // Admin Page
    admin: {
      title: 'Painel Administrativo',
      commissionManagement: 'Gerenciamento de Comissões',
      portfolioManagement: 'Gerenciamento de Portfólio',
      siteSettings: 'Configurações do Site',
      commissionsStatus: 'Status das Comissões',
      open: 'Abrir',
      close: 'Fechar',
      pending: 'Pendente',
      paid50: '50% Pago',
      paid100: '100% Pago',
      completed: 'Concluído',
      name: 'Nome',
      discord: 'Discord',
      email: 'E-mail',
      description: 'Descrição',
      status: 'Status',
      actions: 'Ações',
      delete: 'Deletar',
      update: 'Atualizar',
      uploadImage: 'Upload de Imagem',
      title_field: 'Título',
      category: 'Categoria',
      description_field: 'Descrição',
      upload: 'Upload',
      noCommissions: 'Nenhuma comissão encontrada.',
      noPortfolioItems: 'Nenhum item no portfólio encontrado.'
    },
    
    // Common
    common: {
      close: 'Fechar',
      cancel: 'Cancelar',
      save: 'Salvar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      login: 'Entrar',
      logout: 'Sair',
      language: 'Idioma'
    },
    
    // Footer
    footer: {
      rights: 'Todos os direitos reservados',
      artBy: 'arte por: @Limnushi'
    }
  },
  
  en: {
    // Navigation
    nav: {
      home: 'Home',
      portfolio: 'Portfolio',
      commission: 'Commission',
      terms: 'Terms of Service',
      pricing: 'Pricing',
      workHours: 'Work Hours',
      admin: 'Admin'
    },
    
    // Home Page
    home: {
      title: '✨ MINSK ✨',
      subtitle: 'ILLUSTRATIONS • BANNERS • EMOTES • CHIBI\'S',
      commissionsOpen: 'Commissions: Open',
      commissionsClosed: 'Commissions: Closed',
      requestCommission: 'Request Commission',
      viewPortfolio: 'View Portfolio',
      workHours: 'Work Hours',
      aboutTitle: 'About the Artist',
      aboutText: 'Hello! I\'m an artist specialized in digital illustrations, Discord/Twitch emotes, custom banners, and chibi-style art. Every piece is made with love and attention to detail to bring your ideas to life!',
      featuredWorks: 'Featured Works',
      viewMore: 'View More'
    },
    
    // Portfolio Page
    portfolio: {
      title: 'My Portfolio',
      allCategories: 'All Categories',
      inConstruction: 'Portfolio under construction. New works coming soon!',
      viewFullSize: 'View Full Size',
      loadMore: 'Load More'
    },
    
    // Commission Page
    commission: {
      title: 'Request Commission',
      subtitle: 'Let\'s bring your ideas to life!',
      fullName: 'Full Name',
      discordId: 'Discord ID',
      email: 'Email',
      projectDescription: 'Project Description',
      projectDescriptionPlaceholder: 'Describe your project in detail...',
      referenceFiles: 'Reference Files',
      tips: 'Tips for an accurate quote:',
      tip1: 'Describe your project in detail',
      tip2: 'Mention preferred style',
      tip3: 'Indicate desired deadline',
      tip4: 'Specify intended usage',
      submit: 'Submit Request',
      sending: 'Sending...',
      successMessage: 'Request sent successfully! I\'ll contact you within 24 hours via Discord or email.',
      agreeTerms: 'I agree to the',
      termsLink: 'Terms of Service',
      fillAllFields: 'Please fill in all required fields.',
      agreeToTerms: 'You must agree to the terms of service.'
    },
    
    // Terms Page
    terms: {
      title: 'Terms of Service',
      specifications: 'Commission Specifications',
      paymentConditions: 'Payment Conditions',
      reviewProcess: 'Review Process',
      copyright: 'Copyright',
      cancellations: 'Cancellations and Refunds',
      usageRestrictions: 'Usage Restrictions',
      generalConsiderations: 'General Considerations',
      doList: 'I DO',
      dontList: 'I DON\'T DO'
    },
    
    // Pricing Page
    pricing: {
      title: 'Pricing Table',
      requestQuote: 'Request Quote',
      packages: 'Packages',
      additionalNotes: 'Additional Notes'
    },
    
    // Work Hours Page
    workHours: {
      title: 'Work Hours',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      notAvailable: 'Not available',
      timezone: 'Timezone: UTC-3 (Brasília)'
    },
    
    // Admin Page
    admin: {
      title: 'Admin Panel',
      commissionManagement: 'Commission Management',
      portfolioManagement: 'Portfolio Management',
      siteSettings: 'Site Settings',
      commissionsStatus: 'Commissions Status',
      open: 'Open',
      close: 'Close',
      pending: 'Pending',
      paid50: '50% Paid',
      paid100: '100% Paid',
      completed: 'Completed',
      name: 'Name',
      discord: 'Discord',
      email: 'Email',
      description: 'Description',
      status: 'Status',
      actions: 'Actions',
      delete: 'Delete',
      update: 'Update',
      uploadImage: 'Image Upload',
      title_field: 'Title',
      category: 'Category',
      description_field: 'Description',
      upload: 'Upload',
      noCommissions: 'No commissions found.',
      noPortfolioItems: 'No portfolio items found.'
    },
    
    // Common
    common: {
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      login: 'Login',
      logout: 'Logout',
      language: 'Language'
    },
    
    // Footer
    footer: {
      rights: 'All rights reserved',
      artBy: 'art by: @Limnushi'
    }
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'pt';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};