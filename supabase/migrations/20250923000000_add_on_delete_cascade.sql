-- Add ON DELETE CASCADE to team-owned tables
-- Safe to run multiple times thanks to IF EXISTS

-- team_members.team_id -> teams.id
alter table public.team_members
  drop constraint if exists team_members_team_id_fkey;
alter table public.team_members
  add constraint team_members_team_id_fkey
  foreign key (team_id) references public.teams(id) on delete cascade;

-- team_invites.team_id -> teams.id
alter table public.team_invites
  drop constraint if exists team_invites_team_id_fkey;
alter table public.team_invites
  add constraint team_invites_team_id_fkey
  foreign key (team_id) references public.teams(id) on delete cascade;

-- team_usage_daily.team_id -> teams.id
alter table public.team_usage_daily
  drop constraint if exists team_usage_daily_team_id_fkey;
alter table public.team_usage_daily
  add constraint team_usage_daily_team_id_fkey
  foreign key (team_id) references public.teams(id) on delete cascade;

-- team_quotas.team_id -> teams.id
alter table public.team_quotas
  drop constraint if exists team_quotas_team_id_fkey;
alter table public.team_quotas
  add constraint team_quotas_team_id_fkey
  foreign key (team_id) references public.teams(id) on delete cascade;





