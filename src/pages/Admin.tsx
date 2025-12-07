import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useOnlineUsers, usePresence } from '@/hooks/usePresence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Shield, Upload, Image, CheckCircle, AlertTriangle, ExternalLink, KeyRound, Link, Users, UserCheck, UserX, Settings, CheckSquare, Clock, Calendar, Infinity, PlusCircle, MinusCircle, Megaphone, ToggleLeft, ToggleRight, Wifi, WifiOff } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
type StreamingStatus = 'online' | 'maintenance';
type AccessType = 'credentials' | 'link_only';
type PlatformCategory = 'ai_tools' | 'streamings' | 'software' | 'bonus_courses';
const CATEGORY_LABELS: Record<PlatformCategory, string> = {
  'ai_tools': 'Ferramentas IAs & Variadas',
  'streamings': 'Streamings',
  'software': 'Software',
  'bonus_courses': 'Bônus: Cursos'
};
interface Platform {
  id: string;
  name: string;
  icon_url: string | null;
  cover_image_url: string | null;
  status: StreamingStatus;
  access_type: AccessType;
  category: PlatformCategory;
  login: string | null;
  password: string | null;
  website_url: string | null;
}
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  has_access: boolean;
  created_at: string;
  access_expires_at: string | null;
}
interface UserPlatformAccess {
  id: string;
  user_id: string;
  platform_id: string;
}
interface News {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Access duration options
const ACCESS_DURATION_OPTIONS = [{
  label: '2 dias',
  days: 2
}, {
  label: '3 dias',
  days: 3
}, {
  label: '7 dias',
  days: 7
}, {
  label: '15 dias',
  days: 15
}, {
  label: '30 dias',
  days: 30
}, {
  label: '90 dias',
  days: 90
}, {
  label: '180 dias',
  days: 180
}, {
  label: '1 ano',
  days: 365
}, {
  label: 'Vitalício',
  days: null
}];
export default function Admin() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userPlatformAccess, setUserPlatformAccess] = useState<UserPlatformAccess[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Platform Dialog
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [platformName, setPlatformName] = useState('');
  const [platformStatus, setPlatformStatus] = useState<StreamingStatus>('online');
  const [platformAccessType, setPlatformAccessType] = useState<AccessType>('credentials');
  const [platformCoverUrl, setPlatformCoverUrl] = useState('');
  const [platformLogin, setPlatformLogin] = useState('');
  const [platformPassword, setPlatformPassword] = useState('');
  const [platformWebsiteUrl, setPlatformWebsiteUrl] = useState('');
  const [platformCategory, setPlatformCategory] = useState<PlatformCategory>('streamings');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Permissions Dialog
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(30);
  const [customDays, setCustomDays] = useState<string>('');
  const [savingPermissions, setSavingPermissions] = useState(false);

  // News Dialog
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsIsActive, setNewsIsActive] = useState(true);
  const {
    user,
    isAdmin,
    signOut,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    onlineUsers,
    onlineCount
  } = useOnlineUsers();

  // Also track admin presence
  usePresence(user?.id, user?.email, 'Admin');
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);
  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);
  const fetchData = async () => {
    setLoading(true);
    const [platformsRes, usersRes, accessRes, newsRes] = await Promise.all([supabase.from('streaming_platforms').select('*').order('name'), supabase.from('profiles').select('*').order('created_at', {
      ascending: false
    }), supabase.from('user_platform_access').select('*'), supabase.from('news').select('*').order('created_at', {
      ascending: false
    })]);
    if (platformsRes.data) setPlatforms(platformsRes.data as Platform[]);
    if (usersRes.data) setUsers(usersRes.data as UserProfile[]);
    if (accessRes.data) setUserPlatformAccess(accessRes.data as UserPlatformAccess[]);
    if (newsRes.data) setNews(newsRes.data as News[]);
    setLoading(false);
  };
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Toggle user access
  const toggleUserAccess = async (userId: string, currentAccess: boolean) => {
    // When enabling access, set a default expiration of 30 days
    const updateData: { has_access: boolean; access_expires_at?: string | null } = {
      has_access: !currentAccess
    };
    
    // Only set expiration when enabling access (not when blocking)
    if (!currentAccess) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      updateData.access_expires_at = expirationDate.toISOString();
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
      
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar acesso',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: 'Sucesso',
      description: currentAccess ? 'Acesso bloqueado' : 'Acesso liberado (30 dias)'
    });
    fetchData();
  };

  // Delete user
  const deleteUser = async (userId: string, userEmail: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja deletar o usuário "${userEmail}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    // First delete user platform access
    await supabase.from('user_platform_access').delete().eq('user_id', userId);
    
    // Then delete the profile
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao deletar usuário',
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: 'Sucesso',
      description: 'Usuário deletado com sucesso'
    });
    fetchData();
  };

  // Open permissions dialog
  const openPermissionsDialog = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    const userAccess = userPlatformAccess.filter(a => a.user_id === userProfile.id).map(a => a.platform_id);
    setSelectedPlatforms(userAccess);

    // Set current duration based on expiration
    if (userProfile.access_expires_at === null) {
      setSelectedDuration(null); // Lifetime
    } else {
      const expiresAt = new Date(userProfile.access_expires_at);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      setSelectedDuration(daysRemaining);
    }
    setCustomDays('');
    setPermissionsDialogOpen(true);
  };

  // Toggle platform selection
  const togglePlatformSelection = (platformId: string) => {
    setSelectedPlatforms(prev => prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]);
  };

  // Select all platforms
  const selectAllPlatforms = () => {
    setSelectedPlatforms(platforms.map(p => p.id));
  };

  // Deselect all platforms
  const deselectAllPlatforms = () => {
    setSelectedPlatforms([]);
  };

  // Save user permissions
  const saveUserPermissions = async () => {
    if (!selectedUser) return;
    setSavingPermissions(true);

    // Get current access for this user
    const currentAccess = userPlatformAccess.filter(a => a.user_id === selectedUser.id);
    const currentPlatformIds = currentAccess.map(a => a.platform_id);

    // Platforms to add
    const toAdd = selectedPlatforms.filter(id => !currentPlatformIds.includes(id));
    // Platforms to remove
    const toRemove = currentPlatformIds.filter(id => !selectedPlatforms.includes(id));

    // Calculate expiration date
    let accessExpiresAt: string | null = null;
    const daysToAdd = customDays ? parseInt(customDays) : selectedDuration;
    if (daysToAdd !== null && daysToAdd > 0) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + daysToAdd);
      accessExpiresAt = expirationDate.toISOString();
    }
    try {
      // Remove access
      if (toRemove.length > 0) {
        const {
          error: deleteError
        } = await supabase.from('user_platform_access').delete().eq('user_id', selectedUser.id).in('platform_id', toRemove);
        if (deleteError) throw deleteError;
      }

      // Add access
      if (toAdd.length > 0) {
        const newAccess = toAdd.map(platformId => ({
          user_id: selectedUser.id,
          platform_id: platformId
        }));
        const {
          error: insertError
        } = await supabase.from('user_platform_access').insert(newAccess);
        if (insertError) throw insertError;
      }

      // Update has_access and expiration date
      const hasAnyAccess = selectedPlatforms.length > 0;
      await supabase.from('profiles').update({
        has_access: hasAnyAccess,
        access_expires_at: hasAnyAccess ? accessExpiresAt : null
      }).eq('id', selectedUser.id);
      const durationLabel = daysToAdd === null ? 'Vitalício' : `${daysToAdd} dias`;
      toast({
        title: 'Sucesso',
        description: `Permissões atualizadas (${durationLabel})`
      });
      setPermissionsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar permissões',
        variant: 'destructive'
      });
    } finally {
      setSavingPermissions(false);
    }
  };

  // Get access status text
  const getAccessStatusText = (userProfile: UserProfile) => {
    if (!userProfile.has_access) return {
      text: 'Bloqueado',
      color: 'bg-red-500/10 text-red-500',
      icon: UserX
    };
    if (userProfile.access_expires_at === null) {
      return {
        text: 'Vitalício',
        color: 'bg-purple-500/10 text-purple-400',
        icon: Infinity
      };
    }
    const expiresAt = new Date(userProfile.access_expires_at);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0) {
      return {
        text: 'Expirado',
        color: 'bg-red-500/10 text-red-500',
        icon: Clock
      };
    }
    if (daysRemaining <= 7) {
      return {
        text: `${daysRemaining}d restantes`,
        color: 'bg-yellow-500/10 text-yellow-500',
        icon: Clock
      };
    }
    return {
      text: `${daysRemaining}d restantes`,
      color: 'bg-green-500/10 text-green-500',
      icon: Calendar
    };
  };

  // Add or remove days from user access
  const modifyUserDays = async (userProfile: UserProfile, daysToAdd: number) => {
    let newExpirationDate: Date;
    if (userProfile.access_expires_at === null) {
      // User has lifetime access, can't modify
      toast({
        title: 'Aviso',
        description: 'Usuário possui acesso vitalício. Edite as permissões para alterar.',
        variant: 'destructive'
      });
      return;
    }
    const currentExpiration = new Date(userProfile.access_expires_at);
    const now = new Date();

    // If expired, start from now
    if (currentExpiration < now) {
      newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + daysToAdd);
    } else {
      // Add/remove from current expiration
      newExpirationDate = new Date(currentExpiration);
      newExpirationDate.setDate(newExpirationDate.getDate() + daysToAdd);
    }

    // Ensure expiration is not in the past when removing days
    if (newExpirationDate < now) {
      newExpirationDate = now;
    }
    const {
      error
    } = await supabase.from('profiles').update({
      access_expires_at: newExpirationDate.toISOString()
    }).eq('id', userProfile.id);
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao modificar dias de acesso',
        variant: 'destructive'
      });
      return;
    }
    const action = daysToAdd > 0 ? 'adicionados' : 'removidos';
    toast({
      title: 'Sucesso',
      description: `${Math.abs(daysToAdd)} dias ${action}`
    });
    fetchData();
  };

  // Get number of platforms user has access to
  const getUserPlatformCount = (userId: string) => {
    return userPlatformAccess.filter(a => a.user_id === userId).length;
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo de imagem',
        variant: 'destructive'
      });
      return;
    }
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const {
      data,
      error
    } = await supabase.storage.from('streaming-covers').upload(fileName, file);
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao fazer upload da imagem',
        variant: 'destructive'
      });
      setUploadingImage(false);
      return;
    }
    const {
      data: urlData
    } = supabase.storage.from('streaming-covers').getPublicUrl(data.path);
    setPlatformCoverUrl(urlData.publicUrl);
    setUploadingImage(false);
    toast({
      title: 'Sucesso',
      description: 'Imagem carregada'
    });
  };

  // Platform CRUD
  const openPlatformDialog = (platform?: Platform) => {
    if (platform) {
      setEditingPlatform(platform);
      setPlatformName(platform.name);
      setPlatformStatus(platform.status || 'online');
      setPlatformAccessType(platform.access_type || 'credentials');
      setPlatformCoverUrl(platform.cover_image_url || '');
      setPlatformLogin(platform.login || '');
      setPlatformPassword(platform.password || '');
      setPlatformWebsiteUrl(platform.website_url || '');
      setPlatformCategory(platform.category || 'streamings');
    } else {
      setEditingPlatform(null);
      setPlatformName('');
      setPlatformStatus('online');
      setPlatformAccessType('credentials');
      setPlatformCoverUrl('');
      setPlatformLogin('');
      setPlatformPassword('');
      setPlatformWebsiteUrl('');
      setPlatformCategory('streamings');
    }
    setPlatformDialogOpen(true);
  };
  const savePlatform = async () => {
    if (!platformName.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive'
      });
      return;
    }
    if (platformAccessType === 'link_only' && !platformWebsiteUrl.trim()) {
      toast({
        title: 'Erro',
        description: 'Link do site é obrigatório para acesso por link',
        variant: 'destructive'
      });
      return;
    }
    const platformData = {
      name: platformName,
      status: platformStatus,
      access_type: platformAccessType,
      category: platformCategory,
      cover_image_url: platformCoverUrl || null,
      login: platformAccessType === 'credentials' ? platformLogin || null : null,
      password: platformAccessType === 'credentials' ? platformPassword || null : null,
      website_url: platformWebsiteUrl || null
    };
    if (editingPlatform) {
      const {
        error
      } = await supabase.from('streaming_platforms').update(platformData).eq('id', editingPlatform.id);
      if (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao atualizar plataforma',
          variant: 'destructive'
        });
        return;
      }
      toast({
        title: 'Sucesso',
        description: 'Plataforma atualizada'
      });
    } else {
      const {
        error
      } = await supabase.from('streaming_platforms').insert(platformData);
      if (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao criar plataforma',
          variant: 'destructive'
        });
        return;
      }
      toast({
        title: 'Sucesso',
        description: 'Plataforma criada'
      });
    }
    setPlatformDialogOpen(false);
    fetchData();
  };
  const deletePlatform = async (id: string) => {
    const {
      error
    } = await supabase.from('streaming_platforms').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao deletar plataforma',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: 'Sucesso',
      description: 'Plataforma deletada'
    });
    fetchData();
  };
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // News CRUD
  const openNewsDialog = (newsItem?: News) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setNewsTitle(newsItem.title);
      setNewsContent(newsItem.content);
      setNewsIsActive(newsItem.is_active);
    } else {
      setEditingNews(null);
      setNewsTitle('');
      setNewsContent('');
      setNewsIsActive(true);
    }
    setNewsDialogOpen(true);
  };
  const saveNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      toast({
        title: 'Erro',
        description: 'Título e conteúdo são obrigatórios',
        variant: 'destructive'
      });
      return;
    }
    const newsData = {
      title: newsTitle.trim(),
      content: newsContent.trim(),
      is_active: newsIsActive
    };
    if (editingNews) {
      const {
        error
      } = await supabase.from('news').update(newsData).eq('id', editingNews.id);
      if (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao atualizar notícia',
          variant: 'destructive'
        });
        return;
      }
      toast({
        title: 'Sucesso',
        description: 'Notícia atualizada'
      });
    } else {
      const {
        error
      } = await supabase.from('news').insert(newsData);
      if (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao criar notícia',
          variant: 'destructive'
        });
        return;
      }
      toast({
        title: 'Sucesso',
        description: 'Notícia criada'
      });
    }
    setNewsDialogOpen(false);
    fetchData();
  };
  const deleteNews = async (id: string) => {
    const {
      error
    } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao deletar notícia',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: 'Sucesso',
      description: 'Notícia deletada'
    });
    fetchData();
  };
  const toggleNewsActive = async (newsItem: News) => {
    const {
      error
    } = await supabase.from('news').update({
      is_active: !newsItem.is_active
    }).eq('id', newsItem.id);
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao alterar status',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: 'Sucesso',
      description: newsItem.is_active ? 'Notícia desativada' : 'Notícia ativada'
    });
    fetchData();
  };
  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  const usersWithAccess = users.filter(u => u.has_access).length;
  const usersWithoutAccess = users.filter(u => !u.has_access).length;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                JoviTools GPainel    
              </h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-border hover:bg-destructive hover:text-destructive-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="platforms" className="gap-2">
              <Image className="w-4 h-4" />
              Plataformas
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Usuários ({users.length})
            </TabsTrigger>
            <TabsTrigger value="online" className="gap-2">
              <Wifi className="w-4 h-4" />
              Online ({onlineCount})
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Megaphone className="w-4 h-4" />
              Notícias ({news.length})
            </TabsTrigger>
          </TabsList>

          {/* Platforms Tab */}
          <TabsContent value="platforms">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Gerenciar Plataformas</CardTitle>
                <Button onClick={() => openPlatformDialog()} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Plataforma
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Capa</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {platforms.map(platform => <TableRow key={platform.id}>
                          <TableCell>
                            {platform.cover_image_url ? <img src={platform.cover_image_url} alt={platform.name} className="w-16 h-10 object-cover rounded-md" /> : <div className="w-16 h-10 bg-muted rounded-md flex items-center justify-center">
                                <Image className="w-5 h-5 text-muted-foreground" />
                              </div>}
                          </TableCell>
                          <TableCell className="font-medium">{platform.name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                              {CATEGORY_LABELS[platform.category] || platform.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${platform.access_type === 'credentials' ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-400'}`}>
                              {platform.access_type === 'credentials' ? <>
                                  <KeyRound className="w-3 h-3" />
                                  Login/Senha
                                </> : <>
                                  <Link className="w-3 h-3" />
                                  Apenas Link
                                </>}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {platform.access_type === 'credentials' ? <div className="space-y-1">
                                <p className="text-muted-foreground">{platform.login || '-'}</p>
                                {platform.password && <div className="flex items-center gap-1 font-mono text-xs">
                                    {showPasswords[platform.id] ? platform.password : '••••••••'}
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => togglePasswordVisibility(platform.id)}>
                                      {showPasswords[platform.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </Button>
                                  </div>}
                              </div> : platform.website_url ? <a href={platform.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  Abrir
                                </a> : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${platform.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {platform.status === 'online' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {platform.status === 'online' ? 'Online' : 'Manutenção'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openPlatformDialog(platform)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deletePlatform(platform.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>)}
                      {platforms.length === 0 && <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Nenhuma plataforma cadastrada
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{users.length}</p>
                      <p className="text-sm text-muted-foreground">Total de Usuários</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{usersWithAccess}</p>
                      <p className="text-sm text-muted-foreground">Com Acesso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <UserX className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{usersWithoutAccess}</p>
                      <p className="text-sm text-muted-foreground">Sem Acesso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Gerenciar Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cadastro</TableHead>
                        <TableHead>Streamings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(userProfile => <TableRow key={userProfile.id}>
                          <TableCell className="font-medium">
                            {userProfile.name || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {userProfile.email}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {getUserPlatformCount(userProfile.id)} / {platforms.length}
                            </span>
                          </TableCell>
                          <TableCell>
                            {(() => {
                          const status = getAccessStatusText(userProfile);
                          const StatusIcon = status.icon;
                          return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.text}
                                </span>;
                        })()}
                          </TableCell>
                          <TableCell>
                            {userProfile.has_access && userProfile.access_expires_at !== null && <div className="flex items-center gap-1">
                                {/* Remove days buttons */}
                                <div className="flex flex-col gap-0.5">
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => modifyUserDays(userProfile, -7)}>
                                    -7d
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => modifyUserDays(userProfile, -30)}>
                                    -30d
                                  </Button>
                                </div>
                                
                                {/* Add days buttons */}
                                <div className="flex flex-col gap-0.5">
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => modifyUserDays(userProfile, 7)}>
                                    +7d
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => modifyUserDays(userProfile, 30)}>
                                    +30d
                                  </Button>
                                </div>
                                
                                {/* Quick add/remove icons */}
                                <div className="flex flex-col gap-0.5 ml-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => modifyUserDays(userProfile, 90)} title="Adicionar 90 dias">
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => modifyUserDays(userProfile, -90)} title="Remover 90 dias">
                                    <MinusCircle className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>}
                            {userProfile.access_expires_at === null && userProfile.has_access && <span className="text-xs text-purple-400">∞</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openPermissionsDialog(userProfile)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Permissões
                              </Button>
                              <Button variant={userProfile.has_access ? "destructive" : "default"} size="sm" onClick={() => toggleUserAccess(userProfile.id, userProfile.has_access)}>
                                {userProfile.has_access ? <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Bloquear
                                  </> : <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Liberar
                                  </>}
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteUser(userProfile.id, userProfile.email)} title="Deletar usuário">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>)}
                      {users.length === 0 && <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            Nenhum usuário cadastrado
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Online Users Tab */}
          <TabsContent value="online">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                      <Wifi className="w-7 h-7 text-green-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-500">{onlineCount}</p>
                      <p className="text-sm text-muted-foreground">Usuários Online Agora</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{users.length}</p>
                      <p className="text-sm text-muted-foreground">Total Registrados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-green-500" />
                  Usuários Conectados em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                {onlineCount === 0 ? <div className="text-center py-12">
                    <WifiOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Nenhum usuário online no momento</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Os usuários aparecerão aqui quando acessarem o painel</p>
                  </div> : <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Conectado desde</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {onlineUsers.map(onlineUser => <TableRow key={onlineUser.user_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-green-500 text-sm font-medium">Online</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{onlineUser.user_name}</TableCell>
                            <TableCell className="text-muted-foreground">{onlineUser.user_email}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(onlineUser.online_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Gerenciar Notícias</CardTitle>
                <Button onClick={() => openNewsDialog()} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Notícia
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Conteúdo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {news.map(newsItem => <TableRow key={newsItem.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {newsItem.title}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-muted-foreground">
                            {newsItem.content}
                          </TableCell>
                          <TableCell>
                            <button onClick={() => toggleNewsActive(newsItem)} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${newsItem.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                              {newsItem.is_active ? <>
                                  <ToggleRight className="w-3 h-3" />
                                  Ativo
                                </> : <>
                                  <ToggleLeft className="w-3 h-3" />
                                  Inativo
                                </>}
                            </button>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(newsItem.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => openNewsDialog(newsItem)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => deleteNews(newsItem.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>)}
                      {news.length === 0 && <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Nenhuma notícia criada
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Platform Dialog */}
      <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingPlatform ? 'Editar Plataforma' : 'Nova Plataforma'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Nome da Plataforma *</Label>
              <Input id="platform-name" value={platformName} onChange={e => setPlatformName(e.target.value)} placeholder="Ex: Netflix, ChatGPT, Canva..." className="bg-background/50 border-border" />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="platform-category">Categoria *</Label>
              <select id="platform-category" value={platformCategory} onChange={e => setPlatformCategory(e.target.value as PlatformCategory)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            {/* Access Type Selection */}
            <div className="space-y-2">
              <Label>Tipo de Acesso *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPlatformAccessType('credentials')} className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${platformAccessType === 'credentials' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'}`}>
                  <KeyRound className="w-6 h-6" />
                  <span className="text-sm font-medium">Login e Senha</span>
                </button>
                <button type="button" onClick={() => setPlatformAccessType('link_only')} className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${platformAccessType === 'link_only' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-border bg-background/50 text-muted-foreground hover:border-purple-500/50'}`}>
                  <Link className="w-6 h-6" />
                  <span className="text-sm font-medium">Apenas Link</span>
                </button>
              </div>
            </div>

            {/* Conditional Fields based on Access Type */}
            {platformAccessType === 'credentials' && <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-login">Login</Label>
                  <Input id="platform-login" value={platformLogin} onChange={e => setPlatformLogin(e.target.value)} placeholder="Email ou usuário" className="bg-background/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-password">Senha</Label>
                  <Input id="platform-password" value={platformPassword} onChange={e => setPlatformPassword(e.target.value)} placeholder="Senha" className="bg-background/50 border-border" />
                </div>
              </div>}

            <div className="space-y-2">
              <Label htmlFor="platform-website">
                Link do Site {platformAccessType === 'link_only' ? '*' : ''}
              </Label>
              <Input id="platform-website" value={platformWebsiteUrl} onChange={e => setPlatformWebsiteUrl(e.target.value)} placeholder="https://www.netflix.com" className="bg-background/50 border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-status">Status</Label>
              <select id="platform-status" value={platformStatus} onChange={e => setPlatformStatus(e.target.value as StreamingStatus)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground">
                <option value="online">Online</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <div className="flex flex-col gap-3">
                {platformCoverUrl && <div className="relative">
                    <img src={platformCoverUrl} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setPlatformCoverUrl('')}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="w-full">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploadingImage ? 'Enviando...' : 'Fazer upload de imagem'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlatformDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={savePlatform}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Permissões de Streaming
            </DialogTitle>
            {selectedUser && <p className="text-sm text-muted-foreground">
                {selectedUser.name || selectedUser.email}
              </p>}
          </DialogHeader>
          <div className="space-y-4">
            {/* Duration Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duração do Acesso
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {ACCESS_DURATION_OPTIONS.map(option => <button key={option.label} type="button" onClick={() => {
                setSelectedDuration(option.days);
                setCustomDays('');
              }} className={`p-2 rounded-lg border text-sm font-medium transition-all ${selectedDuration === option.days && !customDays ? option.days === null ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'}`}>
                    {option.days === null && <Infinity className="w-3 h-3 inline mr-1" />}
                    {option.label}
                  </button>)}
              </div>
              
              {/* Custom Days Input */}
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Dias personalizados" value={customDays} onChange={e => {
                setCustomDays(e.target.value);
                if (e.target.value) {
                  setSelectedDuration(parseInt(e.target.value));
                }
              }} min="1" max="9999" className="bg-background/50 border-border" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">dias</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Selecione as streamings que o usuário poderá acessar
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllPlatforms}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Todas
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAllPlatforms}>
                  Limpar
                </Button>
              </div>
            </div>
            
            <div className="border border-border rounded-lg divide-y divide-border max-h-[300px] overflow-y-auto">
              {platforms.map(platform => <label key={platform.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                  <Checkbox checked={selectedPlatforms.includes(platform.id)} onCheckedChange={() => togglePlatformSelection(platform.id)} />
                  <div className="flex items-center gap-3 flex-1">
                    {platform.cover_image_url ? <img src={platform.cover_image_url} alt={platform.name} className="w-10 h-6 object-cover rounded" /> : <div className="w-10 h-6 bg-muted rounded flex items-center justify-center">
                        <Image className="w-3 h-3 text-muted-foreground" />
                      </div>}
                    <span className="font-medium text-sm">{platform.name}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${platform.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {platform.status === 'online' ? 'Online' : 'Manutenção'}
                  </span>
                </label>)}
              {platforms.length === 0 && <p className="text-center text-muted-foreground py-8">
                  Nenhuma plataforma cadastrada
                </p>}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              {selectedPlatforms.length} de {platforms.length} streamings selecionadas
              {(customDays || selectedDuration !== null) && <span className="ml-2">
                  • {customDays ? `${customDays} dias` : selectedDuration === null ? 'Vitalício' : `${selectedDuration} dias`}
                </span>}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveUserPermissions} disabled={savingPermissions}>
              {savingPermissions ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* News Dialog */}
      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingNews ? 'Editar Notícia' : 'Nova Notícia'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="news-title">Título *</Label>
              <Input id="news-title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="Ex: Manutenção programada..." className="bg-background/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-content">Conteúdo *</Label>
              <Textarea id="news-content" value={newsContent} onChange={e => setNewsContent(e.target.value)} placeholder="Descreva os detalhes do aviso..." className="bg-background/50 border-border min-h-[120px]" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="news-active" className="cursor-pointer">Publicar imediatamente</Label>
              <button type="button" onClick={() => setNewsIsActive(!newsIsActive)} className={`relative w-11 h-6 rounded-full transition-colors ${newsIsActive ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${newsIsActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveNews}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}