import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiService, PortfolioItem as ApiPortfolioItem, CommissionRequest as ApiCommissionRequest } from '@/services/api';

// Interfaces adaptadas para compatibilidade com o frontend existente
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface CommissionRequest {
  id: string;
  fullName: string;
  discordId: string;
  email: string;
  description: string;
  status: 'pending' | '50_paid' | '100_paid' | 'completed';
  createdAt: string;
  fileReference?: string;
}

interface AppContextType {
  // Commission status
  commissionsOpen: boolean;
  setCommissionsOpen: (open: boolean) => void;
  
  // Portfolio
  portfolioItems: PortfolioItem[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => void;
  removePortfolioItem: (id: string) => void;
  refreshPortfolio: () => Promise<void>;
  
  // Commission requests
  commissionRequests: CommissionRequest[];
  addCommissionRequest: (request: Omit<CommissionRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateCommissionStatus: (id: string, status: CommissionRequest['status']) => void;
  removeCommissionRequest: (id: string) => void;
  refreshCommissions: () => Promise<void>;
  
  // Categories
  categories: string[];
  addCategory: (category: string) => void;
  refreshCategories: () => Promise<void>;
  
  // Loading states
  loading: boolean;
}

const defaultCategories = ['Concept Art', 'FanArt', 'Chibi', 'Emotes', 'Banners', 'Wallpapers', 'Badges'];

export const AppContext = createContext<AppContextType>({
  commissionsOpen: true,
  setCommissionsOpen: () => {},
  portfolioItems: [],
  addPortfolioItem: () => {},
  removePortfolioItem: () => {},
  refreshPortfolio: async () => {},
  commissionRequests: [],
  addCommissionRequest: () => {},
  updateCommissionStatus: () => {},
  removeCommissionRequest: () => {},
  refreshCommissions: async () => {},
  categories: defaultCategories,
  addCategory: () => {},
  refreshCategories: async () => {},
  loading: false,
});

interface AppProviderProps {
  children: ReactNode;
}

// Função para converter dados da API para o formato do frontend
const convertApiPortfolioItem = (apiItem: ApiPortfolioItem): PortfolioItem => ({
  id: apiItem.id,
  title: apiItem.title,
  description: apiItem.description || '',
  category: apiItem.category,
  imageUrl: `http://localhost:8000${apiItem.image_url}`, // Adicionar URL base
  createdAt: apiItem.created_at,
});

const convertApiCommissionRequest = (apiRequest: ApiCommissionRequest): CommissionRequest => ({
  id: apiRequest.id,
  fullName: apiRequest.full_name,
  discordId: apiRequest.discord_id,
  email: apiRequest.email,
  description: apiRequest.project_description,
  status: apiRequest.status as 'pending' | '50_paid' | '100_paid' | 'completed',
  createdAt: apiRequest.created_at,
  fileReference: apiRequest.file_reference,
});

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [commissionsOpen, setCommissionsOpenState] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [commissionRequests, setCommissionRequests] = useState<CommissionRequest[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshPortfolio(),
        refreshCommissions(),
        refreshCategories(),
        loadCommissionsStatus(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Fallback para dados locais se a API falhar
      loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    // Fallback para localStorage se a API não estiver disponível
    const savedCommissionsOpen = localStorage.getItem('commissionsOpen');
    const savedPortfolio = localStorage.getItem('portfolioItems');
    const savedRequests = localStorage.getItem('commissionRequests');
    const savedCategories = localStorage.getItem('categories');

    if (savedCommissionsOpen !== null) {
      setCommissionsOpenState(JSON.parse(savedCommissionsOpen));
    }
    if (savedPortfolio) {
      setPortfolioItems(JSON.parse(savedPortfolio));
    }
    if (savedRequests) {
      setCommissionRequests(JSON.parse(savedRequests));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  };

  const loadCommissionsStatus = async () => {
    try {
      const status = await apiService.getCommissionsStatus();
      setCommissionsOpenState(status.commissions_open);
    } catch (error) {
      console.error('Error loading commissions status:', error);
    }
  };

  const refreshPortfolio = async () => {
    try {
      const apiItems = await apiService.getPortfolioItems();
      const convertedItems = apiItems.map(convertApiPortfolioItem);
      setPortfolioItems(convertedItems);
      // Salvar no localStorage como backup
      localStorage.setItem('portfolioItems', JSON.stringify(convertedItems));
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    }
  };

  const refreshCommissions = async () => {
    try {
      const apiRequests = await apiService.getCommissions();
      const convertedRequests = apiRequests.map(convertApiCommissionRequest);
      setCommissionRequests(convertedRequests);
      // Salvar no localStorage como backup
      localStorage.setItem('commissionRequests', JSON.stringify(convertedRequests));
    } catch (error) {
      console.error('Error refreshing commissions:', error);
    }
  };

  const refreshCategories = async () => {
    try {
      const response = await apiService.getPortfolioCategories();
      const apiCategories = response.categories.length > 0 ? response.categories : defaultCategories;
      setCategories(apiCategories);
      localStorage.setItem('categories', JSON.stringify(apiCategories));
    } catch (error) {
      console.error('Error refreshing categories:', error);
      setCategories(defaultCategories);
    }
  };

  const setCommissionsOpen = async (open: boolean) => {
    try {
      await apiService.updateCommissionsStatus(open);
      setCommissionsOpenState(open);
      localStorage.setItem('commissionsOpen', JSON.stringify(open));
    } catch (error) {
      console.error('Error updating commissions status:', error);
      // Fallback para localStorage
      setCommissionsOpenState(open);
      localStorage.setItem('commissionsOpen', JSON.stringify(open));
    }
  };

  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    // Esta função agora é apenas para compatibilidade
    // O upload real deve ser feito através do AdminPage
    console.warn('addPortfolioItem: Use the API service directly for file uploads');
  };

  const removePortfolioItem = async (id: string) => {
    try {
      await apiService.deletePortfolioItem(id);
      await refreshPortfolio();
    } catch (error) {
      console.error('Error removing portfolio item:', error);
      // Fallback para remoção local
      const updatedItems = portfolioItems.filter(item => item.id !== id);
      setPortfolioItems(updatedItems);
      localStorage.setItem('portfolioItems', JSON.stringify(updatedItems));
    }
  };

  const addCommissionRequest = async (request: Omit<CommissionRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      await apiService.createCommission({
        full_name: request.fullName,
        discord_id: request.discordId,
        email: request.email,
        project_description: request.description,
        file_reference: request.fileReference,
      });
      await refreshCommissions();
    } catch (error) {
      console.error('Error adding commission request:', error);
      // Fallback para adição local
      const newRequest: CommissionRequest = {
        ...request,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const updatedRequests = [...commissionRequests, newRequest];
      setCommissionRequests(updatedRequests);
      localStorage.setItem('commissionRequests', JSON.stringify(updatedRequests));
    }
  };

  const updateCommissionStatus = async (id: string, status: CommissionRequest['status']) => {
    try {
      await apiService.updateCommission(id, { status });
      await refreshCommissions();
    } catch (error) {
      console.error('Error updating commission status:', error);
      // Fallback para atualização local
      const updatedRequests = commissionRequests.map(request =>
        request.id === id ? { ...request, status } : request
      );
      setCommissionRequests(updatedRequests);
      localStorage.setItem('commissionRequests', JSON.stringify(updatedRequests));
    }
  };

  const removeCommissionRequest = async (id: string) => {
    try {
      await apiService.deleteCommission(id);
      await refreshCommissions();
    } catch (error) {
      console.error('Error removing commission request:', error);
      // Fallback para remoção local
      const updatedRequests = commissionRequests.filter(request => request.id !== id);
      setCommissionRequests(updatedRequests);
      localStorage.setItem('commissionRequests', JSON.stringify(updatedRequests));
    }
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
    }
  };

  return (
    <AppContext.Provider value={{
      commissionsOpen,
      setCommissionsOpen,
      portfolioItems,
      addPortfolioItem,
      removePortfolioItem,
      refreshPortfolio,
      commissionRequests,
      addCommissionRequest,
      updateCommissionStatus,
      removeCommissionRequest,
      refreshCommissions,
      categories,
      addCategory,
      refreshCategories,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
};
