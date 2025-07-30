// API service para conectar com o backend Python
const API_BASE_URL = 'http://localhost:8000/api';

// Tipos para as respostas da API
export interface CommissionRequest {
  id: string;
  full_name: string;
  discord_id: string;
  email: string;
  project_description: string;
  status: 'pending' | '50_paid' | '100_paid' | 'completed';
  payment_status: 'pending' | '50_paid' | '100_paid';
  progress_status: 'in_queue' | 'waiting_payment' | 'in_progress' | 'completed';
  file_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  role: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Classe para gerenciar a API
class ApiService {
  private token: string | null = null;

  constructor() {
    // Recuperar token do localStorage
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private getFormHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Autenticação
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha no login');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao obter usuário atual');
    }

    return response.json();
  }

  // Comissões
  async getCommissions(): Promise<CommissionRequest[]> {
    const response = await fetch(`${API_BASE_URL}/commissions`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar comissões');
    }

    return response.json();
  }

  async createCommission(data: {
    full_name: string;
    discord_id: string;
    email: string;
    project_description: string;
    file_reference?: string;
  }): Promise<CommissionRequest> {
    const response = await fetch(`${API_BASE_URL}/commissions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar comissão');
    }

    return response.json();
  }

  async updateCommission(id: string, data: {
    status?: string;
    payment_status?: string;
    progress_status?: string;
    notes?: string;
  }): Promise<CommissionRequest> {
    const response = await fetch(`${API_BASE_URL}/commissions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar comissão');
    }

    return response.json();
  }

  async deleteCommission(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/commissions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao deletar comissão');
    }
  }

  // Portfólio
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    const response = await fetch(`${API_BASE_URL}/portfolio`);

    if (!response.ok) {
      throw new Error('Falha ao carregar portfólio');
    }

    return response.json();
  }

  async createPortfolioItem(data: {
    title: string;
    description?: string;
    category: string;
    is_featured?: boolean;
    image: File;
  }): Promise<PortfolioItem> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('is_featured', String(data.is_featured || false));
    formData.append('image', data.image);

    const response = await fetch(`${API_BASE_URL}/portfolio`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao criar item do portfólio');
    }

    return response.json();
  }

  async updatePortfolioItem(id: string, data: {
    title?: string;
    description?: string;
    category?: string;
    is_featured?: boolean;
  }): Promise<PortfolioItem> {
    const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar item do portfólio');
    }

    return response.json();
  }

  async deletePortfolioItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao deletar item do portfólio');
    }
  }

  async getPortfolioCategories(): Promise<{ categories: string[] }> {
    const response = await fetch(`${API_BASE_URL}/portfolio/categories/list`);

    if (!response.ok) {
      throw new Error('Falha ao carregar categorias');
    }

    return response.json();
  }

  // Configurações
  async getSettings(): Promise<SiteSetting[]> {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar configurações');
    }

    return response.json();
  }

  async getSetting(key: string): Promise<SiteSetting> {
    const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Falha ao carregar configuração: ${key}`);
    }

    return response.json();
  }

  async updateSetting(key: string, data: {
    value: string;
    description?: string;
  }): Promise<SiteSetting> {
    const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Falha ao atualizar configuração: ${key}`);
    }

    return response.json();
  }

  async getCommissionsStatus(): Promise<{ commissions_open: boolean }> {
    const response = await fetch(`${API_BASE_URL}/settings/commissions/status`);

    if (!response.ok) {
      throw new Error('Falha ao carregar status das comissões');
    }

    return response.json();
  }

  async updateCommissionsStatus(commissions_open: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/settings/commissions/status`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ commissions_open }),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar status das comissões');
    }
  }

  async uploadBackgroundImage(image: File, description?: string): Promise<SiteSetting> {
    const formData = new FormData();
    formData.append('image', image);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/settings/background-image`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao fazer upload da imagem de fundo');
    }

    return response.json();
  }

  async uploadProfileImage(image: File, description?: string): Promise<SiteSetting> {
    const formData = new FormData();
    formData.append('image', image);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/settings/profile-image`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao fazer upload da foto de perfil');
    }

    return response.json();
  }
}

// Instância singleton da API
export const apiService = new ApiService();
