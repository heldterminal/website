-- Migration: Add team_id to commands table and auto-update storage_bytes in team_usage_daily

-- Step 1: Add team_id column to commands table
ALTER TABLE public.commands 
ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_commands_team_id ON public.commands(team_id);

-- Step 3: Create trigger function to auto-update storage_bytes
CREATE OR REPLACE FUNCTION update_team_storage_bytes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id uuid;
  v_user_id uuid;
  v_row_size bigint;
  v_today date;
  v_existing_storage bigint;
BEGIN
  -- Get team_id (use NEW.team_id if provided, otherwise get default from profile)
  IF NEW.team_id IS NOT NULL THEN
    v_team_id := NEW.team_id;
  ELSE
    -- Get default_team_id from profiles
    SELECT default_team_id INTO v_team_id
    FROM public.profiles
    WHERE user_id = NEW.user_id;
    
    -- Update the command row with the team_id
    NEW.team_id := v_team_id;
  END IF;
  
  -- Only proceed if we have a team_id
  IF v_team_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  v_user_id := NEW.user_id;
  v_today := CURRENT_DATE;
  
  -- Calculate the storage size of the new command row
  v_row_size := pg_column_size(NEW.*);
  
  -- Check if a row exists for today
  SELECT storage_bytes INTO v_existing_storage
  FROM public.team_usage_daily
  WHERE team_id = v_team_id
    AND user_id = v_user_id
    AND day = v_today;
  
  -- Upsert the team_usage_daily row
  INSERT INTO public.team_usage_daily (
    team_id,
    user_id,
    day,
    api_calls,
    token_count,
    storage_bytes,
    created_at,
    updated_at
  )
  VALUES (
    v_team_id,
    v_user_id,
    v_today,
    0,  -- api_calls handled by edge function
    0,  -- token_count handled by edge function
    v_row_size,
    NOW(),
    NOW()
  )
  ON CONFLICT (team_id, user_id, day)
  DO UPDATE SET
    storage_bytes = team_usage_daily.storage_bytes + v_row_size,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Step 4: Create trigger on commands table
DROP TRIGGER IF EXISTS trigger_update_team_storage_bytes ON public.commands;

CREATE TRIGGER trigger_update_team_storage_bytes
  BEFORE INSERT ON public.commands
  FOR EACH ROW
  EXECUTE FUNCTION update_team_storage_bytes();

COMMENT ON FUNCTION update_team_storage_bytes IS 'Automatically update team_usage_daily storage_bytes when a command is inserted';
COMMENT ON COLUMN public.commands.team_id IS 'Team ID - auto-populated from user default_team_id if not provided';
