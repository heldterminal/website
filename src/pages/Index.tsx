import { FlowNavigation } from "@/components/FlowNavigation";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ContactSection } from "@/components/ContactSection";
import TerminalBackground from "@/components/TerminalBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "hsl(var(--background))" }}>
      <TerminalBackground />
      <FlowNavigation />
      
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-blue-500/20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 rounded-full bg-purple-500/30 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 rounded-full bg-green-500/10 animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-yellow-500/25 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 rounded-full bg-red-500/15 animate-bounce"></div>
      </div>
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default Index;
