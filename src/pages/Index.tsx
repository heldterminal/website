import { FlowNavigation } from "@/components/FlowNavigation";
import { HeroSection } from "@/components/HeroSection";
import { CognitionSection } from "@/components/CognitionSection";
import CoroSearchPanel from "@/components/CoroSearchPanel";
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
        <CoroSearchPanel />
        <ExperienceSection />
      </main>
    </div>
  );
};

export default Index;
