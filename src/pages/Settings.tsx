import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FlowNavigation } from "@/components/FlowNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Settings as SettingsIcon, CreditCard, Crown, ExternalLink, CheckCircle } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    github_username: "",
    subscription_status: "free",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user?.email || "",
          github_username: data.github_username || "",
          subscription_status: data.subscription_status || "free",
          avatar_url: data.avatar_url || "",
        });
      } else {
        setProfile(prev => ({
          ...prev,
          email: user?.email || "",
          subscription_status: "free",
        }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          github_username: profile.github_username
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    setBillingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session');
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    
    setBillingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');
      
      if (error) throw error;
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to open billing portal",
        variant: "destructive"
      });
    } finally {
      setBillingLoading(false);
    }
  };

  const isPro = profile.subscription_status === 'active';

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      
      <main className="pt-20 px-4">
        <div className="max-w-4xl mx-auto py-12">
          <div className="flex items-center mb-8">
            <SettingsIcon className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-foreground">Profile Information</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Update your profile information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name" className="text-foreground">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-background/50 border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-background/50 border-border"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="github_username" className="text-foreground">GitHub Username</Label>
                    <Input
                      id="github_username"
                      value={profile.github_username}
                      onChange={(e) => setProfile(prev => ({ ...prev, github_username: e.target.value }))}
                      placeholder="Optional"
                      className="bg-background/50 border-border"
                    />
                  </div>

                  <Button onClick={updateProfile} disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your subscription and billing information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="p-6 border border-border rounded-xl bg-background/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">Current Plan</h3>
                          {isPro && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <Crown className="h-3 w-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                        </div>
                        {isPro && (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {isPro ? "Trem Pro" : "Free Tier"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isPro 
                              ? "$20/month • Unlimited commands • Team collaboration" 
                              : "5,000 tokens per month • Basic features"
                            }
                          </p>
                        </div>

                        {isPro && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                              <div className="text-sm font-medium text-foreground">✅ Unlimited command recall</div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                              <div className="text-sm font-medium text-foreground">✅ Team collaboration</div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                              <div className="text-sm font-medium text-foreground">✅ Advanced AI search</div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                              <div className="text-sm font-medium text-foreground">✅ Priority support</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {isPro ? (
                        <>
                          <Button 
                            onClick={handleManageBilling}
                            disabled={billingLoading}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {billingLoading ? "Opening..." : "Manage Billing"}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={fetchProfile}
                            className="flex items-center gap-2"
                          >
                            Refresh Status
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            onClick={handleUpgrade}
                            disabled={billingLoading}
                            className="flex items-center gap-2"
                          >
                            <Crown className="h-4 w-4" />
                            {billingLoading ? "Creating..." : "Upgrade to Pro"}
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            View Features
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Billing Info */}
                    {!isPro && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">Why upgrade to Pro?</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Unlimited command history and AI-powered search</li>
                          <li>• Share commands securely with your team</li>
                          <li>• Advanced context tracking (env, flags, outputs)</li>
                          <li>• Replace static runbooks with living knowledge</li>
                          <li>• Priority support and feature updates</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-foreground">Preferences</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Customize your Trem experience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border border-border rounded-lg bg-background/30">
                      <h3 className="font-semibold text-foreground mb-2">Command History</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Automatically track and analyze your terminal commands
                      </p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg bg-background/30">
                      <h3 className="font-semibold text-foreground mb-2">AI Models</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose your preferred AI model for command suggestions
                      </p>
                      <Button variant="outline" size="sm">Manage Models</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;