import { RefObject, useEffect, useRef, useState } from "react";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * Returns a smoothed 0..1 progress value for an element as it passes through the viewport.
 * - startPct: viewport percentage where the animation begins (0..1 from top)
 * - endPct: viewport percentage where the animation ends (0..1 from top)
 * - smoothing: how quickly current approaches target (0..1, lower is smoother)
 */
export function useSmoothProgress(
  targetRef: RefObject<HTMLElement>,
  options?: { startPct?: number; endPct?: number; smoothing?: number }
) {
  const { startPct = 0.9, endPct = 0.35, smoothing = 0.12 } = options || {};
  const [progress, setProgress] = useState(0);
  const target = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * startPct;
      const end = vh * endPct;
      target.current = clamp((start - rect.top) / (start - end), 0, 1);
    };

    const tick = () => {
      setProgress((prev) => {
        const next = prev + (target.current - prev) * smoothing;
        return Math.abs(next - prev) < 0.0005 ? prev : next;
      });
      raf.current = window.requestAnimationFrame(tick);
    };

    onScroll();
    raf.current = window.requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetRef, startPct, endPct, smoothing]);

  return progress;
}


