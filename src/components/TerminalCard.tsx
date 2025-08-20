import { useState, useEffect } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { Terminal } from "lucide-react";

interface TerminalCardProps {
  line: string;
  showText: MotionValue<number>;
  progress: MotionValue<number>;
}

export const TerminalCard = ({ line, showText, progress }: TerminalCardProps) => {
  const [typedText, setTypedText] = useState("");
  const [showCaret, setShowCaret] = useState(true);

  // Highlight effect for the lift phase
  const highlightOpacity = useTransform(progress, [0.18, 0.19, 0.22], [0, 1, 0]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setTypedText(line);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const typeText = () => {
      if (currentIndex < line.length) {
        setTypedText(line.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeText, 40 + Math.random() * 30);
      }
    };

    const startTyping = setTimeout(typeText, 800);

    // Caret blinking
    const caretInterval = setInterval(() => {
      setShowCaret(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(startTyping);
      clearTimeout(timeoutId);
      clearInterval(caretInterval);
    };
  }, [line]);

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="glass-panel p-8 rounded-lg border border-border/50 bg-card/90 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <Terminal className="h-6 w-6 text-primary" />
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
          </div>
          <span className="text-muted-foreground text-sm ml-auto">user@trem</span>
        </div>
        
        <div className="space-y-3 font-mono text-sm">
          <div className="text-muted-foreground">
            <span className="text-primary">$</span> git commit -m "implement user authentication flow"
          </div>
          <div className="text-green-400">
            [main abc123d] implement user authentication flow<br />
            3 files changed, 47 insertions(+), 2 deletions(-)
          </div>
          <div className="text-muted-foreground">
            <span className="text-primary">$</span> npm run deploy --production
          </div>
          <div className="text-blue-400">
            ✓ Build completed successfully<br />
            ✓ Deployed to production
          </div>
          
          {/* The flowing text line */}
          <div className="relative pt-2">
            <motion.div
              style={{ opacity: showText }}
              className="relative"
            >
              <motion.div
                style={{ 
                  backgroundColor: useTransform(highlightOpacity, (opacity) => 
                    `hsla(var(--primary), ${opacity * 0.2})`
                  )
                }}
                className="rounded px-1"
              >
                <motion.span layoutId="flowingText" className="text-foreground">
                  {typedText}
                  {showCaret && typedText.length < line.length && (
                    <span className="animate-pulse">|</span>
                  )}
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};