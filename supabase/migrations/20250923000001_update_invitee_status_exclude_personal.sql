-- Update invitee_status to exclude personal (default) teams from team_count

create or replace function public.invitee_status(p_team_id uuid, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_user_id uuid;
  v_plan text;
  v_sub text;
  v_in_team boolean := false;
  v_active_invite boolean := false;
  v_team_count int := 0;
  v_default_team uuid := null;
begin
  select user_id, plan, subscription_status, default_team_id
    into v_user_id, v_plan, v_sub, v_default_team
  from public.profiles
  where lower(email) = v_email
  limit 1;

  if v_user_id is not null then
    select exists(
      select 1
      from public.team_members
      where team_id = p_team_id and user_id = v_user_id
    ) into v_in_team;

    if v_default_team is null then
      select count(*) into v_team_count
      from public.team_members
      where user_id = v_user_id;
    else
      select count(*) into v_team_count
      from public.team_members
      where user_id = v_user_id
        and team_id <> v_default_team;
    end if;
  end if;

  select exists(
    select 1 from public.team_invites
    where team_id = p_team_id
      and lower(email) = v_email
      and accepted_at is null
      and expires_at > now()
  ) into v_active_invite;

  return jsonb_build_object(
    'exists', v_user_id is not null,
    'is_pro', (coalesce(v_plan,'free') = 'pro') or (coalesce(v_sub,'') = 'active'),
    'in_team', v_in_team,
    'team_count', v_team_count,
    'has_active_invite', v_active_invite
  );
end
$$;



