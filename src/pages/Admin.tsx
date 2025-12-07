import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Shield, Upload, Image, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

type StreamingStatus = 'online' | 'maintenance';

interface Platform {
  id: string;
  name: string;
  icon_url: string | null;
  cover_image_url: string | null;
  status: StreamingStatus;
  login: string | null;
  password: string | null;
  website_url: string | null;
}

export default function Admin() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Platform Dialog
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [platformName, setPlatformName] = useState('');
  const [platformStatus, setPlatformStatus] = useState<StreamingStatus>('online');
  const [platformCoverUrl, setPlatformCoverUrl] = useState('');
  const [platformLogin, setPlatformLogin] = useState('');
  const [platformPassword, setPlatformPassword] = useState('');
  const [platformWebsiteUrl, setPlatformWebsiteUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
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
    const { data } = await supabase
      .from('streaming_platforms')
      .select('*')
      .order('name');

    if (data) setPlatforms(data as Platform[]);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Selecione um arquivo de imagem', variant: 'destructive' });
      return;
    }

    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('streaming-covers')
      .upload(fileName, file);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao fazer upload da imagem', variant: 'destructive' });
      setUploadingImage(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('streaming-covers')
      .getPublicUrl(data.path);

    setPlatformCoverUrl(urlData.publicUrl);
    setUploadingImage(false);
    toast({ title: 'Sucesso', description: 'Imagem carregada' });
  };

  // Platform CRUD
  const openPlatformDialog = (platform?: Platform) => {
    if (platform) {
      setEditingPlatform(platform);
      setPlatformName(platform.name);
      setPlatformStatus(platform.status || 'online');
      setPlatformCoverUrl(platform.cover_image_url || '');
      setPlatformLogin(platform.login || '');
      setPlatformPassword(platform.password || '');
      setPlatformWebsiteUrl(platform.website_url || '');
    } else {
      setEditingPlatform(null);
      setPlatformName('');
      setPlatformStatus('online');
      setPlatformCoverUrl('');
      setPlatformLogin('');
      setPlatformPassword('');
      setPlatformWebsiteUrl('');
    }
    setPlatformDialogOpen(true);
  };

  const savePlatform = async () => {
    if (!platformName.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    const platformData = {
      name: platformName,
      status: platformStatus,
      cover_image_url: platformCoverUrl || null,
      login: platformLogin || null,
      password: platformPassword || null,
      website_url: platformWebsiteUrl || null,
    };

    if (editingPlatform) {
      const { error } = await supabase
        .from('streaming_platforms')
        .update(platformData)
        .eq('id', editingPlatform.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao atualizar plataforma', variant: 'destructive' });
        return;
      }
      toast({ title: 'Sucesso', description: 'Plataforma atualizada' });
    } else {
      const { error } = await supabase
        .from('streaming_platforms')
        .insert(platformData);
      
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao criar plataforma', variant: 'destructive' });
        return;
      }
      toast({ title: 'Sucesso', description: 'Plataforma criada' });
    }

    setPlatformDialogOpen(false);
    fetchData();
  };

  const deletePlatform = async (id: string) => {
    const { error } = await supabase.from('streaming_platforms').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao deletar plataforma', variant: 'destructive' });
      return;
    }
    toast({ title: 'Sucesso', description: 'Plataforma deletada' });
    fetchData();
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                Jovitools Streamings
              </h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
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
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Plataformas de Streaming</CardTitle>
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
                    <TableHead>Login</TableHead>
                    <TableHead>Senha</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platforms.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell>
                        {platform.cover_image_url ? (
                          <img 
                            src={platform.cover_image_url} 
                            alt={platform.name}
                            className="w-16 h-10 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-muted rounded-md flex items-center justify-center">
                            <Image className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{platform.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {platform.login || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {platform.password ? (
                          <div className="flex items-center gap-2">
                            {showPasswords[platform.id] ? platform.password : '••••••••'}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => togglePasswordVisibility(platform.id)}
                            >
                              {showPasswords[platform.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          platform.status === 'online' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {platform.status === 'online' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {platform.status === 'online' ? 'Online' : 'Manutenção'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {platform.website_url ? (
                          <a 
                            href={platform.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Abrir
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPlatformDialog(platform)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deletePlatform(platform.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {platforms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma plataforma cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
              <Label htmlFor="platform-name">Nome da Streaming *</Label>
              <Input
                id="platform-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="Ex: Netflix"
                className="bg-background/50 border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform-login">Login</Label>
                <Input
                  id="platform-login"
                  value={platformLogin}
                  onChange={(e) => setPlatformLogin(e.target.value)}
                  placeholder="Email ou usuário"
                  className="bg-background/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-password">Senha</Label>
                <Input
                  id="platform-password"
                  value={platformPassword}
                  onChange={(e) => setPlatformPassword(e.target.value)}
                  placeholder="Senha"
                  className="bg-background/50 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-website">Link do Site</Label>
              <Input
                id="platform-website"
                value={platformWebsiteUrl}
                onChange={(e) => setPlatformWebsiteUrl(e.target.value)}
                placeholder="https://www.netflix.com"
                className="bg-background/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-status">Status</Label>
              <select
                id="platform-status"
                value={platformStatus}
                onChange={(e) => setPlatformStatus(e.target.value as StreamingStatus)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="online">Online</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <div className="flex flex-col gap-3">
                {platformCoverUrl && (
                  <div className="relative">
                    <img 
                      src={platformCoverUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setPlatformCoverUrl('')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
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
    </div>
  );
}
