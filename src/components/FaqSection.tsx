import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs: { q: string; a: string }[] = [
  {
    q: "What is Held?",
    a: "Held is an AI developer memory for your terminal. It indexes successful commands, context, and docs so anyone on your team can find and safely re‑run what already worked.",
  },
  {
    q: "How does Held capture context?",
    a: "A lightweight local agent records structured terminal state — command, working directory, environment variables, repo/branch, and relevant output — then links it to issues and docs. Sensitive data stays local unless you choose to share with your team.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Held is local‑first with selective sync. You control what's shared with your workspace. We attach provenance to every result so reuse is auditable and trusted.",
  },
  {
    q: "What problems does Held solve day‑to‑day?",
    a: "Onboarding, incident response, CI repro, and machine migrations. Instead of hunting Slack and READMEs, you get the exact command and flags that previously worked for a similar environment.",
  },
  {
    q: "Which platforms are supported?",
    a: "macOS and Linux terminals at launch. Held works with common shells and is editor‑agnostic.",
  },
  {
    q: "How is Held different from shell history or code search?",
    a: "Shell history is personal and lossy, code search ignores runtime state. Held is state‑aware and team‑shareable, ranking results by environment similarity and last known success.",
  },
  {
    q: "What’s on the roadmap?",
    a: "Multi‑step procedures, auto‑generated runbooks from successful sessions, richer SSO, and connectors that pull in READMEs/docs so answers include both command and why it works.",
  },
];

export const FaqSection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="rounded-2xl border border-white/5 backdrop-blur-sm p-2 md:p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-white/5">
                <AccordionTrigger className="text-left text-base md:text-lg">{item.q}</AccordionTrigger>
                <AccordionContent className="text-foreground/70 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;


