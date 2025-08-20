import { ScrollSection } from "./ScrollSection";
import { Sparkles, ArrowUpRight, Github, Mail, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const ExperienceSection = () => {
  const connections = [
    { icon: Github, label: "GitHub", href: "#" },
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Mail, label: "Contact", href: "#" }
  ];

  // Fluid, reversible scroll effect for the “Get Started with Trem” panel
  const panelRef = useRef<HTMLDivElement>(null);
  const panelProgress = useSmoothProgress(panelRef, { startPct: 0.88, endPct: 0.42, smoothing: 0.08 });

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setNotice("Please enter an email address.");
      return;
    }
    setSubmitting(true);
    setNotice(null);
    const { error } = await supabase
      .from("waitlist")
      .insert({
        email,
        full_name: fullName || null,
        company: company || null,
        use_case: useCase || null,
        // omit status so DB default 'pending' is used (constraint-safe)
      });
    if (error) {
      // 23505 is Postgres unique_violation (email already exists)
      const code = (error as any).code;
      console.error("Waitlist insert error", { code, error });
      if (code === "23505") {
        setNotice("You're already on the list with this email.");
        setSubmitting(false);
        return;
      } else {
        setNotice("Something went wrong. Please try again. (" + (error.message || code || "unknown") + ")");
        setSubmitting(false);
        return;
      }
    }
    setNotice("You're on the list! We'll be in touch soon.");
    setEmail("");
    setFullName("");
    setCompany("");
    setUseCase("");
    setSubmitting(false);
  };

  return (
    <section id="experience" className="relative py-32 px-6">
      <div className="absolute inset-0 depth-gradient" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <ScrollSection animation="fade" delay={200}>
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-primary/20 glow-ring">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-glow">
            Ready to
            <span className="text-primary block">use Trem?</span>
          </h2>
          
          <p className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto">
            Ship without runbooks. Trem gives your team recall and semantic search for every command, 
            so anyone can safely rerun what already worked.
          </p>
        </ScrollSection>

        <ScrollSection animation="scale" delay={400}>
          <div
            ref={panelRef}
            className="glass-panel p-12 mb-12"
            style={{
              transform: `translateZ(0) translateY(${6 - 6 * panelProgress}px) scale(${1 + 0.035 * panelProgress})`,
              boxShadow: `0 0 0 1px hsl(var(--primary) / ${0.12 + 0.18 * panelProgress}) , 0 30px 60px -20px hsl(var(--primary) / ${0.22 + 0.38 * panelProgress})`,
              willChange: "transform, box-shadow",
            }}
          >
            <h3 className="text-2xl font-bold mb-6">Get Started with Trem</h3>
            <p className="text-foreground/70 mb-8">
              Import your shell history, search by intent, and share commands with your team. 
              Keep provenance and permissions intact.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-xl glow-ring group"
              >
                Open Demo
                <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg rounded-xl backdrop-blur-sm"
              >
                Import History
              </Button>
            </div>

            {/* Waitlist */}
            <div className="mt-10 text-left">
              <h4 className="text-xl font-semibold mb-4">Join the waitlist</h4>
              <form onSubmit={submitWaitlist} className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-1">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="useCase">Primary use case</Label>
                  <Textarea
                    id="useCase"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="e.g., on-call ops, onboarding, SRE runbooks"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-4">
                  <Button type="submit" disabled={submitting} className="px-8">
                    {submitting ? "Joining..." : "Join Waitlist"}
                  </Button>
                  {notice && (
                    <span className="text-sm text-foreground/70">{notice}</span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </ScrollSection>

        <ScrollSection animation="slide-left" delay={600}>
          <div className="flex justify-center space-x-6">
            {connections.map((connection, index) => {
              const Icon = connection.icon;
              return (
                <a
                  key={connection.label}
                  href={connection.href}
                  className="p-4 rounded-xl glass-panel hover:glow-ring transition-all duration-300 hover:scale-110 group"
                >
                  <Icon className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors" />
                </a>
              );
            })}
          </div>
        </ScrollSection>

        <ScrollSection animation="fade" delay={800}>
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-sm text-foreground/50">
              © 2025 Trem. Recall and semantic search for commands.
            </p>
          </div>
        </ScrollSection>
      </div>

      {/* Floating elements removed intentionally */}
    </section>
  );
};