-- Create junction table for user-platform access
CREATE TABLE public.user_platform_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES public.streaming_platforms(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_id)
);

-- Enable RLS
ALTER TABLE public.user_platform_access ENABLE ROW LEVEL SECURITY;

-- Admins can manage all access
CREATE POLICY "Admins can manage platform access"
ON public.user_platform_access
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view their own access
CREATE POLICY "Users can view their own platform access"
ON public.user_platform_access
FOR SELECT
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid()
  )
);