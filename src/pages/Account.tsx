import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Terminal, User, Settings, LogOut, Shield, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const { user, profile, hyperToken, generateNewHyperToken, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Terminal className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Trem</h1>
          </div>
          <Card className="glass-panel">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">Not Signed In</CardTitle>
              <CardDescription className="text-muted-foreground">
                Please sign in to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Terminal className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Trem Account</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
              <CardDescription>
                Your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {profile?.full_name || user.email}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'}>
                      {profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                  <p className="text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/team")}>
                <Terminal className="h-4 w-4 mr-2" />
                Team Management
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/pricing")}>
                <Key className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hyper Plugin Integration */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Terminal className="h-5 w-5 mr-2" />
              Hyper Plugin Integration
            </CardTitle>
            <CardDescription>
              Manage your terminal authentication and API access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Terminal Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Your Hyper terminal is authenticated and can access Trem APIs
                  </p>
                </div>
                <Badge variant="default">Connected</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Token Status</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateNewHyperToken()}
                  >
                    Regenerate Token
                  </Button>
                </div>
                
                {hyperToken && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Current Token (first 20 chars):</p>
                    <code className="text-xs font-mono break-all">
                      {hyperToken.substring(0, 20)}...
                    </code>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• Click the User Icon in your Hyper terminal to open this page</p>
                <p>• Your terminal automatically includes authentication tokens in API requests</p>
                <p>• Regenerate token to refresh terminal access</p>
                <p>• Sign out here to revoke terminal access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
