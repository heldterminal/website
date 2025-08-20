import { useState, useEffect } from "react";
import { ScrollSection } from "./ScrollSection";
import { Eye, Layers, Sparkles, ArrowRight } from "lucide-react";

export const VisionSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visionPoints = [
    "Recall anything ever executed across your org — local shells, remote hosts, CI",
    "Ask in natural language and get the exact command to run",
    "Share and reuse with permissions; no need to DM the author",
    "Results include context: directory, env, flags, outputs, success rate",
    "Eliminate static runbooks with living, executable knowledge"
  ];

  return (
    <section id="vision" className="relative py-32 px-6 overflow-hidden">
      {/* Parallax background layers */}
      <div 
        className="absolute inset-0 surface-gradient opacity-30"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />
      <div 
        className="absolute inset-0 flow-gradient opacity-40"
        style={{ transform: `translateY(${scrollY * -0.2}px)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <ScrollSection animation="slide-left" delay={200}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <span className="text-primary font-medium">Why Trem</span>
              </div>
              
              <h2 className="text-5xl font-bold mb-6 text-glow">
                Make terminals
                <span className="text-primary block">collaborative</span>
              </h2>
              
              <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
                Trem lets teams ask for commands instead of people. Search by intent, reuse safely, 
                and keep knowledge close to where work happens — your terminal.
              </p>
            </ScrollSection>

            <div className="space-y-4">
              {visionPoints.map((point, index) => (
                <ScrollSection 
                  key={index}
                  animation="slide-left" 
                  delay={400 + index * 100}
                >
                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground/80">{point}</span>
                  </div>
                </ScrollSection>
              ))}
            </div>
          </div>

          <div className="relative">
            <ScrollSection animation="scale" delay={600}>
              <div className="relative">
                {/* Central hub */}
                <div className="glass-panel p-8 text-center relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Trem Core</h3>
                  <p className="text-sm text-foreground/70">Recall + Search Engine</p>
                </div>

                {/* Orbiting elements */}
                {[
                  { icon: Layers, label: "Recall", angle: 0 },
                  { icon: Eye, label: "Search", angle: 72 },
                  { icon: Sparkles, label: "Teams", angle: 144 },
                  { icon: ArrowRight, label: "Context", angle: 216 },
                  { icon: Layers, label: "Guardrails", angle: 288 }
                ].map((item, index) => {
                  const Icon = item.icon;
                  const radius = 120;
                  const x = Math.cos((item.angle * Math.PI) / 180) * radius;
                  const y = Math.sin((item.angle * Math.PI) / 180) * radius;
                  
                  return (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                        animation: `orbit 20s linear infinite`,
                        animationDelay: `${index * 0.5}s`
                      }}
                    >
                      <div className="glass-panel p-4 w-20 h-20 flex flex-col items-center justify-center">
                        <Icon className="w-5 h-5 text-primary mb-1" />
                        <span className="text-xs text-foreground/70">{item.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollSection>
          </div>
        </div>
      </div>

    </section>
  );
};