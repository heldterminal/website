import { ScrollSection } from '@/components/ScrollSection';
import { Rocket, Heart, Lightbulb, Code, Globe, Shield } from 'lucide-react';

const TeamMissionFlow = () => {
  const visionPoints = [
    {
      icon: Code,
      title: 'Developer First',
      description: 'Built by developers, for developers who demand efficiency',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Heart, 
      title: 'Human Centered',
      description: 'Making powerful tools accessible and intuitive for everyone',
      gradient: 'from-pink-500/20 to-rose-500/20'
    },
    {
      icon: Globe,
      title: 'Globally Connected', 
      description: 'Breaking down silos between teams and time zones',
      gradient: 'from-green-500/20 to-emerald-500/20'
    }
  ];

  const principles = [
    {
      icon: Rocket,
      title: 'Innovation',
      description: 'Pushing the boundaries of AI-powered developer experiences'
    },
    {
      icon: Shield,
      title: 'Trust',
      description: 'Building reliable tools that developers can depend on'
    },
    {
      icon: Lightbulb,
      title: 'Simplicity',
      description: 'Complex problems deserve elegant, simple solutions'
    }
  ];

  return (
    <ScrollSection className="py-24 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Mission Statement */}
        <div className="text-center mb-20">
          <ScrollSection animation="fade" delay={200}>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
              Our <span className="text-glow text-primary">Mission</span>
            </h2>
          </ScrollSection>
          
          <ScrollSection animation="slide-left" delay={400}>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto mb-12">
              We believe the command line is incredibly powerful but often intimidating. 
              <span className="text-primary font-medium"> Our mission is to bridge that gap</span> — 
              making CLI tools intelligent, intuitive, and collaborative.
            </p>
          </ScrollSection>
        </div>

        {/* Vision Flow */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {visionPoints.map((point, index) => (
            <ScrollSection key={point.title} delay={300 + index * 150}>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${point.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                <div className="relative glass-panel p-8 text-center h-full rounded-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <point.icon className="h-12 w-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </ScrollSection>
          ))}
        </div>

        {/* Impact Statement */}
        <ScrollSection animation="scale" delay={600}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-4 glass-panel px-8 py-4 rounded-full border-primary/30">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span className="text-lg font-medium text-foreground">
                Transforming how developers work, one command at a time
              </span>
            </div>
          </div>
        </ScrollSection>

        {/* Core Principles */}
        {/*
        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((principle, index) => (
            <ScrollSection key={principle.title} delay={400 + index * 100}>
              <div className="glass-panel p-6 text-center group hover:scale-105 transition-all duration-300">
                <principle.icon className="h-8 w-8 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {principle.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            </ScrollSection>
          ))}
        </div>*/}
      </div>
    </ScrollSection>
  );
};

export default TeamMissionFlow;