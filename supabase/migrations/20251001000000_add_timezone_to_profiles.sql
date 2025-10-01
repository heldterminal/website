-- Migration: Add timezone column to profiles for accurate local day tracking

-- Step 1: Add timezone column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Step 2: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON public.profiles(timezone);

COMMENT ON COLUMN public.profiles.timezone IS 'User timezone in IANA format (e.g., America/Los_Angeles, Europe/London) for accurate local day calculation';

