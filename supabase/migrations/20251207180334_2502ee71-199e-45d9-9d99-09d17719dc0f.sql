-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles de usuários
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Tabela de plataformas de streaming
CREATE TABLE public.streaming_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de credenciais de streaming
CREATE TABLE public.streaming_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID REFERENCES public.streaming_platforms(id) ON DELETE CASCADE NOT NULL,
    login TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_credentials ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Políticas RLS para streaming_platforms
CREATE POLICY "Authenticated users can view platforms"
ON public.streaming_platforms
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage platforms"
ON public.streaming_platforms
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para streaming_credentials
CREATE POLICY "Authenticated users can view credentials"
ON public.streaming_credentials
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage credentials"
ON public.streaming_credentials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_streaming_platforms_updated_at
BEFORE UPDATE ON public.streaming_platforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_streaming_credentials_updated_at
BEFORE UPDATE ON public.streaming_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir plataformas padrão
INSERT INTO public.streaming_platforms (name, icon_url) VALUES
('Netflix', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/netflix.svg'),
('Amazon Prime Video', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/primevideo.svg'),
('Disney+', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/disneyplus.svg'),
('HBO Max', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hbo.svg'),
('Paramount+', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paramount.svg'),
('Crunchyroll', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/crunchyroll.svg');