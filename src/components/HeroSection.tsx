import { ScrollSection } from "@/components/ScrollSection";
import { Button } from "@/components/ui/button";
import { Terminal, Zap, Users, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <ScrollSection animation="fade" delay={200}>
          <div className="flex items-center justify-center mb-6">
            <Terminal className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              <span className="text-glow">Trem</span> - AI Terminal
              <br />
              for Command
              <br />
              <span className="text-primary">Intelligence</span>
            </h1>
          </div>
        </ScrollSection>

        <ScrollSection animation="slide-left" delay={400}>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your command-line experience with intelligent recall, 
            semantic search, and team knowledge sharing. Never forget a command again.
          </p>
        </ScrollSection>

        <ScrollSection animation="scale" delay={600}>
          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
            {user ? (
              <Link to="/settings">
                <Button size="lg" className="text-lg px-8 py-6 glow-ring">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6 glow-ring">
                  Start Free Trial
                </Button>
              </Link>
            )}
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Pricing
              </Button>
            </Link>
          </div>
        </ScrollSection>

        <ScrollSection animation="fade" delay={800}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-panel p-6 text-center">
              <Search className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Semantic Search</h3>
              <p className="text-muted-foreground text-sm">Find commands by meaning, not just text</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Intelligent Recall</h3>
              <p className="text-muted-foreground text-sm">AI-powered command history and suggestions</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Team Knowledge</h3>
              <p className="text-muted-foreground text-sm">Share runbooks and procedures seamlessly</p>
            </div>
          </div>
        </ScrollSection>
      </div>
    </section>
  );
};