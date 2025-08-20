import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Update profile with OAuth data when user signs in
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            updateProfileWithOAuthData(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfileWithOAuthData = async (user: User) => {
    try {
      const { provider } = user.app_metadata;
      let avatarUrl = user.user_metadata?.avatar_url;
      
      // Get avatar from different providers
      if (provider === 'google') {
        avatarUrl = user.user_metadata?.picture || user.user_metadata?.avatar_url;
      } else if (provider === 'github') {
        avatarUrl = user.user_metadata?.avatar_url;
      }

      await supabase.from('profiles').upsert({
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: avatarUrl,
        provider: provider,
        provider_id: user.user_metadata?.sub || user.user_metadata?.provider_id,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating profile with OAuth data:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};