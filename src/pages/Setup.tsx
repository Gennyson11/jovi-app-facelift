import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Setup() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const setupUsers = async () => {
    setIsLoading(true);
    setStatus('idle');
    
    try {
      // Create admin user
      const adminRes = await supabase.functions.invoke('setup-users', {
        body: {
          action: 'create_user',
          email: 'jovitoolsbr@gmail.com',
          password: 'Macedo@123',
          role: 'admin'
        }
      });

      if (adminRes.error) throw new Error(adminRes.error.message);
      console.log('Admin setup:', adminRes.data);

      // Create client user
      const clientRes = await supabase.functions.invoke('setup-users', {
        body: {
          action: 'create_user',
          email: 'ClienteJoviTools@gmail.com',
          password: 'JoviToolsGGMAX10',
          role: 'user'
        }
      });

      if (clientRes.error) throw new Error(clientRes.error.message);
      console.log('Client setup:', clientRes.data);

      setStatus('success');
      setMessage('Usuários criados com sucesso!');
      toast({
        title: 'Sucesso!',
        description: 'Configuração inicial concluída',
      });

    } catch (error: any) {
      console.error('Setup error:', error);
      setStatus('error');
      setMessage(error.message || 'Erro ao configurar');
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-foreground">
              Configuração Inicial
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Configure os usuários padrão do sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-md bg-secondary/50 border border-border">
              <p className="font-medium text-foreground">Admin:</p>
              <p className="text-muted-foreground">jovitoolsbr@gmail.com</p>
              <p className="text-muted-foreground">Macedo@123</p>
            </div>
            <div className="p-3 rounded-md bg-secondary/50 border border-border">
              <p className="font-medium text-foreground">Cliente:</p>
              <p className="text-muted-foreground">ClienteJoviTools@gmail.com</p>
              <p className="text-muted-foreground">JoviToolsGGMAX10</p>
            </div>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-md">
              <CheckCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={setupUsers} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Criar Usuários
            </Button>

            {status === 'success' && (
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')} 
                className="w-full"
              >
                Ir para Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
