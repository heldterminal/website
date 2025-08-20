import { ScrollSection } from "@/components/ScrollSection";
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin } from "lucide-react";
import { FlowNavigation } from "@/components/FlowNavigation";

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
      name: "Sai Kolasani",
      role: "Co-Founder",
      bio: "Prev Machine Learning Engineer at Doordash, Arize AI, IBM (DataStax). Berkeley CS + Statistics '25.",
      avatar: "",
      social: {
        linkedin: "#"
      }
    },
    {
      name: "Truong Nguyen",
      role: "Co-Founder",
      bio: "Prev Product Manager at Atlassian, SPL at Scale AI. Berkeley CS + Haas '25.",
      avatar: "",
      social: {
        linkedin: "#"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      
      <main className="pt-20">
        <ScrollSection className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Meet the <span className="text-glow text-primary">Team</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-16 max-w-3xl mx-auto">
              We're a passionate team of engineers, designers, and product experts 
              building the past, present, and future of intelligent command-line interfaces.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {team.map((member, index) => (
                <ScrollSection key={member.name} delay={index * 150}>
                  <Card className="glass-panel hover:scale-105 transition-transform duration-300 h-full flex flex-col">
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

        <ScrollSection className="py-20 px-4 bg-card/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We believe that command-line interfaces are incredibly powerful but often 
              intimidating and hard to master. Our mission is to bridge that gap by 
              making CLI tools intelligent, intuitive, and accessible to developers 
              of all skill levels.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="glass-panel p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  🚀 Innovation
                </h3>
                <p className="text-muted-foreground">
                  Pushing the boundaries of what's possible with AI-powered 
                  developer tools.
                </p>
              </div>
              
              <div className="glass-panel p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  🤝 Collaboration
                </h3>
                <p className="text-muted-foreground">
                  Building tools that help teams share knowledge and work 
                  together more effectively.
                </p>
              </div>
              
              <div className="glass-panel p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  💡 Accessibility
                </h3>
                <p className="text-muted-foreground">
                  Making powerful development tools accessible to everyone, 
                  regardless of experience level.
                </p>
              </div>
            </div>
          </div>
        </ScrollSection>
      </main>
    </div>
  );
};

export default Team;