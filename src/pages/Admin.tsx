import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Tv, LogOut, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Shield } from 'lucide-react';

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
  platform?: Platform;
}

export default function Admin() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Platform Dialog
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [platformName, setPlatformName] = useState('');
  
  // Credential Dialog
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [credentialPlatformId, setCredentialPlatformId] = useState('');
  const [credentialLogin, setCredentialLogin] = useState('');
  const [credentialPassword, setCredentialPassword] = useState('');
  
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
    const [platformsRes, credentialsRes] = await Promise.all([
      supabase.from('streaming_platforms').select('*').order('name'),
      supabase.from('streaming_credentials').select('*, platform:streaming_platforms(*)'),
    ]);

    if (platformsRes.data) setPlatforms(platformsRes.data);
    if (credentialsRes.data) setCredentials(credentialsRes.data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Platform CRUD
  const openPlatformDialog = (platform?: Platform) => {
    if (platform) {
      setEditingPlatform(platform);
      setPlatformName(platform.name);
    } else {
      setEditingPlatform(null);
      setPlatformName('');
    }
    setPlatformDialogOpen(true);
  };

  const savePlatform = async () => {
    if (!platformName.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    if (editingPlatform) {
      const { error } = await supabase
        .from('streaming_platforms')
        .update({ name: platformName })
        .eq('id', editingPlatform.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao atualizar plataforma', variant: 'destructive' });
        return;
      }
      toast({ title: 'Sucesso', description: 'Plataforma atualizada' });
    } else {
      const { error } = await supabase
        .from('streaming_platforms')
        .insert({ name: platformName });
      
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

  // Credential CRUD
  const openCredentialDialog = (credential?: Credential) => {
    if (credential) {
      setEditingCredential(credential);
      setCredentialPlatformId(credential.platform_id);
      setCredentialLogin(credential.login);
      setCredentialPassword(credential.password);
    } else {
      setEditingCredential(null);
      setCredentialPlatformId(platforms[0]?.id || '');
      setCredentialLogin('');
      setCredentialPassword('');
    }
    setCredentialDialogOpen(true);
  };

  const saveCredential = async () => {
    if (!credentialPlatformId || !credentialLogin.trim() || !credentialPassword.trim()) {
      toast({ title: 'Erro', description: 'Todos os campos são obrigatórios', variant: 'destructive' });
      return;
    }

    if (editingCredential) {
      const { error } = await supabase
        .from('streaming_credentials')
        .update({ 
          platform_id: credentialPlatformId,
          login: credentialLogin, 
          password: credentialPassword 
        })
        .eq('id', editingCredential.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao atualizar credencial', variant: 'destructive' });
        return;
      }
      toast({ title: 'Sucesso', description: 'Credencial atualizada' });
    } else {
      const { error } = await supabase
        .from('streaming_credentials')
        .insert({ 
          platform_id: credentialPlatformId,
          login: credentialLogin, 
          password: credentialPassword 
        });
      
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao criar credencial', variant: 'destructive' });
        return;
      }
      toast({ title: 'Sucesso', description: 'Credencial criada' });
    }

    setCredentialDialogOpen(false);
    fetchData();
  };

  const deleteCredential = async (id: string) => {
    const { error } = await supabase.from('streaming_credentials').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao deletar credencial', variant: 'destructive' });
      return;
    }
    toast({ title: 'Sucesso', description: 'Credencial deletada' });
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
        <Tabs defaultValue="credentials" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="credentials">Credenciais</TabsTrigger>
            <TabsTrigger value="platforms">Plataformas</TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Credenciais de Streaming</CardTitle>
                <Button onClick={() => openCredentialDialog()} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Credencial
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Login</TableHead>
                      <TableHead>Senha</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credentials.map((credential) => (
                      <TableRow key={credential.id}>
                        <TableCell className="font-medium">
                          {credential.platform?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{credential.login}</TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            {showPasswords[credential.id] ? credential.password : '••••••••'}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => togglePasswordVisibility(credential.id)}
                            >
                              {showPasswords[credential.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCredentialDialog(credential)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteCredential(credential.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {credentials.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhuma credencial cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Plataformas de Streaming</CardTitle>
                <Button onClick={() => openPlatformDialog()} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Plataforma
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platforms.map((platform) => (
                      <TableRow key={platform.id}>
                        <TableCell className="font-medium">{platform.name}</TableCell>
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Platform Dialog */}
      <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingPlatform ? 'Editar Plataforma' : 'Nova Plataforma'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Nome</Label>
              <Input
                id="platform-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="Ex: Netflix"
                className="bg-background/50 border-border"
              />
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

      {/* Credential Dialog */}
      <Dialog open={credentialDialogOpen} onOpenChange={setCredentialDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCredential ? 'Editar Credencial' : 'Nova Credencial'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credential-platform">Plataforma</Label>
              <select
                id="credential-platform"
                value={credentialPlatformId}
                onChange={(e) => setCredentialPlatformId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credential-login">Login</Label>
              <Input
                id="credential-login"
                value={credentialLogin}
                onChange={(e) => setCredentialLogin(e.target.value)}
                placeholder="Email ou usuário"
                className="bg-background/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credential-password">Senha</Label>
              <Input
                id="credential-password"
                type="text"
                value={credentialPassword}
                onChange={(e) => setCredentialPassword(e.target.value)}
                placeholder="Senha"
                className="bg-background/50 border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredentialDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCredential}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
