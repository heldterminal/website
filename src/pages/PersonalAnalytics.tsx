import { FlowNavigation } from "@/components/FlowNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UsageRow = {
  day: string;
  api_calls: number;
  token_count: number;
  storage_bytes: number;
};

type CommandRow = {
  ts_start: string;
  cmd: string;
  cwd: string;
  exit_code: number | null;
  stdout: string | null;
  stderr: string | null;
  ssh_host: string | null;
  ssh_user: string | null;
};

const PersonalAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [commands, setCommands] = useState<CommandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [todayUsage, setTodayUsage] = useState({ api_calls: 0, token_count: 0, storage_bytes: 0 });
  const [selectedMetric, setSelectedMetric] = useState<"token_count" | "api_calls" | "storage_bytes">("token_count");

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // First, get the user's default_team_id from profiles
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("default_team_id")
          .eq("user_id", user.id)
          .single();

        if (profileErr) {
          console.error("Profile fetch error:", profileErr);
        }

        const defaultTeamId = profileData?.default_team_id;
        console.log("Fetching analytics for:", { userId: user.id, defaultTeamId });

        // Fetch usage data for this user from team_usage_daily
        let usageRows = [];
        if (defaultTeamId) {
          const { data, error: usageErr } = await supabase
            .from("team_usage_daily")
            .select("day, api_calls, token_count, storage_bytes")
            .eq("user_id", user.id)
            .eq("team_id", defaultTeamId)
            .order("day", { ascending: true });

          if (usageErr) {
            console.error("Usage fetch error:", usageErr);
          } else {
            console.log("Usage data fetched:", data);
            usageRows = data || [];
          }
        }

        // Fetch commands for this user
        const { data: commandRows, error: cmdErr } = await supabase
          .from("commands")
          .select("ts_start, cmd, cwd, exit_code, stdout, stderr, ssh_host, ssh_user")
          .eq("user_id", user.id)
          .order("ts_start", { ascending: false });

        if (cmdErr) {
          console.error("Commands fetch error:", cmdErr);
        }

        setUsage(usageRows || []);
        setCommands(commandRows || []);

        // Calculate today's usage
        const today = new Date().toISOString().split("T")[0];
        console.log("Today's date:", today);
        const todayData = (usageRows || []).find((r) => r.day === today);
        console.log("Today's usage data:", todayData);
        
        if (todayData) {
          setTodayUsage({
            api_calls: todayData.api_calls || 0,
            token_count: todayData.token_count || 0,
            storage_bytes: todayData.storage_bytes || 0,
          });
        } else {
          // Reset to 0 if no data for today
          setTodayUsage({
            api_calls: 0,
            token_count: 0,
            storage_bytes: 0,
          });
        }
      } catch (e: any) {
        console.error("Fetch error:", e);
        toast({
          title: "Failed to load personal analytics",
          description: e?.message || "Unknown error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const chartConfig = {
    token_count: { label: "Tokens", color: "#3b82f6" }, // Blue
    api_calls: { label: "API Calls", color: "#f97316" }, // Orange
    storage_bytes: { label: "Storage (bytes)", color: "#10b981" }, // Green
  } as const;

  const metricLabels = {
    token_count: "Tokens",
    api_calls: "API Calls",
    storage_bytes: "Storage (bytes)",
  };

  // Filter usage to last 14 days only
  const last14DaysUsage = useMemo(() => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const cutoffDate = fourteenDaysAgo.toISOString().split("T")[0];
    
    return usage.filter(row => row.day >= cutoffDate);
  }, [usage]);

  const paginatedCommands = commands.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(commands.length / ITEMS_PER_PAGE);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/settings")}>
              ← Back
            </Button>
          </div>

          <h1 className="text-3xl font-light text-foreground mb-6">Personal Analytics</h1>

          {loading ? (
            <Card className="glass-panel mb-8">
              <CardContent className="p-6 text-muted-foreground">Loading...</CardContent>
            </Card>
          ) : (
            <>
              {/* Today's Usage */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Today's Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass-panel">
                    <CardHeader>
                      <CardTitle>API Calls</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-light">
                      {todayUsage.api_calls.toLocaleString()}
                    </CardContent>
                  </Card>
                  <Card className="glass-panel">
                    <CardHeader>
                      <CardTitle>Tokens</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-light">
                      {todayUsage.token_count.toLocaleString()}
                    </CardContent>
                  </Card>
                  <Card className="glass-panel">
                    <CardHeader>
                      <CardTitle>Storage</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-light">
                      {formatBytes(todayUsage.storage_bytes)}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Command History Table */}
              <Card className="glass-panel mb-8">
                <CardHeader>
                  <CardTitle>Command History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Command</TableHead>
                        <TableHead>Directory</TableHead>
                        <TableHead>Exit Code</TableHead>
                        <TableHead>SSH</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCommands.map((cmd, idx) => (
                        <TableRow key={`${cmd.ts_start}-${idx}`}>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatTimestamp(cmd.ts_start)}
                          </TableCell>
                          <TableCell className="font-mono text-sm max-w-xs truncate">
                            {cmd.cmd}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {cmd.cwd || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                cmd.exit_code === 0
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {cmd.exit_code ?? "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {cmd.ssh_host
                              ? `${cmd.ssh_user || ""}@${cmd.ssh_host}`
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedCommands.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No commands yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Graph */}
              <Card className="glass-panel">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Usage Over Time</CardTitle>
                  <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="token_count">Tokens</SelectItem>
                      <SelectItem value="api_calls">API Calls</SelectItem>
                      <SelectItem value="storage_bytes">Storage (bytes)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {last14DaysUsage.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[320px] w-full">
                      <LineChart data={last14DaysUsage} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} minTickGap={24} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey={selectedMetric}
                          name={metricLabels[selectedMetric]}
                          stroke={chartConfig[selectedMetric].color}
                          dot={true}
                          strokeWidth={2}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No usage data available yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PersonalAnalytics;
