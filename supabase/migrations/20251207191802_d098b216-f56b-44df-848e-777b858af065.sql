-- Add access expiration column to profiles
ALTER TABLE public.profiles 
ADD COLUMN access_expires_at timestamp with time zone DEFAULT NULL;

-- NULL means lifetime access, a date means access expires on that date

COMMENT ON COLUMN public.profiles.access_expires_at IS 'When the user access expires. NULL means lifetime/no expiration.';