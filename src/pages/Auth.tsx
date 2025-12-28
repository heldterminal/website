// src/pages/auth.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Github, Mail } from "lucide-react";

type CheckResp = { confirmed: boolean; providers?: string[] };

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Parameters passed by the Hyper plugin
  const params = new URLSearchParams(window.location.search);
  const bridge = params.get("bridge");
  const callback = params.get("callback") || `${window.location.origin}/`;
  const providerParam = params.get("provider") || "";
  const code_challenge = params.get("code_challenge") || "";
  const code_challenge_method = params.get("code_challenge_method") || "s256";

  const autoStartedRef = useRef(false);

  const bridgeSession = async (session: any) => {
    try {
      if (!bridge) return;
      await fetch(bridge, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session,
          access_token: session?.access_token,
          refresh_token: session?.refresh_token,
        }),
      });
    } catch {
      // ignore bridge failures
    }
  };

  // On load: if signed in & bridge param, send session back; else auto-start OAuth if asked
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && bridge) {
        await bridgeSession(data.session);
        window.location.replace("/");
        return;
      }
      if (!data.session && bridge && providerParam && !autoStartedRef.current) {
        autoStartedRef.current = true;
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: providerParam as any,
          options: {
            redirectTo: `${window.location.origin}/auth?bridge=${encodeURIComponent(bridge)}`,
          },
        });
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
          setLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call Edge Function with anon headers so it always succeeds
  const checkEmailConfirmed = async (emailToCheck: string) => {
    const normalized = emailToCheck.trim().toLowerCase();
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const headers = anon ? { Authorization: `Bearer ${anon}`, apikey: anon } : undefined;

    try {
      const { data, error } = await supabase.functions.invoke<CheckResp>(
        "check-email-confirmed",
        { body: { email: normalized }, headers }
      );
      if (error) throw error;
      return { confirmed: !!data?.confirmed, providers: data?.providers ?? [], error: null };
    } catch (err: any) {
      return { confirmed: false, providers: [], error: err?.message || "Unknown error" };
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({ title: "Email required", description: "Enter your email first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast({ title: "Verification sent", description: "Check your inbox for the confirmation link." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to resend verification.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(false);

    const normalizedEmail = email.trim().toLowerCase();

    const { confirmed, providers, error: checkError } = await checkEmailConfirmed(normalizedEmail);
    if (checkError) {
      toast({ title: "Error", description: checkError, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (confirmed) {
      const hasPasswordLogin = (providers || []).includes("email");
      if (!hasPasswordLogin) {
        toast({
          title: "Use your OAuth provider",
          description: `This email is registered via ${providers?.join(", ") || "an OAuth provider"}. Use the corresponding button below.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Password login path
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          toast({
            title: "Check your password",
            description: "Or sign in with your OAuth provider if you originally used it.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        setLoading(false);
        return;
      }
      if (bridge && data?.session) await bridgeSession(data.session);
      window.location.replace("/");
      setLoading(false);
      return;
    }

    // Not confirmed/new
    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered")) {
        toast({
          title: "Account exists",
          description: "Please sign in instead (or use your OAuth provider).",
          variant: "destructive",
        });
      } else if (msg.includes("email sent")) {
        toast({ title: "Verification email sent", description: "Check your inbox to confirm your account." });
        setNeedsVerification(true);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setLoading(false);
      return;
    }

    toast({ title: "Almost there", description: "Please verify your e-mail to finish sign up." });
    setNeedsVerification(true);
    setLoading(false);
  };

  // Popup OAuth flow
  const openPopupAndWaitForSession = async (url?: string) => {
    if (!url) return;
    const width = 600, height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(url, "held-oauth",
      `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`);
    if (!popup) return;
    const check = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        clearInterval(check);
        try { popup.close(); } catch {}
        navigate("/");
      }
      if (popup.closed) clearInterval(check);
    }, 600);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    if (bridge) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?bridge=${encodeURIComponent(bridge)}`,
          queryParams: { prompt: "select_account consent" },
        },
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/`, queryParams: { prompt: "select_account consent" }, skipBrowserRedirect: true },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    await openPopupAndWaitForSession(data?.url);
    setLoading(false);
  };

  const handleGithubAuth = async () => {
    setLoading(true);
    if (bridge) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth?bridge=${encodeURIComponent(bridge)}`,
          queryParams: { prompt: "consent" },
        },
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/`, queryParams: { prompt: "consent" }, skipBrowserRedirect: true },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    await openPopupAndWaitForSession(data?.url);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
                  <div className="flex items-center justify-center mb-8">
            <Terminal className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Held</h1>
          </div>
        <Card className="glass-panel">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Welcome to Held</CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-powered terminal for command recall and team knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input id="email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      className="bg-background/50 border-border" />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input id="password" type="password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                      className="bg-background/50 border-border" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Working..." : "Continue"}
                  </Button>
                </form>
                {needsVerification && (
                  <div className="mt-3 text-center">
                    <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={loading}>
                      Resend verification email
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                    <Input id="signup-email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      className="bg-background/50 border-border" />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                    <Input id="signup-password" type="password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                      className="bg-background/50 border-border" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Working..." : "Continue"}
                  </Button>
                </form>
                {needsVerification && (
                  <div className="mt-3 text-center">
                    <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={loading}>
                      Resend verification email
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleGoogleAuth} disabled={loading}>
                  <Mail className="h-4 w-4 mr-2" /> Google
                </Button>
                <Button variant="outline" onClick={handleGithubAuth} disabled={loading}>
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
