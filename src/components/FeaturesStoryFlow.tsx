import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Search, Zap, Users, ArrowRight, Terminal } from "lucide-react";

const FeaturesStoryFlow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Create smooth progress values for each scene
  const scene1Progress = useTransform(scrollYProgress, [0, 0.33], [0, 1]);
  const scene2Progress = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const scene3Progress = useTransform(scrollYProgress, [0.66, 1], [0, 1]);

  // Smooth spring animations (or direct values for reduced motion)
  const scene1Spring = prefersReducedMotion ? scene1Progress : useSpring(scene1Progress, { stiffness: 100, damping: 30 });
  const scene2Spring = prefersReducedMotion ? scene2Progress : useSpring(scene2Progress, { stiffness: 100, damping: 30 });
  const scene3Spring = prefersReducedMotion ? scene3Progress : useSpring(scene3Progress, { stiffness: 100, damping: 30 });

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[400vh] bg-gradient-to-b from-background via-background/95 to-background"
    >
      {/* Flowing particles background */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full floating-particle"
              style={{
                left: `${20 + (i * 7)}%`,
                top: `${30 + (i * 5)}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + (i * 0.2),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Sticky terminal container */}
      <div className="sticky top-1/2 -translate-y-1/2 h-screen flex items-center justify-center">
        <div className="relative w-full max-w-4xl mx-auto px-4">
          
          {/* Scene 1: Semantic Search */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              opacity: useTransform(scene1Spring, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
              scale: useTransform(scene1Spring, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]),
            }}
          >
            <motion.div 
              className="glass-panel rounded-2xl p-8 w-full max-w-2xl mb-8 terminal-glow"
              style={{
                boxShadow: useTransform(
                  scene1Spring, 
                  [0, 1], 
                  [
                    "0 0 0 hsl(var(--primary) / 0)", 
                    "0 0 40px hsl(var(--primary) / 0.3)"
                  ]
                ),
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground font-mono">~/workspace</span>
              </div>
              
              <motion.div 
                className="font-mono text-lg text-foreground mb-4 command-highlight rounded p-2"
                style={{
                  opacity: useTransform(scene1Spring, [0, 0.5], [0, 1])
                }}
              >
                <span className="text-primary">$</span> find my docker run command
              </motion.div>
              
              <motion.div
                className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                style={{
                  opacity: useTransform(scene1Spring, [0.3, 0.8], [0, 1]),
                  y: useTransform(scene1Spring, [0.3, 0.8], [20, 0]),
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Semantic Match</span>
                </div>
                <code className="text-sm text-foreground/80">
                  docker run -d -p 8080:8080 myapp:latest
                </code>
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center"
              style={{
                opacity: useTransform(scene1Spring, [0.5, 1], [0, 1]),
                y: useTransform(scene1Spring, [0.5, 1], [20, 0]),
              }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Semantic Search</h3>
              <p className="text-muted-foreground">Ask in natural language</p>
            </motion.div>
          </motion.div>

          {/* Scene 2: Intelligent Recall */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              opacity: useTransform(scene2Spring, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
              scale: useTransform(scene2Spring, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]),
            }}
          >
            <motion.div className="glass-panel rounded-2xl p-8 w-full max-w-2xl mb-8 terminal-glow">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground font-mono">~/workspace</span>
              </div>
              
              <motion.div 
                className="font-mono text-lg text-foreground mb-4 command-highlight rounded p-2"
                style={{
                  opacity: useTransform(scene2Spring, [0, 0.5], [0, 1])
                }}
              >
                <span className="text-primary">$</span> kubectl get pods
              </motion.div>
              
              <motion.div
                className="space-y-2"
                style={{
                  opacity: useTransform(scene2Spring, [0.3, 0.8], [0, 1]),
                }}
              >
                {["kubectl get pods --all-namespaces", "kubectl describe pod myapp", "kubectl logs myapp-pod"].map((cmd, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                    style={{
                      opacity: useTransform(scene2Spring, [0.3 + (i * 0.1), 0.8], [0, 1]),
                      x: useTransform(scene2Spring, [0.3 + (i * 0.1), 0.8], [-30, 0]),
                    }}
                  >
                    <Zap className="w-4 h-4 text-primary" />
                    <code className="text-sm text-foreground/80 flex-1">{cmd}</code>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center"
              style={{
                opacity: useTransform(scene2Spring, [0.5, 1], [0, 1]),
                y: useTransform(scene2Spring, [0.5, 1], [20, 0]),
              }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Intelligent Recall</h3>
              <p className="text-muted-foreground">Your history, enhanced</p>
            </motion.div>
          </motion.div>

          {/* Scene 3: Team Knowledge */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              opacity: useTransform(scene3Spring, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
              scale: useTransform(scene3Spring, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]),
            }}
          >
            <motion.div className="glass-panel rounded-2xl p-8 w-full max-w-2xl mb-8 relative terminal-glow">
              {/* Team avatars floating above */}
              <motion.div
                className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-4"
                style={{
                  opacity: useTransform(scene3Spring, [0.2, 0.6], [0, 1]),
                  y: useTransform(scene3Spring, [0.2, 0.6], [20, 0]),
                }}
              >
                {[
                  { name: "Alex", color: "bg-blue-500" },
                  { name: "Sam", color: "bg-green-500" },
                  { name: "Jordan", color: "bg-purple-500" },
                ].map((user, i) => (
                  <motion.div
                    key={user.name}
                    className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center text-white text-sm font-medium`}
                    style={{
                      opacity: useTransform(scene3Spring, [0.3 + (i * 0.1), 0.7], [0, 1]),
                      scale: useTransform(scene3Spring, [0.3 + (i * 0.1), 0.7], [0.5, 1]),
                    }}
                  >
                    {user.name[0]}
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground font-mono">~/workspace</span>
              </div>
              
              <motion.div 
                className="font-mono text-lg text-foreground mb-4 command-highlight rounded p-2"
                style={{
                  opacity: useTransform(scene3Spring, [0, 0.5], [0, 1])
                }}
              >
                <span className="text-primary">$</span> deploy to production
              </motion.div>
              
              <motion.div
                className="space-y-3"
                style={{
                  opacity: useTransform(scene3Spring, [0.4, 0.8], [0, 1]),
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {["staging", "permissions", "safe"].map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full"
                      style={{
                        opacity: useTransform(scene3Spring, [0.5 + (i * 0.1), 0.9], [0, 1]),
                        scale: useTransform(scene3Spring, [0.5 + (i * 0.1), 0.9], [0.5, 1]),
                      }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
                
                <motion.div
                  className="p-3 bg-accent/10 border border-accent/20 rounded-lg"
                  style={{
                    opacity: useTransform(scene3Spring, [0.6, 1], [0, 1]),
                    y: useTransform(scene3Spring, [0.6, 1], [20, 0]),
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-sm text-accent font-medium">Team runbook</span>
                  </div>
                  <code className="text-sm text-foreground/80">
                    ./scripts/deploy.sh --env=prod --verify
                  </code>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center"
              style={{
                opacity: useTransform(scene3Spring, [0.5, 1], [0, 1]),
                y: useTransform(scene3Spring, [0.5, 1], [20, 0]),
              }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Team Knowledge</h3>
              <p className="text-muted-foreground">Shared context, safer deployments</p>
            </motion.div>
          </motion.div>

          {/* Progress indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
            style={{
              opacity: useTransform(scrollYProgress, [0.1, 0.9], [1, 0])
            }}
          >
            {[scene1Spring, scene2Spring, scene3Spring].map((progress, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/30"
                style={{
                  backgroundColor: useTransform(
                    progress,
                    [0, 0.5, 1],
                    ["hsl(var(--primary) / 0.3)", "hsl(var(--primary))", "hsl(var(--primary) / 0.3)"]
                  ),
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesStoryFlow;