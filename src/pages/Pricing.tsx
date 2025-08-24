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
      navigate("/contact");
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
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Simple, <span className="text-glow text-primary">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-16 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. Upgrade or downgrade at any time.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {plans.map((plan, index) => (
                <ScrollSection key={plan.name} delay={index * 200}>
                  <Card className={`glass-panel relative h-full flex flex-col ${plan.popular ? 'ring-2 ring-primary glow-ring' : ''}`}>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  What are tokens?
                </h3>
                <p className="text-muted-foreground">
                  Tokens are units of AI processing. Each command query, semantic search, 
                  and AI analysis consumes tokens based on complexity.
                </p>
              </div>
              
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Can I change plans anytime?
                </h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. 
                  Changes take effect immediately.
                </p>
              </div>
              
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Is there a free trial?
                </h3>
                <p className="text-muted-foreground">
                  Yes! The Free plan is available forever. Pro users get a 14-day 
                  trial to test all advanced features.
                </p>
              </div>
              
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  What AI models are included?
                </h3>
                <p className="text-muted-foreground">
                  Pro and Enterprise plans include access to GPT-4, Claude, and other 
                  leading AI models for optimal command understanding.
                </p>
              </div>
            </div>
          </div>
        </ScrollSection>
      </main>
    </div>
  );
};

export default Pricing;