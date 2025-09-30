import { FlowNavigation } from "@/components/FlowNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AcceptInvite = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle"|"success"|"error">("idle");
  const [message, setMessage] = useState<string>("");
  const [switchHint, setSwitchHint] = useState<{inviteEmail: string, acceptUrl: string} | null>(null);

  useEffect(() => {
    const accept = async () => {
      const team_id = search.get("team");
      const token = search.get("token");
      if (!team_id || !token) {
        setStatus("error");
        setMessage("Missing team or token.");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // try to set session from url hash (magic link)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        if (access_token && refresh_token) {
          const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!setErr) {
            return accept();
          }
        }
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `/auth?returnTo=${returnUrl}`;
        return;
      }

      const { data, error } = await supabase.functions.invoke("accept-invite", {
        body: { team_id, token },
      });

      if (error) {
        let reason = error.message || "Accept failed";
        try {
          const parsed = JSON.parse(reason);
          if (parsed?.reason) reason = parsed.reason;
          if (parsed?.reason === 'email_mismatch') {
            const params = new URLSearchParams(window.location.search);
            const acceptUrl = `${window.location.pathname}?${params.toString()}`;
            setSwitchHint({ inviteEmail: parsed?.invite_email || 'invited email', acceptUrl });
          }
        } catch {}
        setStatus("error");
        setMessage(reason);
        return;
      }

      setStatus("success");
      setMessage("Invite accepted. Redirecting...");
      setTimeout(() => navigate(`/team-management/${team_id}`), 1000);
    };
    accept();
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      <main className="pt-20">
        <div className="max-w-xl mx-auto px-4 py-10">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Accepting invite</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={status === "error" ? "text-destructive" : "text-muted-foreground"}>{message || "Please wait..."}</p>
              {status === "error" && (
                <div className="mt-4">
                  {switchHint ? (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          window.location.href = `/auth?returnTo=${encodeURIComponent(switchHint.acceptUrl)}`;
                        }}
                      >
                        Switch account
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/team-management")}>Back to Teams</Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => navigate("/team-management")}>Back to Teams</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AcceptInvite;


