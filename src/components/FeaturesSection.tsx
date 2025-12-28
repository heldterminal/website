import { useEffect, useState, useRef } from "react";
import { Search, Send, Sparkles } from "lucide-react";

type Feature = {
  id: string;
  label: string;
  query: string;
  results: {
    user: string;
    time: string;
    command: string;
  }[];
  terminalCommands?: {
    command: string;
    output?: string;
  }[];
};

const features: Feature[] = [
  {
    id: "share",
    label: "Command Sharing",
    query: "",
    results: [],
    terminalCommands: [
      { command: "git pull origin main", output: "Already up to date." },
      { command: "npm run build", output: "✓ Build completed in 4.2s" },
      { command: "npm run deploy:staging", output: "✓ Deployed to staging-api.held.dev" },
    ],
  },
  {
    id: "recall",
    label: "AI-Powered Recall",
    query: "how did i run build",
    results: [
      { user: "you", time: "just now", command: "npm run build" },
      { user: "you", time: "yesterday", command: "npm run build -- --production" },
    ],
  },
  {
    id: "history",
    label: "Team Search",
    query: "docker commands used by the team",
    results: [
      { user: "sarah", time: "yesterday", command: "docker compose up -d --build api" },
      { user: "alex", time: "3 days ago", command: "docker logs -f api-container --tail 100" },
    ],
  },
  {
    id: "context",
    label: "Context-Aware Search",
    query: "database migration commands",
    results: [
      { user: "you", time: "1 week ago", command: "psql -h localhost -U admin -d myapp_dev" },
      { user: "sarah", time: "2 weeks ago", command: "npx prisma migrate deploy --preview-feature" },
    ],
  },
];

