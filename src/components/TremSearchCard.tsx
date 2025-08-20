import { useEffect, useState } from "react";
import { motion, MotionValue } from "framer-motion";
import { Search, Sparkles, ArrowRight, Clock, User, Folder } from "lucide-react";

interface TremSearchCardProps {
  morphProgress: number | MotionValue<number>;
  isActive: boolean | MotionValue<boolean>;
  layoutId?: string;
}

export const TremSearchCard = ({ morphProgress, isActive, layoutId }: TremSearchCardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);

  const placeholderText = "Ask me anything about your terminal commands...";
  const exampleQuery = "find all docker containers that failed last week";

  // Auto-type query when active
  useEffect(() => {
    const currentIsActive = typeof isActive === 'boolean' ? isActive : false;
    if (currentIsActive && searchQuery.length < exampleQuery.length) {
      const timeoutId = setTimeout(() => {
        setSearchQuery(exampleQuery.slice(0, searchQuery.length + 1));
      }, 80);
      return () => clearTimeout(timeoutId);
    }
  }, [isActive, searchQuery, exampleQuery]);

  // Show results after typing completes
  useEffect(() => {
    const currentIsActive = typeof isActive === 'boolean' ? isActive : false;
    if (currentIsActive && searchQuery === exampleQuery) {
      const timeoutId = setTimeout(() => setShowResults(true), 800);
      return () => clearTimeout(timeoutId);
    }
  }, [isActive, searchQuery, exampleQuery]);

  return (
    <motion.div 
      layoutId={layoutId}
      className="w-full max-w-4xl bg-card/95 backdrop-blur-md border border-border rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)",
      }}
    >
      {/* Header */}
      <motion.div 
        layoutId={layoutId ? `${layoutId}-header` : undefined}
        className="flex items-center justify-between px-6 py-4 border-b border-border"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2 rounded-lg bg-primary/10 border border-primary/20"
            animate={{
              boxShadow: "0 0 20px hsl(var(--primary) / 0.5)",
            }}
          >
            <Sparkles 
              className="h-5 w-5 text-primary" 
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary)))",
              }}
            />
          </motion.div>
          <div>
            <motion.h3 
              layoutId={layoutId ? `${layoutId}-title` : undefined}
              className="font-semibold text-foreground"
            >
              Trem AI
            </motion.h3>
            <p className="text-xs text-muted-foreground">Intelligent command search</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20">
            Ask AI
          </span>
          <span className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded-full">
            Pro
          </span>
        </div>
      </motion.div>

      {/* Search Input */}
      <motion.div 
        layoutId={layoutId ? `${layoutId}-content` : undefined}
        className="p-6"
      >
        <div 
          className={`relative flex items-center gap-3 p-4 bg-background/50 border rounded-xl transition-all duration-300 ${
            focused || isActive ? "border-primary/50 bg-primary/5" : "border-border"
          }`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholderText}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            disabled={isActive as boolean} // Disable during demo
          />
          {(searchQuery || isActive) && (
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Results */}
        {showResults && (
          <motion.div 
            className="mt-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Found 3 relevant commands
            </div>

            {/* Command Results */}
            <div className="space-y-3">
              {[
                {
                  command: "docker ps -a --filter 'status=exited' --filter 'exited=1'",
                  description: "List all failed Docker containers",
                  context: {
                    user: "sarah@company.com",
                    when: "3 days ago",
                    where: "~/projects/backend",
                    success: "2/5 runs failed"
                  }
                },
                {
                  command: "docker logs $(docker ps -aq --filter 'status=exited' --filter 'exited=1') --since='7d'",
                  description: "Get logs from failed containers in last week",
                  context: {
                    user: "mike@company.com", 
                    when: "1 week ago",
                    where: "~/docker-projects",
                    success: "Known to work"
                  }
                },
                {
                  command: "docker system prune -f && docker container prune -f --filter 'until=168h'",
                  description: "Clean up failed containers older than 7 days",
                  context: {
                    user: "alex@company.com",
                    when: "2 weeks ago", 
                    where: "~/cleanup-scripts",
                    success: "Freed 2.3GB"
                  }
                }
              ].map((result, index) => (
                <motion.div 
                  key={index}
                  className="p-4 bg-background/30 border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-primary break-all">
                        {result.command}
                      </div>
                      <div className="text-sm text-foreground/80 mt-1">
                        {result.description}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {result.context.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.context.when}
                        </div>
                        <div className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {result.context.where}
                        </div>
                        <div className="text-primary">
                          {result.context.success}
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};