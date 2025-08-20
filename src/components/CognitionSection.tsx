import { ScrollSection } from "./ScrollSection";
import { Brain, Zap, Network, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";

const features = [
  {
    icon: Brain,
    title: "Command Recall",
    description: "Find any command you or your team has run — parameterized, deduplicated, and ranked by context.",
    delay: 0
  },
  {
    icon: Zap,
    title: "Semantic Search",
    description: "Search by intent (e.g., \"fetch prod logs from api\") and get the exact command, not a link.",
    delay: 200
  },
  {
    icon: Network,
    title: "Team Knowledge Graph",
    description: "Every executed command becomes reusable knowledge with ownership, permissions, and provenance.",
    delay: 400
  },
  {
    icon: Target,
    title: "Runbookless Ops",
    description: "Skip wikis and runbooks. Execute vetted, shareable commands inline with guardrails.",
    delay: 600
  }
];

export const CognitionSection = () => {
  return (
    <section id="cognition" className="relative py-32 px-6">
      <div className="absolute inset-0 flow-gradient opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollSection animation="fade" delay={200}>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-glow">
              Trem
              <span className="text-primary"> Architecture</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              The recall and semantic-search terminal that decentralizes knowledge. Ask for a command, 
              get an executable answer, and let teammates reuse it without asking you.
            </p>
          </div>
        </ScrollSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const cardRef = useRef<HTMLDivElement>(null);
            const baseP = useSmoothProgress(cardRef, { startPct: 0.92, endPct: 0.4, smoothing: 0.08 });
            // Stagger each card a bit for natural feel
            const p = Math.max(0, Math.min(1, baseP - (index % 2 ? 0.04 : 0)));

            const fromLeft = index % 2 === 0;
            const translate = (fromLeft ? -40 : 40) * (1 - p);
            const opacity = 0.4 + 0.6 * p;
            const scale = 0.98 + 0.02 * p;

            return (
              <div key={feature.title} ref={cardRef} className="group">
                <div
                  className="glass-panel p-8 h-full hover:glow-ring"
                  style={{
                    transform: `translateZ(0) translateX(${translate}px) scale(${scale})`,
                    opacity,
                    willChange: "transform, opacity",
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                      <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ScrollSection animation="scale" delay={800}>
          <div className="glass-panel p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-glow">
              Ask for commands, not people
            </h3>
            {(() => {
              const [typed, setTyped] = useState("");
              useEffect(() => {
                let cancelled = false;
                const message =
                  "Trem turns every successful command into shared, permissioned knowledge with full context (who ran it, where, flags, working directory). No more copy‑pasting from runbooks or pinging teammates.";
                const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
                (async () => {
                  for (let i = 0; i <= message.length; i++) {
                    if (cancelled) return;
                    setTyped(message.slice(0, i));
                    await sleep(12);
                  }
                })();
                return () => {
                  cancelled = true;
                };
              }, []);
              return (
                <div className="max-w-3xl mx-auto mt-4 text-left">
                  <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden shadow-lg">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                      <span className="ml-3 text-sm text-foreground/70">bash — trem</span>
                    </div>
                    <div className="p-5 font-mono text-foreground/90">
                      <span className="text-primary mr-2">$</span>
                      <span>{typed}</span>
                      <span className="ml-1 animate-pulse">|</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </ScrollSection>
      </div>
    </section>
  );
};