import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tv, LogOut, Eye, EyeOff, Copy, Loader2, CheckCircle, AlertTriangle, ExternalLink, KeyRound, Link, Lock } from 'lucide-react';

type StreamingStatus = 'online' | 'maintenance';
type AccessType = 'credentials' | 'link_only';

interface Platform {
  id: string;
  name: string;
  icon_url: string | null;
  cover_image_url: string | null;
  status: StreamingStatus;
  access_type: AccessType;
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
}

const platformIcons: Record<string, string> = {
  'Netflix': '🎬',
  'Amazon Prime Video': '📦',
  'Disney+': '🏰',
  'HBO Max': '🎭',
  'Paramount+': '⭐',
  'Crunchyroll': '🍙',
};

export default function Dashboard() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPlatformAccess, setUserPlatformAccess] = useState<string[]>([]);
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    
    // Fetch platforms
    const { data: platformsData } = await supabase
      .from('streaming_platforms')
      .select('*')
      .order('name');

    if (platformsData) setPlatforms(platformsData as Platform[]);

    // Fetch user profile to check access
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (profileData) {
      setUserProfile(profileData as UserProfile);
      
      // Fetch user's platform access
      const { data: accessData } = await supabase
        .from('user_platform_access')
        .select('platform_id')
        .eq('user_id', profileData.id);
      
      if (accessData) {
        setUserPlatformAccess(accessData.map(a => a.platform_id));
      }
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '✅ Copiado!',
      description: `${label} copiado para a área de transferência`,
    });
  };

  // Check if user has access to a specific platform
  const hasPlatformSpecificAccess = (platformId: string) => {
    if (isAdmin) return true;
    return userPlatformAccess.includes(platformId);
  };

  const handlePlatformClick = (platform: Platform) => {
    // Check if user has access to this specific platform
    if (!hasPlatformSpecificAccess(platform.id)) {
      toast({
        title: '🔒 Acesso Bloqueado',
        description: 'Você não tem permissão para acessar esta streaming.',
        variant: 'destructive',
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = isAdmin || userProfile?.has_access;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
                {userProfile 
                  ? `Olá, ${userProfile.name || userProfile.email}` 
                  : 'Vamos criar algo incrível juntos'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="border-border hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Access Blocked Banner */}
        {!hasAccess && (
          <div className="mb-6 p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
            <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-yellow-500 mb-2">
              Acesso Pendente
            </h3>
            <p className="text-yellow-500/80">
              Seu cadastro foi recebido! Aguarde a liberação do acesso pelo administrador.
            </p>
          </div>
        )}

        {/* Warning Banner */}
        {hasAccess && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
            <p className="text-destructive font-medium">
              ⚠️ ATENÇÃO: É proibido revender ou compartilhar este acesso.
            </p>
            <p className="text-destructive/80 mt-1">
              🔍 Todos os acessos são monitorados e o IP é rastreável.
            </p>
            <p className="text-destructive/80 mt-1">
              ❌ Qualquer compartilhamento resultará na perda imediata do acesso.
            </p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Plataformas de Streaming
          </h2>
          <p className="text-muted-foreground">
            {hasAccess 
              ? 'Clique em uma plataforma para visualizar as credenciais ou acessar o link'
              : 'As plataformas estarão disponíveis após a liberação do seu acesso'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const hasPlatformAccess = platform.access_type === 'link_only' 
              ? !!platform.website_url 
              : !!(platform.login && platform.password);
            const isMaintenance = platform.status === 'maintenance';
            const isBlocked = !hasPlatformSpecificAccess(platform.id);
            
            return (
              <div 
                key={platform.id}
                className={`group cursor-pointer transition-all duration-300 ${
                  !hasPlatformAccess || isMaintenance || isBlocked ? 'opacity-60' : ''
                }`}
                onClick={() => {
                  if (isBlocked) {
                    window.open('https://bit.ly/whatsapp-suportejt', '_blank');
                  } else {
                    handlePlatformClick(platform);
                  }
                }}
              >
                {/* Card Container */}
                <div className={`bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 ${
                  isBlocked 
                    ? 'grayscale hover:grayscale-0 hover:border-green-500/50' 
                    : 'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10'
                }`}>
                  {/* Cover Image Area */}
                  <div className="relative aspect-video bg-gradient-to-br from-secondary to-background">
                    {platform.cover_image_url ? (
                      <img 
                        src={platform.cover_image_url} 
                        alt={platform.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">{platformIcons[platform.name] || '📺'}</span>
                      </div>
                    )}

                    {/* Blocked Overlay */}
                    {isBlocked && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 group-hover:bg-green-900/70 transition-colors">
                        <Lock className="w-10 h-10 text-white/80 group-hover:hidden" />
                        <ExternalLink className="w-10 h-10 text-green-400 hidden group-hover:block" />
                        <p className="text-white text-sm font-medium text-center px-4 group-hover:text-green-300">
                          Clique aqui para adquirir seu acesso
                        </p>
                      </div>
                    )}

                    {/* Access Type Badge */}
                    {!isBlocked && (
                      <div className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
                        platform.access_type === 'credentials' 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {platform.access_type === 'credentials' ? (
                          <KeyRound className="w-3 h-3" />
                        ) : (
                          <Link className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Bar - Below Image */}
                  <div className={`w-full py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold ${
                    platform.status === 'online' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-yellow-500 text-black'
                  }`}>
                    {platform.status === 'online' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {platform.status === 'online' ? 'ONLINE' : 'MANUTENÇÃO'}
                  </div>

                  {/* Footer */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-foreground uppercase tracking-wide">
                        {platform.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isBlocked 
                          ? 'Acesso bloqueado'
                          : isMaintenance 
                            ? 'Em manutenção' 
                            : hasPlatformAccess 
                              ? platform.access_type === 'link_only' 
                                ? 'Clique para acessar' 
                                : 'Clique para ver credencial'
                              : 'Sem acesso configurado'
                        }
                      </p>
                    </div>
                    {!isBlocked && hasPlatformAccess && !isMaintenance && (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {platform.access_type === 'link_only' ? (
                          <ExternalLink className="w-5 h-5 text-primary" />
                        ) : (
                          <Eye className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Credential Dialog - Only for credentials type */}
      <Dialog open={!!selectedPlatform} onOpenChange={() => {
        setSelectedPlatform(null);
        setShowPassword(false);
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              {selectedPlatform?.cover_image_url ? (
                <img 
                  src={selectedPlatform.cover_image_url} 
                  alt={selectedPlatform.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <span className="text-3xl">
                  {selectedPlatform && platformIcons[selectedPlatform.name]}
                </span>
              )}
              {selectedPlatform?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlatform?.login && selectedPlatform?.password ? (
            <div className="space-y-4 mt-4">
              {/* Copy All Button */}
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(`Login: ${selectedPlatform.login}\nSenha: ${selectedPlatform.password}`);
                  toast({
                    title: '✅ Copiado!',
                    description: 'Login e senha copiados para a área de transferência',
                  });
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Login e Senha
              </Button>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Login</label>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 bg-background/50 border border-border rounded-md px-3 py-2 text-foreground cursor-pointer hover:bg-background/70 transition-colors"
                    onClick={() => copyToClipboard(selectedPlatform.login!, 'Login')}
                  >
                    {selectedPlatform.login}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedPlatform.login!, 'Login')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Senha</label>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 bg-background/50 border border-border rounded-md px-3 py-2 text-foreground font-mono cursor-pointer hover:bg-background/70 transition-colors"
                    onClick={() => copyToClipboard(selectedPlatform.password!, 'Senha')}
                  >
                    {showPassword ? selectedPlatform.password : '••••••••'}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedPlatform.password!, 'Senha')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Website Link */}
              {selectedPlatform.website_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(selectedPlatform.website_url!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Site
                </Button>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhuma credencial cadastrada para esta plataforma.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
