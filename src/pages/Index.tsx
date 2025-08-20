import { FlowNavigation } from "@/components/FlowNavigation";
import { HeroSection } from "@/components/HeroSection";
import { CognitionSection } from "@/components/CognitionSection";
import { MorphingTerminal } from "@/components/MorphingTerminal";
import { ExperienceSection } from "@/components/ExperienceSection";
import TerminalBackground from "@/components/TerminalBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <TerminalBackground />
      <FlowNavigation />
      <main>
        <HeroSection />
        <CognitionSection />
        <MorphingTerminal />
        <ExperienceSection />
      </main>
    </div>
  );
};

export default Index;
