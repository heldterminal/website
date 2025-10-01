// supabase/functions/_shared/usage.ts
// Shared usage tracking utilities
//
// USAGE EXAMPLE FOR COMMAND INSERTION:
// -------------------------------------
// Storage bytes are automatically tracked via database trigger.
// Just insert the command normally:
//
//   const { data: insertedCmd } = await supabase
//     .from("commands")
//     .insert({ 
//       user_id: userId,
//       team_id: teamId,  // Optional - will use default_team_id if null
//       cmd, cwd, stdout, stderr, ... 
//     })
//     .select("id")
//     .single();
//
// The trigger will automatically update team_usage_daily.storage_bytes!
//
// USAGE EXAMPLE FOR API CALLS (like coro-chat):
// ----------------------------------------------
//   const defaultTeamId = await getDefaultTeamId(supabase, userId);
//   if (defaultTeamId) {
//     const tokenCount = calculateTokenCount(queryString);
//     
//     // Check quotas first
//     const quotaError = await checkQuotas(supabase, userId, defaultTeamId, tokenCount);
//     if (quotaError) {
//       return json({ error: quotaError }, 429);
//     }
//     
//     // Then track usage
//     await trackUsage(supabase, userId, defaultTeamId, tokenCount);
//   }

/**
 * Map request length to token count (5-9 tokens per request)
 */
export function calculateTokenCount(queryString: string): number {
  const len = queryString.length;
  if (len < 50) return 5;
  if (len < 100) return 6;
  if (len < 200) return 7;
  if (len < 400) return 8;
  return 9;
}

/**
 * Get user's timezone from profile.
 */
async function getUserTimezone(supabase: any, userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("user_id", userId)
      .single();
    
    if (error || !data?.timezone) {
      return "UTC"; // Default to UTC if not set
    }
    
    return data.timezone;
  } catch (e) {
    console.error("Error fetching user timezone:", e);
    return "UTC";
  }
}

/**
 * Get the current date in the user's local timezone.
 * Returns YYYY-MM-DD format.
 */
function getLocalDay(timezone: string): string {
  try {
    const now = new Date();
    // Format date in user's timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(now); // Returns YYYY-MM-DD
  } catch (e) {
    console.error("Error formatting date for timezone:", timezone, e);
    // Fallback to UTC
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Check if team has exceeded any quotas.
 * Returns error message if quota exceeded, null otherwise.
 */
export async function checkQuotas(
  supabase: any,
  userId: string,
  teamId: string,
  newTokenCount: number
): Promise<string | null> {
  try {
    // Get user's timezone and calculate local day
    const timezone = await getUserTimezone(supabase, userId);
    const today = getLocalDay(timezone);

    // Get team quotas
    const { data: quotaData, error: quotaError } = await supabase
      .from("team_quotas")
      .select("quota_tokens_per_day, quota_api_calls_per_day, quota_storage_bytes")
      .eq("team_id", teamId)
      .order("effective_at", { ascending: false })
      .limit(1)
      .single();

    if (quotaError || !quotaData) {
      console.error("Failed to fetch quotas:", quotaError?.message);
      // If no quotas found, allow request (fail open)
      return null;
    }

    // Sum total usage for the team for today
    const { data: usageData, error: usageError } = await supabase
      .from("team_usage_daily")
      .select("api_calls, token_count, storage_bytes")
      .eq("team_id", teamId)
      .eq("day", today);

    if (usageError) {
      console.error("Failed to fetch usage:", usageError?.message);
      return null;
    }

    // Calculate total usage across all team members for today
    const totalUsage = (usageData || []).reduce(
      (acc: any, row: any) => ({
        api_calls: acc.api_calls + (row.api_calls || 0),
        token_count: acc.token_count + (row.token_count || 0),
        storage_bytes: acc.storage_bytes + (row.storage_bytes || 0)
      }),
      { api_calls: 0, token_count: 0, storage_bytes: 0 }
    );

    // Check API calls quota (adding 1 for this request)
    if (
      quotaData.quota_api_calls_per_day !== null &&
      totalUsage.api_calls + 1 > quotaData.quota_api_calls_per_day
    ) {
      return "You have exceeded the API calls usage for the day. Please upgrade your plan to continue using the service.";
    }

    // Check token count quota (adding new tokens for this request)
    if (
      quotaData.quota_tokens_per_day !== null &&
      totalUsage.token_count + newTokenCount > quotaData.quota_tokens_per_day
    ) {
      return "You have exceeded the token usage for the day. Please upgrade your plan to continue using the service.";
    }

    // Check storage quota
    if (
      quotaData.quota_storage_bytes !== null &&
      totalUsage.storage_bytes > quotaData.quota_storage_bytes
    ) {
      return "You have exceeded the storage usage for the day. Please upgrade your plan to continue using the service.";
    }

    return null; // All quotas OK
  } catch (e) {
    console.error("Quota check error:", e);
    // Fail open - allow request if quota check fails
    return null;
  }
}

/**
 * Track API usage in team_usage_daily table
 */
export async function trackUsage(
  supabase: any,
  userId: string,
  teamId: string,
  tokenCount: number
) {
  try {
    // Get user's timezone and calculate local day
    const timezone = await getUserTimezone(supabase, userId);
    const today = getLocalDay(timezone);

    // Use upsert to increment existing row or create new one
    const { data: existing } = await supabase
      .from("team_usage_daily")
      .select("api_calls, token_count, storage_bytes")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .eq("day", today)
      .single();

    const row = {
      team_id: teamId,
      user_id: userId,
      day: today,
      api_calls: (existing?.api_calls || 0) + 1,
      token_count: (existing?.token_count || 0) + tokenCount,
      storage_bytes: existing?.storage_bytes || 0,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("team_usage_daily").upsert(row, {
      onConflict: "team_id,user_id,day"
    });

    if (error) {
      console.error("Failed to track usage:", error.message);
    }
  } catch (e) {
    console.error("Usage tracking error:", e);
  }
}

/**
 * Note: updateStorageBytes is now handled automatically by database trigger.
 * When you insert a command into public.commands, the trigger will:
 * 1. Auto-populate team_id from user's default_team_id if not provided
 * 2. Calculate row size using pg_column_size()
 * 3. Update team_usage_daily.storage_bytes automatically
 * 
 * No need to call this function manually anymore!
 */

/**
 * Get user's default team ID from profiles
 */
export async function getDefaultTeamId(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data: profileData } = await supabase
    .from("profiles")
    .select("default_team_id")
    .eq("user_id", userId)
    .single();

  return profileData?.default_team_id || null;
}
