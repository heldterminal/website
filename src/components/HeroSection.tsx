import { ScrollSection } from "@/components/ScrollSection";
import { Button } from "@/components/ui/button";
import { TerminalDemo } from "@/components/TerminalDemo";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleBookDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById('contact-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById('contact-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleDownloadClick = () => {
    // Placeholder for future .dmg download
    toast({
      title: "Download coming soon",
      description: "Mac .dmg installer will be available shortly.",
    });
  };

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 hero-grid opacity-30"></div>
      <div className="absolute inset-0 hero-glow"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-20 pt-16">
          {/* Left Column - Text Content */}
          <ScrollSection animation="slide-left" delay={200}>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-balance tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-400"
                  style={{ color: "hsl(var(--foreground))", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em" }}
                >
                  Your Team's Shared Knowledge Base{" "}
                  <span
                    style={{ color: "hsl(var(--primary))", fontWeight: 400 }}
                    className="animate-in fade-in duration-1000 delay-800"
                  >
                    Powered by AI.
                  </span>
                </h1>
              </div>

              <p
                className="text-lg leading-relaxed text-pretty max-w-2xl mt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600"
                style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, fontWeight: 300 }}
              >
                Every workflow remembered, every teammate aligned — Coro transforms scattered knowledge into a shared
                copilot.
              </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-800 mt-8">
              {user ? (
                <Link to="/settings">
                  <Button
                    size="lg"
                    className="px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                    style={{
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      fontWeight: 500,
                      boxShadow: "0 0 0 0 rgba(96, 165, 250, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 20px rgba(96, 165, 250, 0.3)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 0 0 rgba(96, 165, 250, 0.3)"
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={handleBookDemoClick}
                  className="px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                  style={{
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    fontWeight: 500,
                    boxShadow: "0 0 0 0 rgba(96, 165, 250, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(96, 165, 250, 0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 0 rgba(96, 165, 250, 0.3)"
                  }}
                >
                  Book a Demo
                </Button>
              )}
              {user ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDownloadClick}
                  className="px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 transform hover:-translate-y-1 bg-transparent"
                  style={{
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    backgroundColor: "transparent",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(var(--muted))"
                    e.currentTarget.style.borderColor = "rgba(161,161,170,0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderColor = "hsl(var(--border))"
                  }}
                >
                  Download
                </Button>
              ) : (
                <Link to="/auth">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 transform hover:-translate-y-1 bg-transparent"
                    style={{
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      backgroundColor: "transparent",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "hsl(var(--muted))"
                      e.currentTarget.style.borderColor = "rgba(161,161,170,0.3)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.borderColor = "hsl(var(--border))"
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              )}
            </div>
          </ScrollSection>

          {/* Right Column - Terminal Demo */}
          <ScrollSection animation="slide-right" delay={600}>
            <div className="relative lg:pl-8 z-10 hover:scale-[1.02] transition-transform duration-700">
              <TerminalDemo />
            </div>
          </ScrollSection>
        </div>
      </div>
    </section>
  );
};