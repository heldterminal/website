import { motion, MotionValue, useTransform } from "framer-motion";
import { Search, Zap, Users, Clock } from "lucide-react";

interface TremSearchCardProps {
  line: string;
  showText: MotionValue<number>;
  progress: MotionValue<number>;
}

const suggestions = [
  { icon: Zap, text: "Recent commands in ~/workspace", time: "2m ago" },
  { icon: Users, text: "Team runbooks for deployment", time: "5m ago" },
  { icon: Clock, text: "Git workflows from last week", time: "1h ago" },
];

export const TremSearchCard = ({ line, showText, progress }: TremSearchCardProps) => {
  // Suggestions animation
  const suggestionsOpacity = useTransform(progress, [0.55, 0.78], [0, 1]);
  const suggestionsY = useTransform(progress, [0.55, 0.78], [8, 0]);

  // Icon glow effect
  const iconGlow = useTransform(progress, [0.55, 0.78, 1], [0, 0.6, 1]);

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="glass-panel p-8 rounded-lg border border-border/50 bg-card/90 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            style={{
              filter: useTransform(iconGlow, (glow) => 
                `drop-shadow(0 0 ${glow * 12}px hsl(var(--primary)))`
              )
            }}
          >
            <Search className="h-6 w-6 text-primary" />
          </motion.div>
          <h2 className="text-xl font-semibold text-foreground">Trem Search</h2>
          <div className="ml-auto text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
            AI-Powered
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-input bg-background/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="h-4 w-4 text-muted-foreground" />
            <motion.div 
              layoutId="flowingText"
              style={{ opacity: showText }}
              className="flex-1 text-sm text-foreground font-mono cursor-text"
            >
              {line}
              <span className="animate-pulse">|</span>
            </motion.div>
          </div>
          
          {/* Metadata chips */}
          <motion.div
            style={{ 
              opacity: suggestionsOpacity,
              y: suggestionsY 
            }}
            className="flex gap-2 mt-3"
          >
            <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              who: jeff
            </div>
            <div className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-full">
              host: prod-a
            </div>
            <div className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">
              ~/workspace
            </div>
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div
          style={{ 
            opacity: suggestionsOpacity,
            y: suggestionsY 
          }}
          className="space-y-2"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggestions</h3>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.06 }
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <suggestion.icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground flex-1">{suggestion.text}</span>
              <span className="text-xs text-muted-foreground">{suggestion.time}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          style={{ 
            opacity: suggestionsOpacity,
            y: suggestionsY 
          }}
          className="mt-6 pt-4 border-t border-border/50"
        >
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↵</kbd> to search or 
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] ml-1">Tab</kbd> to autocomplete
          </p>
        </motion.div>
      </div>
    </div>
  );
};