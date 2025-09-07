import { ScrollSection } from "@/components/ScrollSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Terminal, Zap, Users } from "lucide-react";
import { FlowNavigation } from "@/components/FlowNavigation";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  
  const handlePlanAction = (planName: string, cta: string) => {
    if (cta === "Contact Sales") {
      navigate("/#contact-section");
    } else if (cta === "Start Pro Trial") {
      // Handle Pro trial logic here
      console.log("Pro trial clicked");
    } else if (cta === "Get Started Free") {
      // Handle Free plan logic here
      console.log("Free plan clicked");
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with AI-powered command recall",
      icon: Terminal,
      features: [
        "5,000 tokens per month",
        "Basic command tracking",
        "Semantic search",
        "Personal command history",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "per month",
      description: "Advanced features for power users and small teams",
      icon: Zap,
      features: [
        "20,000 tokens per month",
        "Multiple AI models",
        "Advanced analytics",
        "Team knowledge sharing",
        "Custom runbooks",
        "Priority support",
        "API access"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "Tailored solutions for large organizations",
      icon: Users,
      features: [
        "Unlimited tokens",
        "All AI models",
        "Advanced security",
        "SSO integration",
        "Custom integrations",
        "Dedicated support",
        "On-premise deployment"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      
      <main className="pt-20">
        <ScrollSection className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <ScrollSection animation="fade" delay={50}>
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-light leading-tight text-balance tracking-tight mb-6"
                style={{ color: "hsl(var(--foreground))", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                Choose{" "}
                <span
                  style={{ color: "hsl(var(--foreground))", fontWeight: 300 }}
                  className="animate-in fade-in duration-1000 delay-100"
                >
                  Your
                </span>{" "}
                Plan
              </h1>
            </ScrollSection>
            <ScrollSection animation="fade" delay={100}>
              <p 
                className="text-lg leading-relaxed text-pretty max-w-3xl mx-auto mb-16"
                style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, fontWeight: 300 }}
              >
                Start free and scale as your team grows. All plans include our core AI-powered command recall features.
              </p>
            </ScrollSection>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {plans.map((plan, index) => (
                <ScrollSection key={plan.name} animation={index === 0 ? "slide-left" : index === 1 ? "scale" : "slide-right"} delay={index === 1 ? 200 : 150}>
                  <Card className={`glass-panel relative h-full flex flex-col hover:scale-105 hover:-translate-y-2 transition-all duration-500 ${plan.popular ? 'ring-2 ring-primary glow-ring' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-8">
                      <div className="flex justify-center mb-4">
                        <plan.icon className="h-10 w-10 text-primary" />
                      </div>
                      <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-muted-foreground ml-2">/{plan.period}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col h-full">
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full mt-auto" 
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => handlePlanAction(plan.name, plan.cta)}
                      >
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </ScrollSection>
              ))}
            </div>
          </div>
        </ScrollSection>

        <ScrollSection className="py-20 px-4 bg-card/30">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollSection animation="fade" delay={50}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                Frequently Asked Questions
              </h2>
            </ScrollSection>
            
            <div className="grid md:grid-cols-2 gap-8 text-left items-stretch">
              <ScrollSection animation="slide-left" delay={100}>
                <div className="glass-panel p-6 hover:scale-105 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    What are tokens?
                  </h3>
                  <p className="text-muted-foreground flex-grow">
                    Tokens are units of AI processing. Each command query, semantic search, 
                    and AI analysis consumes tokens based on complexity.
                  </p>
                </div>
              </ScrollSection>
              
              <ScrollSection animation="slide-right" delay={150}>
                <div className="glass-panel p-6 hover:scale-105 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Can I change plans anytime?
                  </h3>
                  <p className="text-muted-foreground flex-grow">
                    Yes! You can upgrade or downgrade your plan at any time. 
                    Changes take effect immediately.
                  </p>
                </div>
              </ScrollSection>
              
              <ScrollSection animation="slide-left" delay={200}>
                <div className="glass-panel p-6 hover:scale-105 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Is there a free trial?
                  </h3>
                  <p className="text-muted-foreground flex-grow">
                    Yes! The Free plan is available forever. Pro users get a 14-day 
                    trial to test all advanced features.
                  </p>
                </div>
              </ScrollSection>
              
              <ScrollSection animation="slide-right" delay={250}>
                <div className="glass-panel p-6 hover:scale-105 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    What AI models are included?
                  </h3>
                  <p className="text-muted-foreground flex-grow">
                    Pro and Enterprise plans include access to GPT-5, Claude, and other 
                    leading AI models for optimal command understanding.
                  </p>
                </div>
              </ScrollSection>
            </div>
          </div>
        </ScrollSection>
      </main>
    </div>
  );
};

export default Pricing;