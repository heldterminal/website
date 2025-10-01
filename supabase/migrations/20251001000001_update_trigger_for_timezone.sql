-- Migration: Update trigger to use user's timezone for accurate local day calculation

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS trigger_update_team_storage_bytes ON public.commands;
DROP FUNCTION IF EXISTS update_team_storage_bytes();

-- Create updated function that uses user's timezone
CREATE OR REPLACE FUNCTION update_team_storage_bytes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id uuid;
  v_user_id uuid;
  v_row_size bigint;
  v_timezone text;
  v_local_day date;
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
  
  -- Get user's timezone from profiles
  SELECT COALESCE(timezone, 'UTC') INTO v_timezone
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  -- Calculate local day based on user's timezone
  -- Note: PostgreSQL's timezone conversion
  BEGIN
    v_local_day := (NOW() AT TIME ZONE v_timezone)::date;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to UTC if timezone conversion fails
    v_local_day := CURRENT_DATE;
  END;
  
  -- Calculate the storage size of the new command row
  v_row_size := pg_column_size(NEW.*);
  
  -- Check if a row exists for today
  SELECT storage_bytes INTO v_existing_storage
  FROM public.team_usage_daily
  WHERE team_id = v_team_id
    AND user_id = v_user_id
    AND day = v_local_day;
  
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
    v_local_day,
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

-- Create trigger on commands table
CREATE TRIGGER trigger_update_team_storage_bytes
  BEFORE INSERT ON public.commands
  FOR EACH ROW
  EXECUTE FUNCTION update_team_storage_bytes();

COMMENT ON FUNCTION update_team_storage_bytes IS 'Automatically update team_usage_daily storage_bytes using user local timezone when a command is inserted';

