import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Cloud } from 'lucide-react';
import { z } from 'zod';
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});
const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});
export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const {
    signIn,
    user,
    role,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Only redirect when we have both user AND role loaded (not loading)
    if (!loading && user && role) {
      if (role === 'admin') {
        navigate('/admin', {
          replace: true
        });
      } else {
        navigate('/dashboard', {
          replace: true
        });
      }
    }
  }, [user, role, loading, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = loginSchema.safeParse({
      email,
      password
    });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    const {
      error
    } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Email ou senha incorretos',
        variant: 'destructive'
      });
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword
    });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: name
        }
      }
    });
    setIsLoading(false);
    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Erro',
          description: 'Este email já está cadastrado',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Erro ao cadastrar',
          description: error.message,
          variant: 'destructive'
        });
      }
      return;
    }
    toast({
      title: 'Cadastro realizado!',
      description: 'Aguarde a liberação do acesso pelo administrador.'
    });

    // Clear form and switch to login
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setActiveTab('login');
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Cloud className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-foreground">
              JoviTools GPainel 
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Acesse ou crie sua conta
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-background/50 border-border" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-background/50 border-border" required />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome</Label>
                  <Input id="signup-name" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} className="bg-background/50 border-border" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-background/50 border-border" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-background/50 border-border" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                  <Input id="signup-confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-background/50 border-border" required />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Cadastrar
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Após o cadastro, aguarde a liberação do acesso pelo administrador.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}