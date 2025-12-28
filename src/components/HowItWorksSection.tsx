import { useState } from "react";
import { Search, Share2 } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: null,
    customIcon: "/held_icon.png",
    title: "Work Naturally",
    description: "Use your terminal like you always do. Held captures everything automatically in the background.",
    demo: {
      before: "user@macbook ~ %",
      typing: "npm run deploy:prod",
      after: "✓ held"
    }
  },
  {
    number: 2,
    icon: Search,
    title: "Search Intelligently",
    description: "Describe what you're looking for in plain English. AI finds the exact command you need.",
    demo: {
      query: "how did I deploy last time?",
      result: "npm run deploy:prod"
    }
  },
  {
    number: 3,
    icon: Share2,
    title: "Share with Team",
    description: "Instantly share useful commands and workflows. Build a knowledge base that grows with your team.",
    demo: {
      shared: "Shared with @team",
      members: ["S", "M", "A"]
    }
  }
];

export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section 
      className="relative py-32 px-4 sm:px-6 lg:px-8"
      style={{ background: "hsl(0 0% 0%)" }}
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <h2 
          className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-20"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Three simple steps
        </h2>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.number;
            
            return (
              <div
                key={step.number}
                className="relative group cursor-pointer"
                onMouseEnter={() => setActiveStep(step.number)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Card */}
                <div 
                  className="relative p-8 rounded-2xl transition-all duration-500 h-full"
                  style={{ 
                    backgroundColor: isActive ? "hsl(0 0% 10%)" : "hsl(0 0% 6%)",
                    border: isActive ? "1px solid hsl(0 0% 20%)" : "1px solid hsl(0 0% 12%)"
                  }}
                >
                  {/* Icon with number badge */}
                  <div className="relative inline-block mb-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden"
                      style={{ 
                        backgroundColor: isActive ? "hsl(0 0% 95%)" : "hsl(0 0% 15%)",
                      }}
                    >
                      {step.customIcon ? (
                        <img 
                          src={step.customIcon} 
                          alt="" 
                          className="w-8 h-8 object-contain transition-all duration-300"
                          style={{ 
                            filter: isActive ? "invert(0)" : "invert(1) brightness(0.6)"
                          }}
                        />
                      ) : Icon ? (
                        <Icon 
                          className="w-7 h-7 transition-colors duration-300" 
                          style={{ color: isActive ? "hsl(0 0% 5%)" : "hsl(0 0% 60%)" }}
                        />
                      ) : null}
                    </div>
                    {/* Number badge */}
                    <div 
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                      style={{ 
                        backgroundColor: isActive ? "hsl(50 12% 32%)" : "hsl(0 0% 20%)",
                        color: "hsl(0 0% 95%)",
                        border: "2px solid hsl(0 0% 6%)"
                      }}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-xl font-semibold mb-3 transition-colors duration-300"
                    style={{ color: isActive ? "hsl(0 0% 98%)" : "hsl(0 0% 80%)" }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p 
                    className="text-sm leading-relaxed mb-6 transition-colors duration-300"
                    style={{ color: isActive ? "hsl(0 0% 60%)" : "hsl(0 0% 45%)" }}
                  >
                    {step.description}
                  </p>

                  {/* Interactive Demo Area */}
                  <div 
                    className="rounded-lg p-4 font-mono text-xs transition-all duration-300 overflow-hidden"
                    style={{ 
                      backgroundColor: "hsl(0 0% 5%)",
                      border: "1px solid hsl(0 0% 15%)",
                      minHeight: "72px"
                    }}
                  >
                    {step.number === 1 && (
                      <div className="space-y-1">
                        <div>
                          <span style={{ color: "hsl(0 0% 95%)" }}>user@macbook</span>
                          <span style={{ color: "hsl(0 0% 50%)" }}> ~ % </span>
                          <span style={{ color: "hsl(0 0% 80%)" }}>{step.demo.typing}</span>
                        </div>
                        <div 
                          className="transition-opacity duration-300"
                          style={{ 
                            color: "hsl(50 12% 50%)",
                            opacity: isActive ? 1 : 0.5
                          }}
                        >
                          {step.demo.after}
                        </div>
                      </div>
                    )}
                    
                    {step.number === 2 && (
                      <div className="space-y-2">
                        <div 
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: "hsl(0 0% 10%)" }}
                        >
                          <span style={{ color: "hsl(0 0% 50%)" }}>"</span>
                          <span style={{ color: "hsl(0 0% 80%)" }}>{step.demo.query}</span>
                          <span style={{ color: "hsl(0 0% 50%)" }}>"</span>
                        </div>
                        <div 
                          className="flex items-center gap-2 transition-opacity duration-300"
                          style={{ opacity: isActive ? 1 : 0.5 }}
                        >
                          <span style={{ color: "hsl(120 40% 50%)" }}>→</span>
                          <code style={{ color: "hsl(0 0% 80%)" }}>{step.demo.result}</code>
                        </div>
                      </div>
                    )}
                    
                    {step.number === 3 && (
                      <div className="space-y-2">
                        <div 
                          className="flex items-center gap-2 transition-opacity duration-300"
                          style={{ color: "hsl(50 12% 50%)" }}
                        >
                          <span>✓</span>
                          <span>{step.demo.shared}</span>
                        </div>
                        <div className="flex items-center gap-1.5 transition-opacity duration-300">
                          {step.demo.members.map((member, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-300"
                              style={{ 
                                backgroundColor: "hsl(50 12% 32%)",
                                color: "hsl(0 0% 95%)",
                                opacity: isActive ? 1 : 0.5
                              }}
                            >
                              {member}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector line (between cards) */}
                {step.number < 3 && (
                  <div 
                    className="hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-px"
                    style={{ 
                      backgroundColor: "hsl(0 0% 15%)",
                      left: "100%"
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

