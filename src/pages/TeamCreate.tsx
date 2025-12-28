import { FlowNavigation } from "@/components/FlowNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TeamCreate = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleBack = () => navigate("/team-management");

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((profile?.plan || "free") !== "pro") {
      toast({
        title: "Pro plan required",
        description: "You need a Pro plan to create teams.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // UI-side: creator cannot be in 3 or more teams
      if (!user?.id) throw new Error("Not signed in");
      // Exclude personal (default) team from the count
      const { data: defaultTeamRow } = await (supabase
        .from('profiles' as any)
        .select('default_team_id')
        .eq('user_id', user.id)
        .maybeSingle() as any);
      const defaultTeamId = defaultTeamRow?.default_team_id || null;

      const query = supabase.from('team_members' as any)
        .select('team_id', { count: 'exact', head: true })
        .eq('user_id', user.id) as any;
      const { count: myTeamCount, error: countErr } = defaultTeamId
        ? await query.neq('team_id', defaultTeamId)
        : await query;
      if (countErr) throw countErr;
      if ((myTeamCount ?? 0) >= 3) {
        throw new Error("You are already in the maximum number of teams");
      }
      // 1) Create team
      const { data: team, error: teamErr } = await (supabase
        .from("teams" as any)
        .insert({ name: teamName })
        .select("id")
        .single() as any);
      if (teamErr) {
        console.error("Team create error", teamErr);
        throw teamErr;
      }
      if (!team?.id) {
        console.error("Team create returned no id", team);
        throw new Error("Team creation failed: no id returned");
      }

      // 2) Add current user as owner in team_members
      const { error: memberErr } = await (supabase
        .from("team_members" as any)
        .insert({ team_id: team.id, user_id: user?.id, role: "owner" }) as any);
      if (memberErr) {
        console.error("Team member insert error", memberErr);
        throw memberErr;
      }

      toast({ title: "Team created", description: "Your team was created successfully." });
      navigate(`/team-management/${team.id}`);
    } catch (err: any) {
      const message = err?.message || "Unknown error";
      setSubmitError(message);
      toast({ title: "Failed to create team", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      <main className="pt-20">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <Button variant="ghost" onClick={handleBack}>← Back</Button>
          <Card className="glass-panel mt-4">
            <CardHeader>
              <CardTitle className="text-foreground">Create a new team</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNext} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team name</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g., Held Platform Team"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Held, Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose (optional)</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Internal tooling and infra"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleBack}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Continue"}</Button>
                </div>
                {submitError && (
                  <p className="text-sm text-destructive text-right">{submitError}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeamCreate;


