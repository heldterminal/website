import { useState } from "react";
import { FlowNavigation } from "@/components/FlowNavigation";
import TerminalBackground from "@/components/TerminalBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const Waitlist = () => {
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
      });

    if (error) {
      const code = (error as any).code;
      if (code === "23505") {
        setNotice("You're already on the list with this email.");
      } else {
        setNotice(
          "Something went wrong. Please try again. (" + (error.message || code || "unknown") + ")"
        );
      }
      setSubmitting(false);
      return;
    }

    setNotice("You're on the list! We'll be in touch soon.");
    setEmail("");
    setFullName("");
    setCompany("");
    setUseCase("");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "hsl(var(--background))" }}>
      <TerminalBackground />
      <FlowNavigation />

      <main className="relative z-10">
        <section className="relative py-24 px-6">
          <div className="absolute inset-0 depth-gradient" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="glass-panel p-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Join the Coro Waitlist</h1>
              <p className="text-foreground/70 mb-10">
                Be the first to try Coro. Tell us a bit about you and your use case.
              </p>

              <form onSubmit={submitWaitlist} className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-1">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Name"
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
                    {submitting ? "Joining..." : "Get on the Waitlist"}
                  </Button>
                  {notice && <span className="text-sm text-foreground/70">{notice}</span>}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Waitlist;


