-- Add missing columns for OAuth support if they don't exist
DO $$ 
BEGIN
    -- Add provider column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'provider') THEN
        ALTER TABLE public.profiles ADD COLUMN provider TEXT;
    END IF;
    
    -- Add provider_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'provider_id') THEN
        ALTER TABLE public.profiles ADD COLUMN provider_id TEXT;
    END IF;
    
    -- Add plan column if it doesn't exist (for subscription support)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'plan') THEN
        ALTER TABLE public.profiles ADD COLUMN plan TEXT DEFAULT 'free';
        UPDATE public.profiles SET plan = 'free' WHERE plan IS NULL;
        ALTER TABLE public.profiles ALTER COLUMN plan SET NOT NULL;
        ALTER TABLE public.profiles ADD CONSTRAINT check_plan CHECK (plan IN ('free', 'pro'));
    END IF;
END $$;
