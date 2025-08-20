import { useEffect, useState } from "react";
import { motion, MotionValue } from "framer-motion";

interface TerminalCardProps {
  morphProgress: number | MotionValue<number>;
  layoutId?: string;
}

export const TerminalCard = ({ morphProgress, layoutId }: TerminalCardProps) => {
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const message = `$ find . -name "*.log" -mtime +7 -delete
$ kubectl get pods --all-namespaces | grep -v Running  
$ git log --oneline --author="john@company.com" --since="1 week ago"
$ docker ps -a --filter "status=exited" --format "table {{.ID}}\\t{{.Image}}"`;

  // Typewriter effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (typed.length < message.length) {
      timeoutId = setTimeout(() => {
        setTyped(message.slice(0, typed.length + 1));
      }, 20 + Math.random() * 40); // Variable typing speed
    }
    return () => clearTimeout(timeoutId);
  }, [typed, message]);

  // Cursor blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      layoutId={layoutId}
      className="w-full max-w-4xl bg-card/95 backdrop-blur-md border border-border rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 20px 40px -10px hsl(var(--background) / 0.5)",
      }}
    >
      {/* Terminal Header */}
      <motion.div 
        layoutId={layoutId ? `${layoutId}-header` : undefined}
        className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border"
      >
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <motion.span 
          layoutId={layoutId ? `${layoutId}-title` : undefined}
          className="ml-3 text-sm text-muted-foreground font-mono"
        >
          bash — old-terminal
        </motion.span>
        <div className="ml-auto text-xs text-muted-foreground">
          ~/workspace
        </div>
      </motion.div>

      {/* Terminal Content */}
      <motion.div 
        layoutId={layoutId ? `${layoutId}-content` : undefined}
        className="p-6 font-mono text-sm leading-relaxed"
      >
        <div className="space-y-4">
          {/* Command History */}
          <div className="text-muted-foreground/60">
            <div>$ history | tail -20</div>
            <div className="ml-4 mt-2 space-y-1">
              <div>1847  docker-compose up -d</div>
              <div>1848  git status</div>
              <div>1849  npm run build</div>
              <div>1850  ls -la</div>
            </div>
          </div>

          {/* Current typing */}
          <div className="text-foreground">
            <span className="text-primary">$</span>{" "}
            <span>{typed}</span>
            {showCursor && <span className="animate-pulse">|</span>}
          </div>

          {/* Problem statement */}
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-destructive text-xs font-semibold mb-2">PROBLEM</div>
            <div className="text-foreground/80 text-xs leading-relaxed">
              • Commands lost in history<br/>
              • Context missing (who, when, where?)<br/>
              • No way to search by intent<br/>
              • Team knowledge trapped in DMs<br/>
              • Static runbooks get outdated
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};