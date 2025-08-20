import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { TerminalCard } from "./TerminalCard";
import { TremSearchCard } from "./TremSearchCard";

export const MorphingTerminal = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Framer Motion scroll progress with proper offset
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Transform progress to morph phases as specified
  const terminalProgress = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const morphProgress = useTransform(scrollYProgress, [0.25, 0.75], [0, 1]);
  const searchProgress = useTransform(scrollYProgress, [0.75, 1], [0, 1]);

  // Terminal transforms (0.00-0.25: scale 1→0.92, opacity 1→0.3)
  const terminalScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);
  const terminalOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);

  // Morph transforms (0.25-0.75: translateY -40px→0, blur 2px→0)  
  const morphY = useTransform(scrollYProgress, [0.25, 0.75], [-40, 0]);
  const morphBlur = useTransform(scrollYProgress, [0.25, 0.75], [2, 0]);

  // Search transforms (0.75-1.00: scale 0.95→1, opacity 0.4→1)
  const searchScale = useTransform(scrollYProgress, [0.75, 1], [0.95, 1]);
  const searchOpacity = useTransform(scrollYProgress, [0.4, 1], [0.4, 1]);

  // Fallback for reduced motion: simple cross-fade
  if (shouldReduceMotion) {
    const simpleTerminalOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const simpleSearchOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

    return (
      <section 
        ref={sectionRef}
        className="relative min-h-[250vh]"
      >
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-6xl mx-auto px-6">
            <motion.div
              style={{ opacity: simpleTerminalOpacity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <TerminalCard morphProgress={0} />
            </motion.div>
            <motion.div
              style={{ opacity: simpleSearchOpacity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <TremSearchCard morphProgress={1} isActive={true} />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[250vh]"
    >
      {/* Sticky container - no transforms on this node for Safari compatibility */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-6xl mx-auto px-6">
          
          {/* Terminal Card (0.00-0.25) */}
          <motion.div
            style={{
              scale: terminalScale,
              opacity: terminalOpacity,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <TerminalCard 
              layoutId="morph-container"
              morphProgress={morphProgress} 
            />
          </motion.div>

          {/* Morphing overlay (0.25-0.75) - keeps DOM mounted */}
          <motion.div
            style={{
              y: morphY,
              filter: `blur(${morphBlur}px)`,
              opacity: useTransform(scrollYProgress, [0.2, 0.3, 0.7, 0.8], [0, 1, 1, 0])
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full max-w-4xl">
              {/* Shared morph container with layoutId */}
              <motion.div 
                layoutId="morph-container"
                className="bg-card/95 backdrop-blur-md border border-border rounded-2xl overflow-hidden"
                style={{
                  boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.3)",
                }}
              >
                {/* Shared header with layoutId */}
                <motion.div 
                  layoutId="morph-header"  
                  className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border"
                >
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <motion.span 
                    layoutId="morph-title"
                    className="ml-3 text-sm text-muted-foreground font-mono"
                  >
                    {useTransform(morphProgress, (p) => 
                      p < 0.5 ? "bash — old-terminal" : "Trem AI — intelligent search"
                    )}
                  </motion.span>
                </motion.div>

                {/* Shared input area with layoutId */}
                <motion.div 
                  layoutId="morph-input"
                  className="p-6"
                >
                  <div className="font-mono text-sm relative">
                    <motion.span 
                      style={{
                        opacity: useTransform(morphProgress, (p) => p < 0.5 ? 1 : 0)
                      }}
                      className="block"
                    >
                      $ find . -name "*.log" | xargs grep "error"
                    </motion.span>
                    <motion.div
                      style={{
                        opacity: useTransform(morphProgress, (p) => p >= 0.5 ? 1 : 0)
                      }}
                      className="absolute inset-0"
                    >
                      <div className="flex items-center gap-3 p-4 bg-background/50 border border-primary/50 rounded-xl">
                        <span className="text-primary">🔍</span>
                        <span className="text-foreground">Search commands by intent...</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Search Card (0.75-1.00) */}
          <motion.div
            style={{
              scale: searchScale,
              opacity: searchOpacity,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <TremSearchCard 
              layoutId="morph-container"
              morphProgress={searchProgress}
              isActive={useTransform(scrollYProgress, (p) => p > 0.8)}
            />
          </motion.div>

          {/* Debug progress indicator */}
          {process.env.NODE_ENV === "development" && (
            <motion.div 
              className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg font-mono text-xs z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>Progress: {Math.round(scrollYProgress.get() * 100)}%</div>
              <div>
                Phase: {
                  scrollYProgress.get() < 0.25 ? "Terminal" :
                  scrollYProgress.get() < 0.75 ? "Morphing" : "Search"
                }
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};