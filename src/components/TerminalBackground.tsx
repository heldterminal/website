import { useEffect, useMemo, useState } from "react";

const TerminalBackground = () => {
  const [currentCommand, setCurrentCommand] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const commands = useMemo(
    () => [
              "coro start",
        "coro search 'docker setup'",
        "coro recall 'kubernetes deploy'",
        "coro share --team 'build process'",
        "coro analytics --last-30-days",
        "coro models --list available"
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
                        <div>ACTIVE • /Users/dev/.hyper_plugins/local/coro-glass-ui/backend/state/dump.jsonl</div>
        <div>SSH session logging ENABLED</div>
        <div>Shipper loop started (pid 40756), every 120s.</div>
      </div>

      {/* Particle dots removed intentionally */}
    </div>
  );
};

export default TerminalBackground;