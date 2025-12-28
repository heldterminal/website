import { FlowNavigation } from "@/components/FlowNavigation";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FaqSection } from "@/components/FaqSection";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: "hsl(var(--background))" }}>
      <FlowNavigation />
      
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FaqSection />
        
        {/* Footer */}
        <footer 
          className="py-8 px-4 text-center"
          style={{ borderTop: "1px solid hsl(0 0% 15%)" }}
        >
          <p 
            className="text-sm tracking-widest"
            style={{ color: "hsl(0 0% 45%)" }}
          >
            ALL RIGHTS RESERVED © 2025
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
