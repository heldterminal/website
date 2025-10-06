import { FlowNavigation } from "@/components/FlowNavigation";
import { HeroSection } from "@/components/HeroSection";
import { ContactSection } from "@/components/ContactSection";
import TerminalBackground from "@/components/TerminalBackground";
import { FaqSection } from "@/components/FaqSection";
import LiquidEther from "@/components/LiquidEther";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { Brain, Users, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: "hsl(var(--background))" }}>
      {/* Liquid Ether Background - Fixed, full page, behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <LiquidEther
          colors={['#0EA5E9', '#3B82F6', '#60A5FA']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.34}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={100}
          autoRampDuration={0.2}
        />
      </div>
      
      <TerminalBackground />
      <FlowNavigation />
      
      
      <main className="relative z-10">
        <HeroSection />
        
        {/* ScrollStack Features Section - No gap, seamless transition */}
        <section className="relative h-[280vh] -mt-1 bg-transparent">
          <div className="max-w-3xl mx-auto px-4">
            <ScrollStack 
              useWindowScroll={true}
              itemDistance={400}
              itemStackDistance={30}
              stackPosition="30%"
              scaleEndPosition="25%"
              baseScale={0.95}
              itemScale={0.02}
            >
            <ScrollStackItem itemClassName="glass-panel border border-white/10 bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-md">
              <div className="group h-full flex flex-col">
                <div className="space-y-6 flex-1">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
                  >
                    <Brain className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <h3 className="text-3xl font-medium" style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>
                    Intelligent Recall
                  </h3>
                  <p
                    className="leading-relaxed text-lg"
                    style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.7, fontWeight: 300 }}
                  >
                    Find any command you or your team has run — parameterized, deduplicated, and ranked by context.
                  </p>
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem itemClassName="glass-panel border border-white/10 bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-md">
              <div className="group h-full flex flex-col">
                <div className="space-y-6 flex-1">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
                  >
                    <Users className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <h3 className="text-3xl font-medium" style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>
                    Shared Team Knowledge
                  </h3>
                  <p
                    className="leading-relaxed text-lg"
                    style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.7, fontWeight: 300 }}
                  >
                    Every executed command becomes reusable knowledge with ownership, permissions, and provenance.
                  </p>
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem itemClassName="glass-panel border border-white/10 bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-md">
              <div className="group h-full flex flex-col">
                <div className="space-y-6 flex-1">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
                  >
                    <Zap className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <h3 className="text-3xl font-medium" style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>
                    Runbookless Ops
                  </h3>
                  <p
                    className="leading-relaxed text-lg"
                    style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.7, fontWeight: 300 }}
                  >
                    Skip wikis and runbooks. Execute vetted, shareable commands inline with guardrails.
                  </p>
                </div>
              </div>
            </ScrollStackItem>
            </ScrollStack>
          </div>
        </section>
        
        {/* Buffer space to prevent overlap */}
        <div className="h-32"></div>
        
        <ContactSection />
        <FaqSection />
      </main>
    </div>
  );
};

export default Index;
