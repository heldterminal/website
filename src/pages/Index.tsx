import { FlowNavigation } from "@/components/FlowNavigation";
import { MorphingTerminal } from "@/components/MorphingTerminal";
import { CognitionSection } from "@/components/CognitionSection";
import TremSearchPanel from "@/components/TremSearchPanel";
import { ExperienceSection } from "@/components/ExperienceSection";
import TerminalBackground from "@/components/TerminalBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <TerminalBackground />
      <FlowNavigation />
      <main>
        <MorphingTerminal />
        <CognitionSection />
        <TremSearchPanel />
        <ExperienceSection />
      </main>
    </div>
  );
};

export default Index;
