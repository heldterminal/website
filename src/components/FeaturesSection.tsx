import { Brain, Users, Zap } from "lucide-react";
import { ScrollSection } from "@/components/ScrollSection";

export const FeaturesSection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 - Intelligent Recall */}
          <ScrollSection animation="slide-left" delay={200}>
            <div className="group p-8 rounded-xl transition-all duration-500 backdrop-blur-sm border border-white/5 hover:scale-105 hover:-translate-y-2 hover:rotate-1 h-full flex flex-col" style={{ 
              background: "linear-gradient(135deg, hsl(var(--background) / 0.4), hsl(var(--muted) / 0.2))"
            }}>
              <div className="space-y-4 flex-1">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 group-hover:animate-pulse"
                style={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
              >
                <Brain className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <h3 className="text-xl font-medium group-hover:translate-x-2 transition-transform duration-300" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>
                Intelligent Recall
              </h3>
              <p
                className="leading-relaxed text-sm"
                style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, fontWeight: 300 }}
              >
                Find any command you or your team has run — parameterized, deduplicated, and ranked by context.
              </p>
              </div>
            </div>
          </ScrollSection>

          {/* Feature 2 - Shared Team Knowledge */}
          <ScrollSection animation="scale" delay={400}>
            <div className="group p-8 rounded-xl transition-all duration-500 backdrop-blur-sm border border-white/5 hover:scale-105 hover:-translate-y-2 hover:-rotate-1 h-full flex flex-col" style={{ 
              background: "linear-gradient(135deg, hsl(var(--background) / 0.4), hsl(var(--muted) / 0.2))"
            }}>
            <div className="space-y-4 flex-1">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 group-hover:animate-pulse"
                style={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
              >
                <Users className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <h3 className="text-xl font-medium group-hover:translate-x-2 transition-transform duration-300" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>
                Shared Team Knowledge
              </h3>
              <p
                className="leading-relaxed text-sm"
                style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, fontWeight: 300 }}
              >
                Every executed command becomes reusable knowledge with ownership, permissions, and provenance.
              </p>
              </div>
            </div>
          </ScrollSection>

          {/* Feature 3 - Runbookless Ops */}
          <ScrollSection animation="slide-right" delay={600}>
            <div className="group p-8 rounded-xl transition-all duration-500 backdrop-blur-sm border border-white/5 hover:scale-105 hover:-translate-y-2 hover:rotate-1 h-full flex flex-col" style={{ 
              background: "linear-gradient(135deg, hsl(var(--background) / 0.4), hsl(var(--muted) / 0.2))"
            }}>
              <div className="space-y-4 flex-1">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 group-hover:animate-pulse"
                style={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
              >
                <Zap className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <h3 className="text-xl font-medium group-hover:translate-x-2 transition-transform duration-300" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>
                Runbookless Ops
              </h3>
              <p
                className="leading-relaxed text-sm"
                style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, fontWeight: 300 }}
              >
                Skip wikis and runbooks. Execute vetted, shareable commands inline with guardrails.
              </p>
              </div>
            </div>
          </ScrollSection>
        </div>
      </div>
    </section>
  );
};
