import { useEffect, useMemo, useState } from "react";
import { FlowNavigation } from "@/components/FlowNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type TeamMembership = {
  team_id: string;
  team_name: string;
  role: string;
};

const TeamManagement = () => {
  const { user, profile } = useAuth();
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultTeamId, setDefaultTeamId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Attempt to derive the user's default personal team name to exclude.
  // We'll consider the default team to be either the profile full_name or email local-part.
  const defaultPersonalTeamName = useMemo(() => {
    const nameCandidate = profile?.full_name?.trim();
    if (nameCandidate && nameCandidate.length > 0) return nameCandidate;
    const email = user?.email || "";
    const local = email.split("@")[0];
    return local ? local : undefined;
  }, [profile?.full_name, user?.email]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Get default_team_id from profiles (types may lag, so cast to any)
        const { data: profileRow, error: profileErr } = await (supabase
          .from("profiles" as any)
          .select("default_team_id")
          .eq("user_id", user.id)
          .single() as any);
        if (profileErr) throw profileErr;
        const dtid: string | null = profileRow?.default_team_id ?? null;
        setDefaultTeamId(dtid);

        // Fetch memberships for the user, join to teams to get the team name
        const { data, error } = await supabase
          .from("team_members")
          .select("team_id, role, teams!inner(id, name)")
          .eq("user_id", user.id);

        if (error) throw error;

        const mapped: TeamMembership[] = (data || []).map((row: any) => ({
          team_id: row.team_id,
          team_name: row.teams?.name ?? "Untitled Team",
          role: row.role,
        }));

        // Exclude default personal team by id when available; fallback to name heuristic
        const filtered = mapped.filter((m) => {
          if (dtid) return m.team_id !== dtid;
          if (!defaultPersonalTeamName) return true;
          return m.team_name?.trim() !== defaultPersonalTeamName;
        });

        setMemberships(filtered);
      } catch (e: any) {
        setError(e?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user?.id, defaultPersonalTeamName]);

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      <main className="pt-20">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">Team Management</h1>
              <p className="mt-2 text-sm text-muted-foreground">View teams you own or are a member of.</p>
            </div>
            <Button
              variant="default"
              onClick={() => {
                if ((profile?.plan || "free") !== "pro") {
                  toast({
                    title: "Pro plan required",
                    description: "You need a Pro plan to create teams.",
                    variant: "destructive",
                  });
                  return;
                }
                navigate("/team-management/create");
              }}
            >
              Create New Team
            </Button>
          </div>

          {loading && (
            <Card className="glass-panel">
              <CardContent className="p-6 text-muted-foreground">Loading teams...</CardContent>
            </Card>
          )}

          {error && (
            <Card className="glass-panel mb-6">
              <CardContent className="p-6 text-destructive">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-foreground">Your teams</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {memberships.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">You’re not a member of any teams yet.</div>
                ) : (
                  <ul className="divide-y divide-border">
                    {memberships.map((t) => (
                      <li key={t.team_id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="text-foreground font-medium">{t.team_name}</div>
                          <div className="text-xs text-muted-foreground mt-1">Role: {t.role}</div>
                        </div>
                        <Link to={`/team-management/${t.team_id}`} className="text-muted-foreground hover:text-primary">
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamManagement;


