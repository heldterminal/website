import { FlowNavigation } from "@/components/FlowNavigation";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  
  const handlePlanAction = (cta: string) => {
    // All actions redirect to waitlist for now (auth disabled for prod)
    navigate("/waitlist");
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For individuals getting started",
      features: [
        "5,000 tokens per month",
        "Semantic command recall",
        "Personal memory vault",
        "Local state capture",
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For power users and small teams",
      features: [
        "50,000 tokens per month",
        "Up to 10 team members",
        "3 team workspaces",
        "Shared runbooks",
        "Team knowledge sharing",
      ],
      cta: "Start Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited tokens",
        "Unlimited seats",
        "Custom workspaces",
        "BYODB / BYOK",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <FlowNavigation />
      
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Simple pricing
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: "hsl(var(--muted-foreground))", fontWeight: 300 }}
            >
              Start free, upgrade when you need more
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: plan.highlighted ? "hsl(0 0% 10%)" : "hsl(0 0% 6%)",
                  border: plan.highlighted 
                    ? "1px solid hsl(0 0% 25%)" 
                    : "1px solid hsl(0 0% 12%)",
                }}
              >
                {plan.highlighted && (
                  <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: "hsl(0 0% 20%)",
                      color: "hsl(0 0% 80%)",
                      border: "1px solid hsl(0 0% 25%)"
                    }}
                  >
                    Recommended
                  </div>
                )}

                {/* Plan name */}
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: "hsl(0 0% 70%)" }}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <span 
                    className="text-4xl font-semibold"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span 
                      className="text-sm ml-1"
                      style={{ color: "hsl(0 0% 50%)" }}
                    >
                      /{plan.period}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p 
                  className="text-sm mb-8"
                  style={{ color: "hsl(0 0% 50%)" }}
                >
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li 
                      key={feature} 
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check 
                        className="w-4 h-4 mt-0.5 flex-shrink-0" 
                        style={{ color: "hsl(0 0% 45%)" }}
                      />
                      <span style={{ color: "hsl(0 0% 70%)" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanAction(plan.cta)}
                  className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor: plan.highlighted 
                      ? "hsl(var(--foreground))" 
                      : "hsl(0 0% 15%)",
                    color: plan.highlighted 
                      ? "hsl(0 0% 5%)" 
                      : "hsl(0 0% 70%)",
                    border: plan.highlighted 
                      ? "none" 
                      : "1px solid hsl(0 0% 20%)",
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.highlighted) {
                      e.currentTarget.style.backgroundColor = "hsl(0 0% 20%)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.highlighted) {
                      e.currentTarget.style.backgroundColor = "hsl(0 0% 15%)";
                    }
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-32">
            <h2 
              className="text-3xl font-semibold mb-12 text-center"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Compare plans
            </h2>

            <div 
              className="rounded-xl overflow-hidden"
              style={{ 
                border: "1px solid hsl(0 0% 12%)",
                backgroundColor: "hsl(0 0% 5%)"
              }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
                    <th 
                      className="text-left px-6 py-4 font-medium"
                      style={{ color: "hsl(0 0% 50%)" }}
                    >
                      Feature
                    </th>
                    <th 
                      className="text-center px-6 py-4 font-medium"
                      style={{ color: "hsl(0 0% 50%)" }}
                    >
                      Free
                    </th>
                    <th 
                      className="text-center px-6 py-4 font-medium"
                      style={{ color: "hsl(0 0% 50%)" }}
                    >
                      Pro
                    </th>
                    <th 
                      className="text-center px-6 py-4 font-medium"
                      style={{ color: "hsl(0 0% 50%)" }}
                    >
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "AI tokens / month", free: "5k", pro: "50k", enterprise: "Unlimited" },
                    { feature: "Team members", free: "1", pro: "Up to 10", enterprise: "Unlimited" },
                    { feature: "Workspaces", free: "—", pro: "3", enterprise: "Unlimited" },
                    { feature: "Command recall", free: true, pro: true, enterprise: true },
                    { feature: "Team sharing", free: false, pro: true, enterprise: true },
                    { feature: "Shared runbooks", free: false, pro: true, enterprise: true },
                    { feature: "History retention", free: "30 days", pro: "1 year", enterprise: "Custom" },
                    { feature: "BYODB / BYOK", free: false, pro: false, enterprise: true },
                  ].map((row, i) => (
                    <tr 
                      key={row.feature}
                      style={{ 
                        borderBottom: i < 7 ? "1px solid hsl(0 0% 10%)" : "none"
                      }}
                    >
                      <td 
                        className="px-6 py-4"
                        style={{ color: "hsl(0 0% 70%)" }}
                      >
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Check className="w-4 h-4 mx-auto" style={{ color: "hsl(0 0% 50%)" }} />
                          ) : (
                            <span style={{ color: "hsl(0 0% 25%)" }}>—</span>
                          )
                        ) : (
                          <span style={{ color: "hsl(0 0% 60%)" }}>{row.free}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="w-4 h-4 mx-auto" style={{ color: "hsl(0 0% 50%)" }} />
                          ) : (
                            <span style={{ color: "hsl(0 0% 25%)" }}>—</span>
                          )
                        ) : (
                          <span style={{ color: "hsl(0 0% 60%)" }}>{row.pro}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.enterprise === "boolean" ? (
                          row.enterprise ? (
                            <Check className="w-4 h-4 mx-auto" style={{ color: "hsl(0 0% 50%)" }} />
                          ) : (
                            <span style={{ color: "hsl(0 0% 25%)" }}>—</span>
                          )
                        ) : (
                          <span style={{ color: "hsl(0 0% 60%)" }}>{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="py-8 px-4 text-center"
        style={{ borderTop: "1px solid hsl(0 0% 15%)" }}
      >
        <p 
          className="text-sm tracking-widest"
          style={{ color: "hsl(0 0% 45%)" }}
        >
          ALL RIGHTS RESERVED © 2025
        </p>
      </footer>
    </div>
  );
};

export default Pricing;
