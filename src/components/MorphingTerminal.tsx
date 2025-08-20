import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { TerminalCard } from "./TerminalCard";
import { TremSearchCard } from "./TremSearchCard";

interface MorphingTerminalProps {
  line?: string;
}

export const MorphingTerminal = ({ 
  line = "Trem turns every successful command into shared, permissioned knowledge…" 
}: MorphingTerminalProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Terminal states (0.00 → 0.18)
  const terminalScale = useTransform(scrollYProgress, [0, 0.18, 0.22], [1, 1, 0.94]);
  const terminalOpacity = useTransform(scrollYProgress, [0, 0.18, 0.22, 0.78], [1, 1, 0.35, 0.15]);
  const terminalBlur = useTransform(scrollYProgress, [0.18, 0.22], [0, 2]);

  // Search card states (0.55 → 1.00)
  const searchScale = useTransform(scrollYProgress, [0.55, 0.78, 1], [0.96, 1, 1]);
  const searchOpacity = useTransform(scrollYProgress, [0.55, 0.78], [0.4, 1]);

  // Text flow visibility ranges
  const showTerminalText = useTransform(scrollYProgress, [0, 0.18, 0.22], [1, 1, 0]);
  const showSearchText = useTransform(scrollYProgress, [0.55, 0.78], [0, 1]);
  const showFloatingText = useTransform(scrollYProgress, [0.22, 0.55], [1, 1]);

  const floatingTextY = useTransform(scrollYProgress, [0.22, 0.55], [0, -100]);
  const floatingTextX = useTransform(scrollYProgress, [0.22, 0.55], [0, 50]);

  return (
    <div ref={sectionRef} className="relative min-h-[300vh]">
      {/* Sticky canvas */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        {/* Terminal Card */}
        <motion.div
          style={{
            scale: terminalScale,
            opacity: terminalOpacity,
            filter: useTransform(terminalBlur, (blur) => `blur(${blur}px)`),
          }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <TerminalCard 
            line={line}
            showText={showTerminalText}
            progress={scrollYProgress}
          />
        </motion.div>

        {/* Floating text during transition */}
        <motion.div
          style={{
            opacity: showFloatingText,
            y: floatingTextY,
            x: floatingTextX,
          }}
          className="absolute z-20 pointer-events-none"
        >
          <motion.div 
            layoutId="flowingText" 
            className="text-foreground font-mono text-sm px-2 py-1 bg-card/80 backdrop-blur-sm rounded border"
          >
            {line}
          </motion.div>
        </motion.div>

        {/* Search Card */}
        <motion.div
          style={{
            scale: searchScale,
            opacity: searchOpacity,
          }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <TremSearchCard 
            line={line}
            showText={showSearchText}
            progress={scrollYProgress}
          />
        </motion.div>
      </div>
    </div>
  );
};