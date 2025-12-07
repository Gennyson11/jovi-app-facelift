import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tv, LogOut, Eye, EyeOff, Copy, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

type StreamingStatus = 'online' | 'maintenance';

interface Platform {
  id: string;
  name: string;
  icon_url: string | null;
  cover_image_url: string | null;
  status: StreamingStatus;
}

interface Credential {
  id: string;
  platform_id: string;
  login: string;
  password: string;
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
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, signOut, loading: authLoading } = useAuth();
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
    const [platformsRes, credentialsRes] = await Promise.all([
      supabase.from('streaming_platforms').select('*').order('name'),
      supabase.from('streaming_credentials').select('*'),
    ]);

    if (platformsRes.data) setPlatforms(platformsRes.data as Platform[]);
    if (credentialsRes.data) setCredentials(credentialsRes.data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getCredentialForPlatform = (platformId: string) => {
    return credentials.find(c => c.platform_id === platformId);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência`,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedCredential = selectedPlatform 
    ? getCredentialForPlatform(selectedPlatform.id) 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tv className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Jovitools Streamings
            </h1>
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
        {/* Warning Banner */}
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

        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Plataformas de Streaming
          </h2>
          <p className="text-muted-foreground">
            Clique em uma plataforma para visualizar as credenciais
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const hasCredential = !!getCredentialForPlatform(platform.id);
            const isMaintenance = platform.status === 'maintenance';
            
            return (
              <div 
                key={platform.id}
                className={`group cursor-pointer transition-all duration-300 ${
                  !hasCredential || isMaintenance ? 'opacity-60' : ''
                }`}
                onClick={() => hasCredential && !isMaintenance && setSelectedPlatform(platform)}
              >
                {/* Card Container */}
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
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
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      platform.status === 'online' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {platform.status === 'online' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {platform.status === 'online' ? 'Online' : 'Manutenção'}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 flex items-center justify-between border-t border-border/50">
                    <div>
                      <h3 className="font-display font-bold text-foreground uppercase tracking-wide">
                        {platform.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isMaintenance 
                          ? 'Em manutenção' 
                          : hasCredential 
                            ? 'Clique para ver credencial' 
                            : 'Sem credencial'
                        }
                      </p>
                    </div>
                    {hasCredential && !isMaintenance && (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Credential Dialog */}
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
          
          {selectedCredential ? (
            <div className="space-y-4 mt-4">
              {/* Copy All Button */}
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(`Login: ${selectedCredential.login}\nSenha: ${selectedCredential.password}`);
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
                    onClick={() => copyToClipboard(selectedCredential.login, 'Login')}
                  >
                    {selectedCredential.login}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedCredential.login, 'Login')}
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
                    onClick={() => copyToClipboard(selectedCredential.password, 'Senha')}
                  >
                    {showPassword ? selectedCredential.password : '••••••••'}
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
                    onClick={() => copyToClipboard(selectedCredential.password, 'Senha')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
