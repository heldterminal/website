import { useEffect, useRef, useState } from "react";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { TerminalCard } from "./TerminalCard";
import { TremSearchCard } from "./TremSearchCard";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const MorphingTerminal = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Enhanced scroll progress tracking
  useEffect(() => {
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate progress across the section (0 = top, 1 = bottom)
      const progress = clamp(
        -rect.top / (wrapperHeight - viewportHeight),
        0,
        1
      );
      
      setScrollProgress(progress);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Animation phases based on UX spec
  const terminalPhase = clamp((0.25 - scrollProgress) / 0.25, 0, 1); // 1 -> 0 from 0 to 0.25
  const morphPhase = clamp((scrollProgress - 0.25) / 0.5, 0, 1); // 0 -> 1 from 0.25 to 0.75
  const searchPhase = clamp((scrollProgress - 0.75) / 0.25, 0, 1); // 0 -> 1 from 0.75 to 1

  // Easing function for smooth transitions
  const easeInOutCubic = (t: number) => 
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const easedMorphPhase = easeInOutCubic(morphPhase);

  // Terminal transformations
  const terminalOpacity = Math.max(0.1, 1 - easedMorphPhase * 0.9);
  const terminalScale = 1 - easedMorphPhase * 0.14; // 1 -> 0.86
  const terminalTranslateY = -easedMorphPhase * 40; // Move up
  const terminalBlur = easedMorphPhase * 2;

  // Search transformations  
  const searchOpacity = easedMorphPhase;
  const searchScale = 0.9 + easedMorphPhase * 0.1; // 0.9 -> 1
  const searchTranslateY = (1 - easedMorphPhase) * 60; // Move into place
  const searchGlow = easedMorphPhase;

  return (
    <section 
      ref={wrapperRef}
      className="relative"
      style={{ height: "300vh" }} // Long scroll section
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-6xl mx-auto px-6">
          
          {/* Terminal Card */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: terminalOpacity,
              transform: `scale(${terminalScale}) translateY(${terminalTranslateY}px)`,
              filter: `blur(${terminalBlur}px)`,
              zIndex: scrollProgress < 0.5 ? 20 : 10,
              transition: "none",
            }}
          >
            <TerminalCard morphProgress={morphPhase} />
          </div>

          {/* Search Card */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: searchOpacity,
              transform: `scale(${searchScale}) translateY(${searchTranslateY}px)`,
              filter: `drop-shadow(0 0 ${searchGlow * 20}px hsl(var(--primary) / 0.3))`,
              zIndex: scrollProgress >= 0.5 ? 20 : 10,
              transition: "none",
            }}
          >
            <TremSearchCard 
              morphProgress={morphPhase} 
              isActive={scrollProgress > 0.75}
            />
          </div>

          {/* Progress indicator (debug) */}
          {process.env.NODE_ENV === "development" && (
            <div className="fixed top-4 right-4 bg-black/50 text-white p-2 rounded text-sm font-mono z-50">
              Progress: {(scrollProgress * 100).toFixed(1)}%
              <br />
              Phase: {scrollProgress < 0.25 ? "Terminal" : scrollProgress < 0.75 ? "Morphing" : "Search"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};