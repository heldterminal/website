import { useEffect, useMemo, useState } from "react";

const TerminalBackground = () => {
  const [currentCommand, setCurrentCommand] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const commands = useMemo(
    () => [
      "tremctl start logging",
      "trem search 'docker setup'",
      "trem recall 'kubernetes deploy'",
      "trem share --team 'build process'",
      "trem analytics --last-30-days",
      "trem models --list available"
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const run = async () => {
      let idx = 0;
      while (!cancelled) {
        setIsTyping(true);
        const command = commands[idx];

        setCurrentCommand("");

        for (let i = 0; i <= command.length; i++) {
          if (cancelled) return;
          setCurrentCommand(command.slice(0, i));
          await sleep(80);
        }

        await sleep(1200);
        setIsTyping(false);
        idx = (idx + 1) % commands.length;
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [commands]);

  return (
    <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden opacity-20">
      <div className="sticky bottom-10 left-10 font-mono text-primary text-lg [position:fixed]">
        <div className="flex items-center">
          <span className="text-accent mr-2">$</span>
          <span>{currentCommand}</span>
          <span className={`ml-1 ${isTyping ? 'animate-pulse' : ''}`}>|</span>
        </div>
      </div>
      
      {/* Floating code snippets */}
      <div className="absolute top-20 right-10 font-mono text-xs text-muted-foreground/50 space-y-2">
        <div>ACTIVE • /Users/dev/.hyper_plugins/local/trem-glass-ui/backend/state/dump.jsonl</div>
        <div>SSH session logging ENABLED</div>
        <div>Shipper loop started (pid 40756), every 120s.</div>
      </div>
      
      {/* Animated particles representing data flow */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TerminalBackground;