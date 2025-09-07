import { ScrollSection } from "@/components/ScrollSection";
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin } from "lucide-react";
import { FlowNavigation } from "@/components/FlowNavigation";
import TeamMissionFlow from "@/components/TeamMissionFlow";

const Team = () => {
  const team = [
    {
      name: "Jeff Shen",
      role: "Co-Founder",
      bio: "Software Engineer at Oracle Cloud Infrastructure. Berkeley CS + DS '25. Phi Beta Kappa.",
      avatar: "/jeff-shen.jpg",
      social: {
        linkedin: "https://www.linkedin.com/in/jeff-shen-0303/"
      }
    },
    {
      name: "Truong Nguyen",
      role: "Co-Founder",
      bio: "Prev Product Manager at Atlassian, SPL at Scale AI. Berkeley CS + Haas '25.",
      avatar: "/truong-nguyen.jpg",
      social: {
        linkedin: "https://www.linkedin.com/in/truong-h-nguyen/"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      
      <main className="pt-20">
        <ScrollSection className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <ScrollSection animation="fade" delay={100}>
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-light leading-tight text-balance tracking-tight mb-6"
                style={{ color: "hsl(var(--foreground))", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                Meet{" "}
                <span
                  style={{ color: "hsl(var(--foreground))", fontWeight: 300 }}
                  className="animate-in fade-in duration-1000 delay-200"
                >
                  the
                </span>{" "}
                Team
              </h1>
            </ScrollSection>
            <ScrollSection animation="fade" delay={200}>
              <p 
                className="text-lg leading-relaxed text-pretty max-w-3xl mx-auto mb-16"
                style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, fontWeight: 300 }}
              >
We’re UC Berkeley grads reimagining the terminal for the modern team. Coro is an AI copilot that makes command history and workflows collaborative, automated, and intelligent.              </p>
            </ScrollSection>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {team.map((member, index) => (
                <ScrollSection key={member.name} animation={index === 0 ? "slide-left" : "slide-right"} delay={index === 0 ? 300 : 400}>
                  <Card className="glass-panel hover:scale-105 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                    <CardContent className="p-6 text-center flex flex-col h-full">
                      <div className="relative mb-4">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-24 h-24 rounded-full mx-auto object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full mx-auto ring-2 ring-primary/20 bg-white/5" />
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {member.bio}
                      </p>
                      
                      <div className="flex justify-center space-x-3 mt-auto">
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollSection>
              ))}
            </div>
          </div>
        </ScrollSection>

        {/* <TeamMissionFlow /> */}
      </main>
    </div>
  );
};

export default Team;