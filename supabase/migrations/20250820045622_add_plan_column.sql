-- Add plan column to profiles table
ALTER TABLE public.profiles ADD COLUMN plan TEXT DEFAULT 'free';

-- Update existing profiles to have 'free' plan
UPDATE public.profiles SET plan = 'free' WHERE plan IS NULL;

-- Make plan column NOT NULL after setting defaults
ALTER TABLE public.profiles ALTER COLUMN plan SET NOT NULL;

-- Add check constraint to ensure plan is either 'free' or 'pro'
ALTER TABLE public.profiles ADD CONSTRAINT check_plan CHECK (plan IN ('free', 'pro'));
