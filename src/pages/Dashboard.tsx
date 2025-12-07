import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tv, LogOut, Eye, EyeOff, Copy, Loader2 } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon_url: string | null;
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

    if (platformsRes.data) setPlatforms(platformsRes.data);
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
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Plataformas de Streaming
          </h2>
          <p className="text-muted-foreground">
            Clique em uma plataforma para visualizar as credenciais
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {platforms.map((platform) => {
            const hasCredential = !!getCredentialForPlatform(platform.id);
            return (
              <Card 
                key={platform.id}
                className={`cursor-pointer transition-all duration-200 border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${
                  !hasCredential ? 'opacity-50' : ''
                }`}
                onClick={() => hasCredential && setSelectedPlatform(platform)}
              >
                <CardHeader className="pb-2">
                  <div className="text-4xl mb-2">
                    {platformIcons[platform.name] || '📺'}
                  </div>
                  <CardTitle className="text-lg text-foreground">
                    {platform.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {hasCredential ? 'Credencial disponível' : 'Sem credencial'}
                  </p>
                </CardContent>
              </Card>
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
              <span className="text-3xl">
                {selectedPlatform && platformIcons[selectedPlatform.name]}
              </span>
              {selectedPlatform?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCredential ? (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Login</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background/50 border border-border rounded-md px-3 py-2 text-foreground">
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
                  <div className="flex-1 bg-background/50 border border-border rounded-md px-3 py-2 text-foreground font-mono">
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
