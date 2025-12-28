import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const HeroSection = () => {
  const { toast } = useToast();

  const handleDownloadClick = () => {
    toast({
      title: "Download coming soon",
      description: "Mac .dmg installer will be available shortly.",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Heading */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-[-0.02em] leading-[0.95] mb-10">
          A terminal that
          <br />
          remembers
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Never lose track of your commands again. AI-powered recall and team knowledge sharing for developers.
        </p>

        {/* Single CTA Button */}
        <Button
          size="lg"
          onClick={handleDownloadClick}
          className="px-8 py-6 text-base font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
        >
          Download for MacOS
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};
