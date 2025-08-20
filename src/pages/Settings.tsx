import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FlowNavigation } from "@/components/FlowNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Settings as SettingsIcon, CreditCard, CheckCircle, Crown } from "lucide-react";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    github_username: ""
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
        setProfileData({
          full_name: data.full_name || "",
          email: data.email || user?.email || "",
          github_username: data.github_username || ""
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          email: user?.email || ""
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
          full_name: profileData.full_name,
          email: profileData.email,
          github_username: profileData.github_username
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      // Refresh the auth profile
      await refreshProfile();
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
    setBillingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to access billing portal. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBillingLoading(false);
    }
  };

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
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-background/50 border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-background/50 border-border"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="github_username" className="text-foreground">GitHub Username</Label>
                    <Input
                      id="github_username"
                      value={profileData.github_username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, github_username: e.target.value }))}
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
                  <CardTitle className="text-foreground">Billing & Subscription</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your subscription and billing information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border border-border rounded-lg bg-background/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">Current Plan</h3>
                        {profile?.plan === 'pro' && (
                          <Crown className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="text-primary font-medium capitalize">
                        {profile?.plan || 'free'} Plan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.plan === 'pro' 
                          ? 'Unlimited tokens and premium features' 
                          : '5,000 tokens per month'
                        }
                      </p>
                      {profile?.subscription_status && profile.subscription_status !== 'active' && (
                        <p className="text-sm text-destructive mt-1">
                          Status: {profile.subscription_status}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {profile?.plan === 'free' ? (
                        <Button 
                          className="w-full md:w-auto" 
                          onClick={handleUpgrade}
                          disabled={billingLoading}
                        >
                          {billingLoading ? "Loading..." : "Upgrade to Pro"}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full md:w-auto"
                          onClick={handleManageBilling}
                          disabled={billingLoading}
                        >
                          {billingLoading ? "Loading..." : "Manage Billing"}
                        </Button>
                      )}
                    </div>
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