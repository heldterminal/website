import { useEffect, useMemo, useRef, useState } from "react";

// A pinned, scroll-driven demo that morphs from a terminal into a Trem Search panel
// and back on reverse scroll. Pure React + CSS (no external motion libs).
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const MorphingSearchDemo = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 = terminal, 1 = search
  const [typed, setTyped] = useState("");

  const message = useMemo(
    () =>
      "Trem turns every successful command into shared, permissioned knowledge with full context (who ran it, where, flags, working directory). No more copy‑pasting from runbooks or pinging teammates.",
    []
  );

  // Progress based on how close we are to the search block below (0..1)
  useEffect(() => {
    const onScroll = () => {
      const el = searchRef.current;
      const viewport = window.innerHeight;
      if (!el) return;
      const sRect = el.getBoundingClientRect();
      // Start morph when the search panel is about 80% down the screen,
      // finish when it reaches about 20% from top.
      const start = viewport * 0.8;
      const end = viewport * 0.2;
      const p = clamp((start - sRect.top) / (start - end), 0, 1);
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Typewriter effect – run once on mount to avoid flicker while scrolling
  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      const speed = 14;
      for (let i = 0; i <= message.length; i++) {
        if (cancelled) return;
        setTyped(message.slice(0, i));
        await sleep(speed);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [message]);

  // Easing + interpolations
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const e = ease(progress);
  const radius = 16 + (28 - 16) * e;
  const terminalScale = 1 - 0.15 * e;
  const terminalTranslateY = 140 * e; // move down toward the search container
  const terminalOpacity = clamp(1 - e * 0.3, 0.2, 1); // keep visible longer
  const searchScale = 1; // static block below
  const searchTranslateY = 0; // static block below
  const searchOpacity = clamp(e, 0, 1);

  return (
    <section className="relative py-24 px-6">
      {/* Sticky terminal that leads into the next section below */}
      <div ref={wrapperRef} className="relative h-[120vh] md:h-[140vh]">
        <div className="sticky top-14 md:top-16 z-10">
          <div className="mx-auto w-full max-w-6xl min-h-[64vh] flex items-center">
            {/* Guiding arrow path into the search container (visual cue) */}

            <div className="flex items-center justify-center w-full pointer-events-none">
              <div
                className="glass-panel overflow-hidden w-full max-w-5xl"
                style={{
                  borderRadius: radius,
                  transform: `translateY(${terminalTranslateY}px) scale(${terminalScale})`,
                  opacity: terminalOpacity,
                }}
              >
                <div className="flex items-center space-x-2 px-4 py-2 border-b border-white/10 bg-black/30">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-sm text-foreground/70">bash — trem</span>
                </div>
                <div className="p-6 font-mono text-foreground/90">
                  <div className="flex items-start">
                    <span className="text-primary mr-2">$</span>
                    <span className="leading-relaxed">{typed}</span>
                    <span className="ml-1 animate-pulse">|</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search block below that we morph into */}
      <div ref={searchRef} className="mx-auto w-full max-w-6xl -mt-24">
        <div
          className="trem-search-panel p-6 md:p-8 rounded-3xl glass-panel"
          style={{ transform: `translateY(${searchTranslateY}px) scale(${searchScale})`, opacity: searchOpacity }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-sm">Ask AI</span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-foreground/70 text-sm">Search only</span>
            <span className="ml-auto px-3 py-1 rounded-full bg-white/5 text-foreground/70 text-sm">Trem · Model</span>
          </div>
          <div className="rounded-2xl bg-black/30 border border-white/10 p-6 md:p-8">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Make terminals <span className="text-primary">collaborative</span>
            </div>
            <p className="text-foreground/80 text-lg leading-relaxed max-w-3xl">
              Trem lets teams ask for commands instead of people. Search by intent, reuse safely, and keep knowledge
              close to where work happens — your terminal.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "Recall anything ever executed across your org — local shells, remote hosts, CI",
                "Ask in natural language and get the exact command to run",
                "Share and reuse with permissions; no need to DM the author",
                "Results include context: directory, env, flags, outputs, success rate",
                "Eliminate static runbooks with living, executable knowledge",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                  <span className="text-primary">→</span>
                  <span className="text-foreground/80">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MorphingSearchDemo;


