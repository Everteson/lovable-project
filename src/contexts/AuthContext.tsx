import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginResponse } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um token salvo e tentar obter o usuário atual
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Error getting current user:', error);
          // Token inválido, limpar
          apiService.clearToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await apiService.login(email, password);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: 'Falha no login. Verifique suas credenciais.' };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user && user.role === 'admin', // Apenas admins podem fazer login
      user,
      login, 
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
