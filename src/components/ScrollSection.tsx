import { useEffect, useRef, useState } from "react";

interface ScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade" | "slide-left" | "slide-right" | "scale";
  delay?: number;
}

export const ScrollSection = ({ 
  children, 
  className = "", 
  animation = "fade",
  delay = 0 
}: ScrollSectionProps) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsInView(true), delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const animationClass = {
    fade: "scroll-fade-in",
    "slide-left": "scroll-slide-left", 
    "slide-right": "scroll-slide-right",
    scale: "scroll-scale"
  }[animation];

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isInView ? "in-view" : ""} ${className}`}
    >
      {children}
    </div>
  );
};