import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Settings, 
  Upload, 
  MessageSquare, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  Eye,
  LogOut,
  ToggleLeft,
  ToggleRight,
  Plus,
  Camera,
  Save
} from 'lucide-react';
import { AppContext, PortfolioItem, CommissionRequest } from '@/contexts/AppContext';
import { AuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminPage: React.FC = () => {
  const { logout, user } = useContext(AuthContext);
  const {
    commissionsOpen,
    setCommissionsOpen,
    portfolioItems,
    addPortfolioItem,
    removePortfolioItem,
    commissionRequests,
    updateCommissionStatus,
    removeCommissionRequest,
    categories,
    addCategory
  } = useContext(AppContext);

  // Profile state
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Portfolio form state
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    category: '',
    imageFile: null as File | null
  });
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CommissionRequest | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    terms: '',
    pricing: [] as Array<{service: string, price: string, description: string}>,
    workHours: {} as Record<string, string>,
    backgroundImage: ''
  });
  const [editingSettings, setEditingSettings] = useState({
    terms: false,
    pricing: false,
    workHours: false,
    backgroundImage: false
  });
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [newPriceItem, setNewPriceItem] = useState({service: '', price: '', description: ''});

  // Load profile picture and settings on mount
  useEffect(() => {
    loadProfilePicture();
    loadSiteSettings();
  }, [user]);

  const loadProfilePicture = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.avatar_url) {
        setProfilePicture(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['terms_of_service', 'pricing_info', 'work_hours', 'background_image']);

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, string>);

        // Load existing terms and pricing from pages
        const existingTerms = `# Termos de Serviço

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

        const existingPricing = [
          { service: "Ícone", price: "R$ 25", description: "Avatar simples, busto básico" },
          { service: "Meio Corpo", price: "R$ 40", description: "Cintura para cima, mais detalhado" },
          { service: "Corpo Todo", price: "R$ 60", description: "Personagem completo" },
          { service: "Emotes", price: "R$ 15", description: "Cada emote para stream" },
          { service: "Banner", price: "R$ 50", description: "Header para redes sociais" },
          { service: "Wallpaper", price: "R$ 80", description: "Papel de parede personalizado" },
          { service: "Badges", price: "R$ 20", description: "Distintivos para stream" },
          { service: "Chibi's", price: "R$ 30", description: "Estilo fofo e simplificado" },
          { service: "5 Emotes (Pacote)", price: "R$ 60", description: "5 emotes personalizados - Economia de R$ 15" },
          { service: "5 Emotes + 3 Badges", price: "R$ 105", description: "Pacote completo - Economia de R$ 30" },
          { service: "Pacote Streamer Completo", price: "R$ 200", description: "1 banner + 8 emotes + 5 badges + 1 overlay - Economia de R$ 70" }
        ];

        setSettings({
          terms: settingsMap.terms_of_service || existingTerms,
          pricing: JSON.parse(settingsMap.pricing_info || JSON.stringify(existingPricing)),
          workHours: JSON.parse(settingsMap.work_hours || '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "Fechado", "sunday": "Fechado"}'),
          backgroundImage: settingsMap.background_image || ''
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingProfile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfilePicture(publicUrl);
      toast({
        title: "Foto de perfil atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar a foto de perfil.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPortfolioForm(prev => ({ ...prev, imageFile: file }));
  };

  const handlePortfolioSubmit = async () => {
    if (!portfolioForm.title || !portfolioForm.description || !portfolioForm.category || !portfolioForm.imageFile) {
      toast({
        title: "Informações faltando",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPortfolio(true);
    try {
      const fileExt = portfolioForm.imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, portfolioForm.imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);

      addPortfolioItem({
        title: portfolioForm.title,
        description: portfolioForm.description,
        category: portfolioForm.category,
        imageUrl: publicUrl
      });

      setPortfolioForm({ title: '', description: '', category: '', imageFile: null });
      
      toast({
        title: "Sucesso! ✨",
        description: "Item do portfólio adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      toast({
        title: "Erro",
        description: "Falha ao fazer upload da imagem.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPortfolio(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    addCategory(newCategory.trim());
    setNewCategory('');
    
    toast({
      title: "Categoria Adicionada",
      description: `"${newCategory}" foi adicionada às categorias.`,
    });
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingBackground(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `background-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({ key: 'background_image', value: publicUrl }, { onConflict: 'key' });

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, backgroundImage: publicUrl }));
      toast({
        title: "Imagem de fundo atualizada!",
        description: "A nova imagem de fundo foi definida.",
      });
    } catch (error) {
      console.error('Error uploading background:', error);
      toast({
        title: "Erro",
        description: "Falha ao fazer upload da imagem de fundo.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingBackground(false);
    }
  };

  const updateSiteSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: "Configuração salva!",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a configuração.",
        variant: "destructive"
      });
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case '50_paid': return 'secondary';
      case '100_paid': return 'outline';
      default: return 'default';
    }
  };

  const getProgressStatusColor = (status: string) => {
    switch (status) {
      case 'in_queue': return 'default';
      case 'waiting_payment': return 'secondary';
      case 'in_progress': return 'destructive';
      case 'completed': return 'outline';
      default: return 'default';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case '50_paid': return '50% Pago';
      case '100_paid': return '100% Pago';
      default: return 'Desconhecido';
    }
  };

  const getProgressStatusLabel = (status: string) => {
    switch (status) {
      case 'in_queue': return 'Na Fila';
      case 'waiting_payment': return 'Aguardando Pagamento';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Completo';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Profile */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileLoading ? (
                <Skeleton className="w-20 h-20 rounded-full" />
              ) : (
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarImage src={profilePicture} alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {user?.email?.charAt(0).toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
              )}
              <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/80 transition-colors">
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={isUploadingProfile}
                />
              </label>
              {isUploadingProfile && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                MINSK
              </h1>
              <p className="text-muted-foreground">Administração do Sistema</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Status das Comissões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {commissionsOpen ? 'ABERTO' : 'FECHADO'}
                    </span>
                    <Switch
                      checked={commissionsOpen}
                      onCheckedChange={setCommissionsOpen}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {commissionRequests.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {commissionRequests.filter(r => r.status === 'pending').length} pendentes
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Itens do Portfólio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {portfolioItems.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {categories.length} categorias
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Pedidos de Comissão Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {commissionRequests.slice(-3).reverse().map((request) => (
                  <div key={request.id} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-medium">{request.fullName}</p>
                      <p className="text-sm text-muted-foreground">{request.discordId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Pagamento: Pendente</Badge>
                      <Badge variant="default">Status: Na Fila</Badge>
                    </div>
                  </div>
                ))}
                {commissionRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum pedido de comissão ainda</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Pedidos de Comissão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissionRequests.map((request) => (
                    <Card key={request.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{request.fullName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.discordId} • {request.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setSelectedRequest(request)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Pedido</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Descrição</Label>
                                    <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                      {request.description}
                                    </div>
                                  </div>
                                  {request.fileReference && (
                                    <div>
                                      <Label>Arquivos de Referência</Label>
                                      <p className="text-sm text-primary mt-1">{request.fileReference}</p>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Status de Pagamento</Label>
                                      <Select defaultValue="pending">
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pendente</SelectItem>
                                          <SelectItem value="50_paid">50% Pago</SelectItem>
                                          <SelectItem value="100_paid">100% Pago</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Status de Andamento</Label>
                                      <Select defaultValue="in_queue">
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="in_queue">Na Fila</SelectItem>
                                          <SelectItem value="waiting_payment">Aguardando Pagamento</SelectItem>
                                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                                          <SelectItem value="completed">Completo</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      removeCommissionRequest(request.id);
                                      toast({
                                        title: "Pedido Deletado",
                                        description: "O pedido de comissão foi removido.",
                                      });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Deletar
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">
                          {request.description.substring(0, 150)}
                          {request.description.length > 150 ? '...' : ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant={getPaymentStatusColor('pending')}>
                            Pagamento: Pendente
                          </Badge>
                          <Badge variant={getProgressStatusColor('in_queue')}>
                            Andamento: Na Fila
                          </Badge>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              removeCommissionRequest(request.id);
                              toast({
                                title: "Pedido Deletado",
                                description: "O pedido de comissão foi removido.",
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {commissionRequests.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum pedido de comissão ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add New Item */}
              <div className="lg:col-span-1">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-6 h-6" />
                      Adicionar Item do Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={portfolioForm.title}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título da obra"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={portfolioForm.description}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva a obra"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={portfolioForm.category} onValueChange={(value) => setPortfolioForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="imageFile">Upload da Imagem</Label>
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handlePortfolioImageUpload}
                        className="mt-1"
                      />
                      {portfolioForm.imageFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {portfolioForm.imageFile.name}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={handlePortfolioSubmit} 
                      className="w-full"
                      disabled={isUploadingPortfolio}
                    >
                      {isUploadingPortfolio ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Adicionar Item
                    </Button>
                    
                    {/* Add Category */}
                    <div className="border-t border-border/50 pt-4">
                      <Label htmlFor="newCategory">Adicionar Nova Categoria</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="newCategory"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Nome da categoria"
                        />
                        <Button onClick={handleAddCategory} size="sm">
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Items */}
              <div className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-6 h-6" />
                      Itens do Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {portfolioItems.map((item) => (
                        <Card key={item.id} className="border border-border/50 overflow-hidden">
                          <div className="aspect-square bg-muted">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500x500/?art,digital';
                              }}
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline">{item.category}</Badge>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  removePortfolioItem(item.id);
                                  toast({
                                    title: "Item Deletado",
                                    description: "Item do portfólio foi removido.",
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {portfolioItems.length === 0 && (
                      <div className="text-center py-12">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum item do portfólio ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Terms of Service */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="w-6 h-6" />
                    Termos de Serviço
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSettings(prev => ({ ...prev, terms: !prev.terms }))}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editingSettings.terms ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingSettings.terms ? (
                  <div className="space-y-4">
                    <Textarea
                      value={settings.terms}
                      onChange={(e) => setSettings(prev => ({ ...prev, terms: e.target.value }))}
                      rows={10}
                      placeholder="Digite os termos de serviço..."
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          updateSiteSetting('terms_of_service', settings.terms);
                          setEditingSettings(prev => ({ ...prev, terms: false }));
                        }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="whitespace-pre-wrap">{settings.terms || 'Nenhum termo de serviço definido.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preços</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSettings(prev => ({ ...prev, pricing: !prev.pricing }))}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editingSettings.pricing ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingSettings.pricing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Serviço"
                        value={newPriceItem.service}
                        onChange={(e) => setNewPriceItem(prev => ({ ...prev, service: e.target.value }))}
                      />
                      <Input
                        placeholder="Preço"
                        value={newPriceItem.price}
                        onChange={(e) => setNewPriceItem(prev => ({ ...prev, price: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Descrição"
                          value={newPriceItem.description}
                          onChange={(e) => setNewPriceItem(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (newPriceItem.service && newPriceItem.price) {
                              setSettings(prev => ({
                                ...prev,
                                pricing: [...prev.pricing, newPriceItem]
                              }));
                              setNewPriceItem({service: '', price: '', description: ''});
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {settings.pricing.map((item, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{item.service}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{item.price}</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSettings(prev => ({
                                    ...prev,
                                    pricing: prev.pricing.filter((_, i) => i !== index)
                                  }));
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Button
                      onClick={() => {
                        updateSiteSetting('pricing_info', JSON.stringify(settings.pricing));
                        setEditingSettings(prev => ({ ...prev, pricing: false }));
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Preços
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.pricing.map((item, index) => (
                      <Card key={index} className="p-4">
                        <h3 className="font-semibold text-lg">{item.service}</h3>
                        <p className="text-2xl font-bold text-primary">{item.price}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </Card>
                    ))}
                    {settings.pricing.length === 0 && (
                      <p className="text-muted-foreground">Nenhum preço definido.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Hours */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Horário de Atendimento</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSettings(prev => ({ ...prev, workHours: !prev.workHours }))}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editingSettings.workHours ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingSettings.workHours ? (
                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <div key={day} className="flex items-center gap-4">
                        <Label className="w-24 capitalize">
                          {day === 'monday' ? 'Segunda' :
                           day === 'tuesday' ? 'Terça' :
                           day === 'wednesday' ? 'Quarta' :
                           day === 'thursday' ? 'Quinta' :
                           day === 'friday' ? 'Sexta' :
                           day === 'saturday' ? 'Sábado' : 'Domingo'}:
                        </Label>
                        <Input
                          value={settings.workHours[day] || ''}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            workHours: { ...prev.workHours, [day]: e.target.value }
                          }))}
                          placeholder="09:00-17:00 ou Fechado"
                        />
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        updateSiteSetting('work_hours', JSON.stringify(settings.workHours));
                        setEditingSettings(prev => ({ ...prev, workHours: false }));
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Horários
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.workHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize font-medium">
                          {day === 'monday' ? 'Segunda' :
                           day === 'tuesday' ? 'Terça' :
                           day === 'wednesday' ? 'Quarta' :
                           day === 'thursday' ? 'Quinta' :
                           day === 'friday' ? 'Sexta' :
                           day === 'saturday' ? 'Sábado' : 'Domingo'}:
                        </span>
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commission Status */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Status das Comissões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Status das Comissões</h3>
                    <p className="text-sm text-muted-foreground">
                      Alternar entre aberto/fechado para novos pedidos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {commissionsOpen ? (
                      <ToggleRight className="w-6 h-6 text-success" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                    )}
                    <Switch
                      checked={commissionsOpen}
                      onCheckedChange={(checked) => {
                        setCommissionsOpen(checked);
                        toast({
                          title: `Comissões ${checked ? 'Abertas' : 'Fechadas'}`,
                          description: `Pedidos de comissão estão agora ${checked ? 'habilitados' : 'desabilitados'}.`,
                        });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background Image */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Imagem de Fundo do Site</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSettings(prev => ({ ...prev, backgroundImage: !prev.backgroundImage }))}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editingSettings.backgroundImage ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingSettings.backgroundImage ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="background-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Clique para fazer upload de uma nova imagem de fundo
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Recomendado: 1920x1080 ou maior
                          </p>
                        </div>
                        <input
                          id="background-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundUpload}
                          className="hidden"
                          disabled={isUploadingBackground}
                        />
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingSettings(prev => ({ ...prev, backgroundImage: false }))}
                      >
                        Cancelar
                      </Button>
                      {settings.backgroundImage && (
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await supabase
                                .from('site_settings')
                                .delete()
                                .eq('key', 'background_image');
                              
                              setSettings(prev => ({ ...prev, backgroundImage: '' }));
                              setEditingSettings(prev => ({ ...prev, backgroundImage: false }));
                              
                              toast({
                                title: "Imagem de fundo removida!",
                                description: "A imagem de fundo foi removida com sucesso.",
                              });
                            } catch (error) {
                              console.error('Error removing background:', error);
                            }
                          }}
                        >
                          Remover Imagem
                        </Button>
                      )}
                    </div>
                    {isUploadingBackground && (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm">Fazendo upload...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {settings.backgroundImage ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Imagem atual:</p>
                        <div className="w-full h-32 bg-muted rounded-md overflow-hidden">
                          <img
                            src={settings.backgroundImage}
                            alt="Background preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21';
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma imagem de fundo definida.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <Badge key={category} variant="outline" className="justify-center">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;