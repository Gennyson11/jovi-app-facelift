import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tv, LogOut, Eye, EyeOff, Copy, Loader2, CheckCircle, AlertTriangle, ExternalLink, KeyRound, Link, Lock, Clock, Megaphone, X } from 'lucide-react';
type StreamingStatus = 'online' | 'maintenance';
type AccessType = 'credentials' | 'link_only';
type PlatformCategory = 'ai_tools' | 'streamings' | 'software' | 'bonus_courses';
const CATEGORY_CONFIG: Record<PlatformCategory, {
  label: string;
  icon: string;
  color: string;
}> = {
  'ai_tools': {
    label: 'FERRAMENTAS IAs & VARIADAS',
    icon: '🤖',
    color: 'from-purple-500 to-pink-500'
  },
  'streamings': {
    label: 'STREAMINGS',
    icon: '📺',
    color: 'from-red-500 to-orange-500'
  },
  'software': {
    label: 'SOFTWARE',
    icon: '💻',
    color: 'from-blue-500 to-cyan-500'
  },
  'bonus_courses': {
    label: 'Bônus: Cursos',
    icon: '🎓',
    color: 'from-green-500 to-emerald-500'
  }
};
const CATEGORY_ORDER: PlatformCategory[] = ['ai_tools', 'streamings', 'software', 'bonus_courses'];
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
  access_expires_at: string | null;
}
interface News {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}
const platformIcons: Record<string, string> = {
  'Netflix': '🎬',
  'Amazon Prime Video': '📦',
  'Disney+': '🏰',
  'HBO Max': '🎭',
  'Paramount+': '⭐',
  'Crunchyroll': '🍙'
};
export default function Dashboard() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPlatformAccess, setUserPlatformAccess] = useState<string[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [dismissedNews, setDismissedNews] = useState<string[]>([]);
  const {
    user,
    signOut,
    loading: authLoading,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  const fetchData = async () => {
    setLoading(true);

    // Fetch platforms and news
    const [platformsRes, newsRes] = await Promise.all([supabase.from('streaming_platforms').select('*').order('name'), supabase.from('news').select('*').eq('is_active', true).order('created_at', {
      ascending: false
    })]);
    if (platformsRes.data) setPlatforms(platformsRes.data as Platform[]);
    if (newsRes.data) setNews(newsRes.data as News[]);

    // Fetch user profile to check access
    const {
      data: profileData
    } = await supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle();
    if (profileData) {
      setUserProfile(profileData as UserProfile);

      // Fetch user's platform access
      const {
        data: accessData
      } = await supabase.from('user_platform_access').select('platform_id').eq('user_id', profileData.id);
      if (accessData) {
        setUserPlatformAccess(accessData.map(a => a.platform_id));
      }
    }
    setLoading(false);
  };
  const dismissNewsItem = (newsId: string) => {
    setDismissedNews(prev => [...prev, newsId]);
  };
  const visibleNews = news.filter(n => !dismissedNews.includes(n.id));
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '✅ Copiado!',
      description: `${label} copiado para a área de transferência`
    });
  };

  // Check if user's access has expired
  const isAccessExpired = () => {
    if (!userProfile) return true;
    if (!userProfile.has_access) return true;
    if (userProfile.access_expires_at === null) return false; // Lifetime access

    const expiresAt = new Date(userProfile.access_expires_at);
    return expiresAt < new Date();
  };

  // Check if user has access to a specific platform
  const hasPlatformSpecificAccess = (platformId: string) => {
    if (isAdmin) return true;
    if (isAccessExpired()) return false;
    return userPlatformAccess.includes(platformId);
  };
  const handlePlatformClick = (platform: Platform) => {
    // Check if user has access to this specific platform
    if (!hasPlatformSpecificAccess(platform.id)) {
      toast({
        title: '🔒 Acesso Bloqueado',
        description: 'Você não tem permissão para acessar esta streaming.',
        variant: 'destructive'
      });
      return;
    }
    const isMaintenance = platform.status === 'maintenance';
    if (isMaintenance) return;
    if (platform.access_type === 'link_only' && platform.website_url) {
      window.open(platform.website_url, '_blank');
    } else if (platform.access_type === 'credentials' && platform.login && platform.password) {
      setSelectedPlatform(platform);
    }
  };
  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  const hasAccess = isAdmin || userProfile?.has_access && !isAccessExpired();
  const accessExpired = userProfile?.has_access && isAccessExpired();

  // Get remaining days text
  const getRemainingDaysText = () => {
    if (!userProfile || !userProfile.has_access) return null;
    if (userProfile.access_expires_at === null) return 'Acesso Vitalício';
    const expiresAt = new Date(userProfile.access_expires_at);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0) return 'Acesso Expirado';
    if (daysRemaining === 1) return '1 dia restante';
    return `${daysRemaining} dias restantes`;
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-magenta to-primary flex items-center justify-center shadow-lg shadow-magenta/30">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold bg-gradient-to-r from-cyan to-primary bg-clip-text text-transparent">
                Painel de Controle
              </h1>
              <p className="text-sm text-muted-foreground">
                {userProfile ? `Olá, ${userProfile.name || userProfile.email}` : 'Vamos criar algo incrível juntos'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasAccess && getRemainingDaysText() && <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${userProfile?.access_expires_at === null ? 'bg-purple-500/10 text-purple-400' : 'bg-primary/10 text-primary'}`}>
                {getRemainingDaysText()}
              </span>}
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border hover:bg-destructive hover:text-destructive-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Access Expired Banner */}
        {accessExpired && <div className="mb-6 p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-500 mb-2">
              Acesso Expirado
            </h3>
            <p className="text-red-500/80 mb-4">
              Seu período de acesso terminou. Renove para continuar acessando as plataformas.
            </p>
            <Button onClick={() => window.open('https://bit.ly/whatsapp-suportejt', '_blank')} className="bg-green-500 hover:bg-green-600 text-white">
              Renovar Acesso via WhatsApp
            </Button>
          </div>}

        {/* Access Blocked Banner */}
        {!userProfile?.has_access && <div className="mb-6 p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
            <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-yellow-500 mb-2">
              Acesso Pendente
            </h3>
            <p className="text-yellow-500/80">
              Seu cadastro foi recebido! Aguarde a liberação do acesso pelo administrador.
            </p>
          </div>}

        {/* Account Validity Card */}
        {hasAccess && userProfile && <div className="mb-6 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validade da Sua Conta</p>
                  <p className="text-xl font-bold text-green-500">
                    {(() => {
                  if (userProfile.access_expires_at === null) {
                    return 'Acesso Vitalício';
                  }
                  const expiresAt = new Date(userProfile.access_expires_at);
                  const now = new Date();
                  const diffMs = expiresAt.getTime() - now.getTime();
                  if (diffMs <= 0) return 'Expirado';
                  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const hours = Math.floor(diffMs % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
                  if (days > 0) {
                    return `${days}d ${hours}h restantes`;
                  }
                  return `${hours}h restantes`;
                })()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {userProfile.access_expires_at === null ? 'Sem data de expiração' : `Expira em ${new Date(userProfile.access_expires_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })} às ${new Date(userProfile.access_expires_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full border text-sm font-medium ${userProfile.access_expires_at === null ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-green-500/30 text-green-500 bg-green-500/10'}`}>
                {userProfile.access_expires_at === null ? '∞ Vitalício' : '✓ Ativa'}
              </div>
            </div>
          </div>}

        {/* Warning Banner */}
        {hasAccess && <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
            <p className="text-destructive font-medium">
              ⚠️ ATENÇÃO: É proibido revender ou compartilhar este acesso.
            </p>
            <p className="text-destructive/80 mt-1">
              🔍 Todos os acessos são monitorados e o IP é rastreável.
            </p>
            <p className="text-destructive/80 mt-1">
              ❌ Qualquer compartilhamento resultará na perda imediata do acesso.
            </p>
          </div>}

        {/* News/Announcements Section */}
        {visibleNews.length > 0 && <div className="mb-6 space-y-3">
            {visibleNews.map(newsItem => <div key={newsItem.id} className="relative rounded-xl overflow-hidden border-2 border-orange-500/50 bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20 shadow-lg shadow-orange-500/20">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/40 animate-pulse">
                      <Megaphone className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/30 border border-orange-400 mb-2">
                        <span className="text-orange-300 text-xs">🔔</span>
                        <span className="text-orange-300 font-bold text-xs uppercase tracking-wide">AVISO IMPORTANTE</span>
                      </div>
                      <h3 className="font-bold text-orange-400 text-lg mb-1">
                        {newsItem.title}
                      </h3>
                      <p className="text-orange-300 text-sm whitespace-pre-wrap font-medium">
                        {newsItem.content}
                      </p>
                      <p className="text-xs text-orange-300/60 mt-2 flex items-center gap-1">
                        📅 {new Date(newsItem.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}

        {/* Categories */}
        {CATEGORY_ORDER.map(categoryKey => {
        const categoryPlatforms = platforms.filter(p => p.category === categoryKey);
        if (categoryPlatforms.length === 0) return null;
        const config = CATEGORY_CONFIG[categoryKey];
        return <div key={categoryKey} className="mb-10">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-xl">{config.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {config.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {categoryPlatforms.length} {categoryPlatforms.length === 1 ? 'plataforma' : 'plataformas'}
                  </p>
                </div>
              </div>

              {/* Platforms Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPlatforms.map(platform => {
              const hasPlatformAccess = platform.access_type === 'link_only' ? !!platform.website_url : !!(platform.login && platform.password);
              const isMaintenance = platform.status === 'maintenance';
              const isBlocked = !hasPlatformSpecificAccess(platform.id);
              return <div key={platform.id} className={`group cursor-pointer transition-all duration-300 ${!hasPlatformAccess || isMaintenance || isBlocked ? 'opacity-60' : ''}`} onClick={() => {
                if (isBlocked) {
                  window.open('https://bit.ly/whatsapp-suportejt', '_blank');
                } else {
                  handlePlatformClick(platform);
                }
              }}>
                      {/* Card Container */}
                      <div className={`bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 ${isBlocked ? 'grayscale hover:grayscale-0 hover:border-green-500/50' : 'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10'}`}>
                        {/* Cover Image Area */}
                        <div className="relative aspect-video bg-gradient-to-br from-secondary to-background">
                          {platform.cover_image_url ? <img src={platform.cover_image_url} alt={platform.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                              <span className="text-6xl">{platformIcons[platform.name] || config.icon}</span>
                            </div>}

                          {/* Blocked Overlay */}
                          {isBlocked && <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 group-hover:bg-green-900/80 transition-colors">
                              <Lock className="w-8 h-8 text-white/80 group-hover:hidden" />
                              <ExternalLink className="w-8 h-8 text-green-400 hidden group-hover:block animate-pulse" />
                              <div className="bg-green-500 px-4 py-2 rounded-lg shadow-lg shadow-green-500/30">
                                <p className="text-white text-sm font-bold text-center">
                                  🔓 Clique aqui para adquirir seu acesso
                                </p>
                              </div>
                            </div>}

                          {/* Access Type Badge */}
                          {!isBlocked && <div className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${platform.access_type === 'credentials' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                              {platform.access_type === 'credentials' ? <KeyRound className="w-3 h-3" /> : <Link className="w-3 h-3" />}
                            </div>}
                        </div>

                        {/* Status Bar - Below Image */}
                        <div className={`w-full py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold ${platform.status === 'online' ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-black'}`}>
                          {platform.status === 'online' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          {platform.status === 'online' ? 'ONLINE' : 'MANUTENÇÃO'}
                        </div>

                        {/* Footer */}
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-display font-bold text-foreground uppercase tracking-wide">
                              {platform.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {isBlocked ? 'Acesso bloqueado' : isMaintenance ? 'Em manutenção' : hasPlatformAccess ? platform.access_type === 'link_only' ? 'Clique para acessar' : 'Clique para ver credencial' : 'Sem acesso configurado'}
                            </p>
                          </div>
                          {!isBlocked && hasPlatformAccess && !isMaintenance && <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              {platform.access_type === 'link_only' ? <ExternalLink className="w-5 h-5 text-primary" /> : <Eye className="w-5 h-5 text-primary" />}
                            </div>}
                        </div>
                      </div>
                    </div>;
            })}
              </div>
            </div>;
      })}
      </main>

      {/* Credential Dialog - Only for credentials type */}
      <Dialog open={!!selectedPlatform} onOpenChange={() => {
      setSelectedPlatform(null);
      setShowPassword(false);
    }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              {selectedPlatform?.cover_image_url ? <img src={selectedPlatform.cover_image_url} alt={selectedPlatform.name} className="w-10 h-10 object-cover rounded" /> : <span className="text-3xl">
                  {selectedPlatform && platformIcons[selectedPlatform.name]}
                </span>}
              {selectedPlatform?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlatform?.login && selectedPlatform?.password ? <div className="space-y-4 mt-4">
              {/* Copy All Button */}
              <Button className="w-full" onClick={() => {
            navigator.clipboard.writeText(`Login: ${selectedPlatform.login}\nSenha: ${selectedPlatform.password}`);
            toast({
              title: '✅ Copiado!',
              description: 'Login e senha copiados para a área de transferência'
            });
          }}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Login e Senha
              </Button>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Login</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background/50 border border-border rounded-md px-3 py-2 text-foreground cursor-pointer hover:bg-background/70 transition-colors" onClick={() => copyToClipboard(selectedPlatform.login!, 'Login')}>
                    {selectedPlatform.login}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(selectedPlatform.login!, 'Login')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Senha</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background/50 border border-border rounded-md px-3 py-2 text-foreground font-mono cursor-pointer hover:bg-background/70 transition-colors" onClick={() => copyToClipboard(selectedPlatform.password!, 'Senha')}>
                    {showPassword ? selectedPlatform.password : '••••••••'}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(selectedPlatform.password!, 'Senha')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Website Link */}
              {selectedPlatform.website_url && <Button variant="outline" className="w-full" onClick={() => window.open(selectedPlatform.website_url!, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Site
                </Button>}
            </div> : <p className="text-muted-foreground">
              Nenhuma credencial cadastrada para esta plataforma.
            </p>}
        </DialogContent>
      </Dialog>
    </div>;
}