const TremSearchPanel = () => {
  return (
    <section className="relative py-20 px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="trem-search-panel p-6 md:p-8 rounded-3xl glass-panel">
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

export default TremSearchPanel;


