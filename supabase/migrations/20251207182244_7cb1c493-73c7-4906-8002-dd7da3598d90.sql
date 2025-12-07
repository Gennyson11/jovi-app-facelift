-- Adicionar campos de credencial e link diretamente na tabela de plataformas
ALTER TABLE public.streaming_platforms 
ADD COLUMN login TEXT,
ADD COLUMN password TEXT,
ADD COLUMN website_url TEXT;