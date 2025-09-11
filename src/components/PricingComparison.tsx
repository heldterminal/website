import { ScrollSection } from "@/components/ScrollSection";
import { Check, Minus } from "lucide-react";

type PlanKey = "Free" | "Pro" | "Enterprise";

const plans: PlanKey[] = ["Free", "Pro", "Enterprise"];

type Cell = boolean | "partial" | string;

const sections: { title: string; rows: { feature: string; availability: Record<PlanKey, Cell> }[] }[] = [
  {
    title: "Core",
    rows: [
      { feature: "Semantic command recall", availability: { Free: true, Pro: true, Enterprise: true } },
      { feature: "State‑aware capture (cwd/env/output)", availability: { Free: true, Pro: true, Enterprise: true } },
      { feature: "Personal memory vault", availability: { Free: true, Pro: true, Enterprise: true } },
    ],
  },
  {
    title: "Team & Sharing",
    rows: [
      { feature: "Team workspace", availability: { Free: false, Pro: true, Enterprise: true } },
      { feature: "Shared runbooks/procedures", availability: { Free: false, Pro: true, Enterprise: true } },
      { feature: "Selective sync & provenance", availability: { Free: "local‑only", Pro: "workspace", Enterprise: "BYODB/BYOK" } },
    ],
  },
  {
    title: "Usage & Limits",
    rows: [
      { feature: "Seats included", availability: { Free: "1", Pro: "up to 10", Enterprise: "custom" } },
      { feature: "Team workspaces", availability: { Free: "0", Pro: "up to 3", Enterprise: "custom" } },
      { feature: "History retention", availability: { Free: "30 days (local)", Pro: "1 year", Enterprise: "custom" } },
      { feature: "AI tokens / month", availability: { Free: "5k", Pro: "50k", Enterprise: "custom" } },
    ],
  },
];

const CellView = ({ state }: { state: Cell }) => {
  return (
    <div className="flex items-center justify-center w-full">
      {state === true ? (
        <Check className="h-4 w-4 text-primary" />
      ) : state === false ? (
        <span className="inline-block h-4 w-4">
          <span className="block h-2.5 w-2.5 rounded-full bg-muted-foreground/40 mx-auto" />
        </span>
      ) : state === "partial" ? (
        <Minus className="h-4 w-4 text-muted-foreground" />
      ) : (
        <span className="text-sm text-foreground/80 whitespace-nowrap">{state}</span>
      )}
    </div>
  );
};

export const PricingComparison = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollSection animation="fade" delay={50}>
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8">
            Compare plans and features
          </h2>
        </ScrollSection>
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="min-w-full text-sm table-fixed">
            <thead>
              <tr className="bg-card/60">
                <th className="text-left px-6 py-3 w-2/5">Features</th>
                {plans.map((p) => (
                  <th key={p} className="px-6 py-3 text-center font-medium w-1/5">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((section, si) => (
                <>
                  <tr key={`s-${si}`} className="bg-muted/10">
                    <td colSpan={4} className="px-6 py-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </td>
                  </tr>
                  {section.rows.map((row, ri) => (
                    <tr key={`r-${si}-${ri}`} className="border-t border-white/5">
                      <td className="px-6 py-3 text-foreground/90 break-words">{row.feature}</td>
                      {plans.map((p) => (
                        <td key={`${row.feature}-${p}`} className="px-6 py-3 text-center align-middle">
                          <CellView state={row.availability[p]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PricingComparison;