export const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [displayedQuery, setDisplayedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // Terminal-specific state for share feature
  const [isRecording, setIsRecording] = useState(false);
  const [terminalLines, setTerminalLines] = useState<{type: 'prompt' | 'command' | 'output' | 'logged', content: string}[]>([]);
  const [currentTerminalText, setCurrentTerminalText] = useState("");
  
  // Ref to track current animation session and cancel it
  const animationRef = useRef<number>(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Add a tracked timeout
  const addTimeout = (callback: () => void, delay: number) => {
    const t = setTimeout(callback, delay);
    timeoutsRef.current.push(t);
    return t;
  };

  // Reset all state for a fresh start
  const resetAllState = () => {
    clearAllTimeouts();
    setDisplayedQuery("");
    setShowResults(false);
    setIsRecording(false);
    setTerminalLines([]);
    setCurrentTerminalText("");
  };

  // Animation effect
  useEffect(() => {
    // Increment animation session
    const currentSession = ++animationRef.current;
    
    // Check if this session is still valid
    const isValid = () => animationRef.current === currentSession;
    
    if (activeFeature.id === "share") {
      // Share feature - terminal animation
      addTimeout(() => {
        if (!isValid()) return;
        setIsRecording(true);
      }, 300);
      
      const commands = activeFeature.terminalCommands || [];
      let delay = 600;
      
      commands.forEach((cmd, cmdIndex) => {
        // Type each character
        for (let i = 0; i <= cmd.command.length; i++) {
          addTimeout(() => {
            if (!isValid()) return;
            setCurrentTerminalText(cmd.command.slice(0, i));
          }, delay + i * 50);
        }
        
        delay += cmd.command.length * 50 + 100;
        
        // Show command line
        addTimeout(() => {
          if (!isValid()) return;
          setTerminalLines(prev => [...prev, { type: 'command', content: cmd.command }]);
          setCurrentTerminalText("");
        }, delay);
        
        delay += 200;
        
        // Show output
        if (cmd.output) {
          addTimeout(() => {
            if (!isValid()) return;
            setTerminalLines(prev => [...prev, { type: 'output', content: cmd.output! }]);
          }, delay);
          delay += 200;
        }
        
        // Show logged
        addTimeout(() => {
          if (!isValid()) return;
          setTerminalLines(prev => [...prev, { type: 'logged', content: '✓ held' }]);
        }, delay);
        
        delay += 400;
      });
      
    } else {
      // Regular feature - search panel animation
      const query = activeFeature.query;
      
      if (!query) {
        addTimeout(() => {
          if (!isValid()) return;
          setShowResults(true);
        }, 300);
      } else {
        // Type each character
        for (let i = 0; i <= query.length; i++) {
          addTimeout(() => {
            if (!isValid()) return;
            setDisplayedQuery(query.slice(0, i));
          }, i * 40);
        }
        
        // Show results after typing
        addTimeout(() => {
          if (!isValid()) return;
          setShowResults(true);
        }, query.length * 40 + 300);
      }
    }

    return () => {
      clearAllTimeouts();
    };
  }, [activeFeature]);

  // Cursor blink effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  const handleFeatureClick = (feature: Feature) => {
    if (feature.id === activeFeature.id) return;
    resetAllState();
    setActiveFeature(feature);
  };

  const isShareFeature = activeFeature.id === "share";

  return (
    <section 
      className="relative py-32 px-4 sm:px-6 lg:px-8"
      style={{ background: "hsl(0 0% 9%)" }}
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-16">
          <h2 
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Everything you need
          </h2>
          <p 
            className="text-xl sm:text-2xl max-w-2xl"
            style={{ color: "hsl(var(--muted-foreground))", fontWeight: 300 }}
          >
            Built for developers who value their time and want to work more efficiently
          </p>
        </div>

        {/* Feature Pills */}
        <div className="mb-8 flex flex-wrap gap-3">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: activeFeature.id === feature.id 
                  ? "hsl(0 0% 20%)" 
                  : "hsl(0 0% 12%)",
                color: activeFeature.id === feature.id 
                  ? "hsl(0 0% 95%)" 
                  : "hsl(0 0% 50%)",
                border: activeFeature.id === feature.id 
                  ? "1px solid hsl(0 0% 30%)" 
                  : "1px solid hsl(0 0% 18%)",
              }}
            >
              {feature.label}
            </button>
          ))}
        </div>

        {/* App Window Container */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{ 
            backgroundColor: "hsl(0 0% 8%)",
            border: "1px solid hsl(0 0% 15%)",
            boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.9)"
          }}
        >
          {/* Window Header */}
          <div 
            className="flex items-center justify-between px-4 py-3"
            style={{ 
              background: "hsl(0 0% 12%)",
              borderBottom: "1px solid hsl(0 0% 10%)" 
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
            </div>
            
            <span 
              className="text-sm font-medium tracking-wide"
              style={{ color: "hsl(0 0% 50%)" }}
            >
              held
            </span>
            
            <div className="w-14" />
          </div>

          {/* Main Content - Split View */}
          <div className="flex min-h-[400px]">
            {/* Left - Terminal */}
            <div 
              className="flex-1 flex flex-col"
              style={{ background: "hsl(0 0% 5%)", borderRight: "1px solid hsl(0 0% 12%)" }}
            >
              {/* Terminal Content */}
              <div className="flex-1 p-6 font-mono text-sm overflow-y-auto">
                {isShareFeature ? (
                  <>
                    {terminalLines.map((line, index) => (
                      <div key={index} className="mb-1">
                        {line.type === 'command' && (
                          <div>
                            <span style={{ color: "hsl(0 0% 95%)" }}>user@macbook</span>
                            <span style={{ color: "hsl(0 0% 50%)" }}> ~ % </span>
                            <span style={{ color: "hsl(0 0% 90%)" }}>{line.content}</span>
                          </div>
                        )}
                        {line.type === 'output' && (
                          <div style={{ color: "hsl(0 0% 60%)", paddingLeft: "1rem" }}>
                            {line.content}
                          </div>
                        )}
                        {line.type === 'logged' && (
                          <div 
                            style={{ color: "hsl(50 12% 50%)", paddingLeft: "1rem", fontSize: "12px" }}
                          >
                            {line.content}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Current typing line */}
                    <div>
                      <span style={{ color: "hsl(0 0% 95%)" }}>user@macbook</span>
                      <span style={{ color: "hsl(0 0% 50%)" }}> ~ % </span>
                      <span style={{ color: "hsl(0 0% 90%)" }}>{currentTerminalText}</span>
                      <span 
                        className="inline-block w-2 h-4 ml-0.5"
                        style={{ 
                          backgroundColor: "hsl(0 0% 70%)",
                          opacity: cursorVisible ? 1 : 0
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ color: "hsl(0 0% 50%)" }}>
                    <span style={{ color: "hsl(0 0% 95%)" }}>user@macbook</span>
                    <span style={{ color: "hsl(0 0% 50%)" }}> ~ % </span>
                    <span 
                      className="inline-block w-2 h-4 ml-0.5"
                      style={{ 
                        backgroundColor: "hsl(0 0% 70%)",
                        opacity: cursorVisible ? 1 : 0
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Bottom Bar */}
              <div 
                className="flex items-center justify-between px-4 py-3"
                style={{ 
                  background: "hsl(0 0% 10%)",
                  borderTop: "1px solid hsl(0 0% 15%)" 
                }}
              >
                <div className="font-mono text-sm" style={{ color: "hsl(0 0% 50%)" }}>
                  <span style={{ color: "hsl(0 0% 95%)" }}>user@macbook</span>
                  <span style={{ color: "hsl(0 0% 50%)" }}> $</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all duration-300"
                    style={{ 
                      backgroundColor: isRecording ? "hsl(50 12% 32%)" : "hsl(0 0% 15%)", 
                      color: isRecording ? "hsl(0 0% 95%)" : "hsl(0 0% 60%)" 
                    }}
                  >
                    {isRecording ? "→ ON" : "← OFF"}
                  </button>
                  <button 
                    className="px-3 py-1 rounded text-xs font-medium flex items-center gap-1"
                    style={{ backgroundColor: "hsl(0 0% 15%)", color: "hsl(0 0% 60%)" }}
                  >
                    ‖ SUSPEND
                  </button>
                </div>
              </div>
            </div>

            {/* Right - Held Search Panel */}
            <div 
              className="w-80 flex flex-col"
              style={{ background: "hsl(0 0% 7%)" }}
            >
              {/* Panel Header */}
              <div 
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}
              >
                <span className="font-semibold text-sm" style={{ color: "hsl(0 0% 85%)" }}>
                  Held Search
                </span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: "hsl(50 12% 32%)", color: "hsl(0 0% 95%)" }}
                  >
                    JS
                  </div>
                </div>
              </div>

              {/* Tab Pills */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button 
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  style={{ backgroundColor: "hsl(0 0% 15%)", color: "hsl(0 0% 80%)" }}
                >
                  <Sparkles className="w-3 h-3" /> AI
                </button>
                <button 
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  style={{ backgroundColor: "hsl(0 0% 12%)", color: "hsl(0 0% 50%)" }}
                >
                  <Search className="w-3 h-3" /> Search
                </button>
              </div>

              {/* Results Area */}
              <div className="flex-1 px-4 py-2 overflow-y-auto">
                {!isShareFeature && showResults && activeFeature.results.map((result, index) => (
                  <div 
                    key={`${activeFeature.id}-${index}`}
                    className="mb-3 p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ 
                      backgroundColor: "hsl(0 0% 10%)",
                      border: "1px solid hsl(0 0% 15%)",
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                        style={{ backgroundColor: "hsl(50 12% 32%)", color: "white" }}
                      >
                        {result.user[0].toUpperCase()}
                      </div>
                      <span className="text-xs" style={{ color: "hsl(0 0% 50%)" }}>
                        @{result.user} • {result.time}
                      </span>
                    </div>
                    <code 
                      className="text-xs font-mono block"
                      style={{ color: "hsl(0 0% 80%)" }}
                    >
                      {result.command}
                    </code>
                  </div>
                ))}
                {isShareFeature && (
                  <div 
                    className="flex items-center justify-center h-full text-center"
                    style={{ color: "hsl(0 0% 40%)" }}
                  >
                    <div>
                      <p className="text-sm mb-2">Recording commands...</p>
                      <p className="text-xs">Commands are automatically logged to your team history</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div 
                className="px-4 py-3"
                style={{ borderTop: "1px solid hsl(0 0% 12%)" }}
              >
                <div 
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}
                >
                  <span 
                    className="flex-1 text-sm truncate"
                    style={{ color: displayedQuery ? "hsl(0 0% 80%)" : "hsl(0 0% 40%)" }}
                  >
                    {displayedQuery || "Ask Held..."}
                    {!isShareFeature && !showResults && displayedQuery && (
                      <span 
                        className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                        style={{ 
                          backgroundColor: "hsl(0 0% 70%)",
                          opacity: cursorVisible ? 1 : 0
                        }}
                      />
                    )}
                  </span>
                  <Send 
                    className="w-4 h-4" 
                    style={{ color: showResults ? "hsl(50 12% 45%)" : "hsl(0 0% 30%)" }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
