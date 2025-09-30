import { FlowNavigation } from "@/components/FlowNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type UsageRow = {
  day: string;
  command_count: number;
  api_calls: number;
  storage_bytes: number;
};

type MemberRow = {
  user_id: string;
  role: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

const TeamDetails = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<"owner" | "admin" | "member" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [teamNameEdit, setTeamNameEdit] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) return;
      setLoading(true);
      try {
        const { data: usageRows, error: usageErr } = await (supabase
          .from("team_usage_daily" as any)
          .select("day, command_count, api_calls, storage_bytes")
          .eq("team_id", teamId)
          .order("day", { ascending: true }) as any);
        if (usageErr) throw usageErr;

        // Fetch members via secure RPC (handles RLS and membership checks)
        const { data: memberRowsRaw, error: memberErr } = await ((supabase as any)
          .rpc('team_members_list', { p_team_id: teamId }) as any);
        if (memberErr) throw memberErr;

        const mergedMembers: MemberRow[] = (memberRowsRaw || []).map((m: any) => ({
          user_id: m.user_id,
          role: m.role,
          full_name: m.display_name ?? null,
          email: m.email ?? null,
          avatar_url: null,
        }));

        setUsage(usageRows || []);
        setMembers(mergedMembers);

        // Fetch current user's role in this team
        if (user?.id) {
          const { data: meRow, error: meErr } = await (supabase
            .from("team_members" as any)
            .select("role")
            .eq("team_id", teamId)
            .eq("user_id", user.id)
            .single() as any);
          if (!meErr && meRow) {
            setCurrentUserRole(meRow.role as any);
          } else {
            setCurrentUserRole(null);
          }
        }
      } catch (e: any) {
        toast({ title: "Failed to load team data", description: e?.message || "Unknown error", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teamId, user?.id]);

  const totalCommands = useMemo(() => usage.reduce((s, r) => s + (r.command_count || 0), 0), [usage]);
  const totalApi = useMemo(() => usage.reduce((s, r) => s + (r.api_calls || 0), 0), [usage]);
  const totalStorage = useMemo(() => usage.reduce((s, r) => s + (r.storage_bytes || 0), 0), [usage]);

  const chartConfig = {
    commands: { label: "Commands", color: "hsl(var(--primary))" },
    api: { label: "API Calls", color: "hsl(var(--chart-2))" },
    storage: { label: "Storage Bytes", color: "hsl(var(--chart-3))" },
  } as const;

  const handleInvite = async () => {
    if (!teamId || !inviteEmail) return;
    // Resolve team UUID from router or path fallback
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pathMatch = (typeof window !== 'undefined' ? window.location.pathname.match(uuidRegex) : null);
    const teamUuid = (teamId && uuidRegex.test(teamId) ? teamId : (pathMatch ? pathMatch[0] : '')).trim();
    // Debug log to help diagnose any remaining issues in the wild
    try { console.log('invite-debug', { teamIdFromParams: teamId, teamUuidResolved: teamUuid, path: typeof window !== 'undefined' ? window.location.pathname : '' }); } catch {}
    // Guard: ensure a valid UUID string is passed to RPCs
    if (!uuidRegex.test(teamUuid)) {
      toast({ title: "Invite failed", description: "Invalid or missing team id.", variant: "destructive" });
      return;
    }
    const email = inviteEmail.trim().toLowerCase();
    setInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in to send invites");

      // 0) Inviter must be Pro (UI-side)
      const inviterIsPro = (profile?.plan === 'pro') || (profile?.subscription_status === 'active');
      if (!inviterIsPro) {
        throw new Error("Only Pro users can send invites");
      }

      // 1) Use SECURITY DEFINER RPC to get invitee status under RLS
      const { data: status, error: statusErr } = await (supabase as any)
        .rpc('invitee_status', { p_team_id: teamUuid, p_email: email });
      if (statusErr) throw statusErr;
      const st: any = status || {};
      if (!st.exists) throw new Error("No user with that email");
      if (!st.is_pro) throw new Error("User does not have a Pro subscription");
      if (st.in_team) throw new Error("User is already a member of this team");
      if ((st.team_count ?? 0) >= 3) throw new Error("User is already in the maximum number of teams");
      if (st.has_active_invite) throw new Error("An active invite already exists for this user");

      // All above validations are covered by invitee_status; avoid extra ephemeral queries that can leak undefined

      const { data, error } = await supabase.functions.invoke("create-invite", {
        body: { team_id: teamUuid, email },
      });
      if (error) throw new Error(error.message || "Failed to send invite");
      const sentInfo = typeof data === 'object' ? data as any : {} as any;
      const extra = sentInfo?.email_sent === false && sentInfo?.email_reason
        ? ` (email not sent: ${sentInfo.email_reason})`
        : "";
      toast({ title: "Invite created", description: `Invite Created.${extra}` });
      setInviteEmail("");
    } catch (e: any) {
      toast({ title: "Invite failed", description: e?.message || "Unknown error", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const ownerCount = useMemo(() => members.filter((m) => m.role === "owner").length, [members]);
  const canManage = currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = currentUserRole === "owner";

  const handleChangeRole = async (targetUserId: string, newRole: "owner" | "admin" | "member") => {
    if (!teamId) return;
    if (!canManage) return;

    const target = members.find((m) => m.user_id === targetUserId);
    if (!target) return;

    // Admins cannot change owners or set owner
    if (currentUserRole === "admin") {
      if (target.role === "owner" || newRole === "owner") {
        toast({ title: "Insufficient permissions", description: "Only owners can manage ownership.", variant: "destructive" });
        return;
      }
    }

    try {
      if (newRole === "owner") {
        if (!isOwner) {
          toast({ title: "Only owners can transfer ownership", variant: "destructive" });
          return;
        }
        // Promote target to owner
        const { error: upErr1 } = await (supabase
          .from("team_members" as any)
          .update({ role: "owner" })
          .eq("team_id", teamId)
          .eq("user_id", targetUserId) as any);
        if (upErr1) throw upErr1;
        // Demote current owner to admin if different user
        if (user?.id && user.id !== targetUserId) {
          const { error: upErr2 } = await (supabase
            .from("team_members" as any)
            .update({ role: "admin" })
            .eq("team_id", teamId)
            .eq("user_id", user.id) as any);
          if (upErr2) throw upErr2;
          setCurrentUserRole("admin");
        }
        setMembers((prev) => prev.map((m) => m.user_id === targetUserId ? { ...m, role: "owner" } : (m.user_id === user?.id ? { ...m, role: "admin" } : m)));
        toast({ title: "Ownership transferred" });
        return;
      }

      // Prevent removing last owner via self demotion
      if (targetUserId === user?.id && target.role === "owner" && ownerCount === 1 && (newRole === "admin" || newRole === "member")) {
        toast({ title: "Cannot demote last owner", description: "Transfer ownership first.", variant: "destructive" });
        return;
      }

      const { error } = await (supabase
        .from("team_members" as any)
        .update({ role: newRole })
        .eq("team_id", teamId)
        .eq("user_id", targetUserId) as any);
      if (error) throw error;
      setMembers((prev) => prev.map((m) => m.user_id === targetUserId ? { ...m, role: newRole } : m));
      if (targetUserId === user?.id) setCurrentUserRole(newRole);
      toast({ title: "Role updated" });
    } catch (e: any) {
      toast({ title: "Failed to update role", description: e?.message || "Unknown error", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!teamId) return;
    if (!canManage) return;
    const target = members.find((m) => m.user_id === targetUserId);
    if (!target) return;

    // Owners cannot be removed at all
    if (target.role === "owner") {
      toast({ title: "Owners cannot be removed", variant: "destructive" });
      return;
    }

    try {
      const { error } = await (supabase
        .from("team_members" as any)
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", targetUserId) as any);
      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId));
      toast({ title: "Member removed" });
    } catch (e: any) {
      toast({ title: "Failed to remove member", description: e?.message || "Unknown error", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/team-management")}>← Back</Button>
            {currentUserRole === 'owner' && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Rename team"
                  value={teamNameEdit}
                  onChange={(e) => setTeamNameEdit(e.target.value)}
                  className="w-56"
                />
                <Button
                  variant="outline"
                  disabled={isRenaming || !teamNameEdit.trim()}
                  onClick={async () => {
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                    const pathMatch = (typeof window !== 'undefined' ? window.location.pathname.match(uuidRegex) : null);
                    const teamUuid = (teamId && uuidRegex.test(teamId) ? teamId : (pathMatch ? pathMatch[0] : '')).trim();
                    if (!uuidRegex.test(teamUuid)) { toast({ title: 'Rename failed', description: 'Invalid team id', variant: 'destructive' }); return; }
                    setIsRenaming(true);
                    try {
                      const { error } = await supabase.functions.invoke('rename-team', { body: { team_id: teamUuid, name: teamNameEdit.trim() } });
                      if (error) throw new Error(error.message || 'Failed');
                      toast({ title: 'Team renamed' });
                    } catch (e: any) {
                      toast({ title: 'Rename failed', description: e?.message || 'Unknown error', variant: 'destructive' });
                    } finally { setIsRenaming(false); }
                  }}
                >Save</Button>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={async () => {
                    const ok = confirm('This will permanently delete the team for all members. Continue?');
                    if (!ok) return;
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                    const pathMatch = (typeof window !== 'undefined' ? window.location.pathname.match(uuidRegex) : null);
                    const teamUuid = (teamId && uuidRegex.test(teamId) ? teamId : (pathMatch ? pathMatch[0] : '')).trim();
                    if (!uuidRegex.test(teamUuid)) { toast({ title: 'Delete failed', description: 'Invalid team id', variant: 'destructive' }); return; }
                    setIsDeleting(true);
                    try {
                      const { error } = await supabase.functions.invoke('delete-team', { body: { team_id: teamUuid } });
                      if (error) throw new Error(error.message || 'Failed');
                      toast({ title: 'Team deleted' });
                      navigate('/team-management');
                    } catch (e: any) {
                      toast({ title: 'Delete failed', description: e?.message || 'Unknown error', variant: 'destructive' });
                    } finally { setIsDeleting(false); }
                  }}
                >Delete team</Button>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-light text-foreground mb-6">Team Analytics</h1>

          {loading ? (
            <Card className="glass-panel mb-8"><CardContent className="p-6 text-muted-foreground">Loading...</CardContent></Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="glass-panel"><CardHeader><CardTitle>Total Commands</CardTitle></CardHeader><CardContent className="text-3xl font-light">{totalCommands.toLocaleString()}</CardContent></Card>
                <Card className="glass-panel"><CardHeader><CardTitle>Total API Calls</CardTitle></CardHeader><CardContent className="text-3xl font-light">{totalApi.toLocaleString()}</CardContent></Card>
                <Card className="glass-panel"><CardHeader><CardTitle>Total Storage</CardTitle></CardHeader><CardContent className="text-3xl font-light">{totalStorage.toLocaleString()}</CardContent></Card>
              </div>

              <Card className="glass-panel mb-10">
                <CardHeader>
                  <CardTitle>Daily Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[320px] w-full">
                    <LineChart data={usage} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} minTickGap={24} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="command_count" name="Commands" stroke="var(--color-commands)" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="api_calls" name="API Calls" stroke="var(--color-api)" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="storage_bytes" name="Storage" stroke="var(--color-storage)" dot={false} strokeWidth={2} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Members</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Invite user</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite user to team</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email</Label>
                          <Input id="invite-email" type="email" placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setInviteEmail("")}>Cancel</Button>
                          <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>{inviting ? "Sending..." : "Send invite"}</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[180px] pl-0">Role</TableHead>
                        {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((m) => {
                        const isSelf = m.user_id === user?.id;
                        const rowEditable = canManage && (!isSelf || isOwner); // prevent admins editing self; owners can but guarded above
                        const isOwnerRow = m.role === "owner";
                        const adminCannotEditOwner = currentUserRole === "admin" && isOwnerRow;
                        const disableSelect = !rowEditable || adminCannotEditOwner || isOwnerRow; // never edit owner rows directly
                        const roleOptions: Array<"owner"|"admin"|"member"> = isOwner ? ["owner","admin","member"] : ["admin","member"];
                        return (
                          <TableRow key={m.user_id}>
                            <TableCell>{m.full_name || "User"}</TableCell>
                            <TableCell className="text-muted-foreground">{m.email}</TableCell>
                            <TableCell className="capitalize align-middle py-2 pl-0">
                              {disableSelect ? (
                                <span className="capitalize inline-block min-w-[160px] h-8 leading-8 text-sm">{m.role}</span>
                              ) : (
                                <Select value={m.role} onValueChange={(val) => handleChangeRole(m.user_id, val as any)}>
                                  <SelectTrigger className="w-[160px] h-8 text-sm ml-[-8px] pl-2 pr-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roleOptions.map((r) => (
                                      <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            {canManage ? (
                              <TableCell className="text-right">
                                {!isOwnerRow && (
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(m.user_id)} disabled={adminCannotEditOwner}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            ) : null}
                          </TableRow>
                        );
                      })}
                      {members.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={canManage ? 4 : 3} className="text-center text-muted-foreground">No members yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamDetails;


