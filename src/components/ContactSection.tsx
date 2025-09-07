import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, User, Phone, MessageSquare, Send } from "lucide-react";
import { ScrollSection } from "@/components/ScrollSection";
import { useToast } from "@/hooks/use-toast";

export const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call edge function to send email
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
            ...formData,
            to: 'jshen0303@gmail.com',
        }),
      });

      if (response.ok) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you as soon as possible.",
        });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section
      id="contact-section"
      className="py-24"
      style={{ backgroundColor: "hsl(var(--background))", borderTop: "1px solid hsl(var(--border))" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollSection animation="scale" delay={200}>
          <div className="rounded-xl p-6 lg:p-8 backdrop-blur-xl border border-white/10 shadow-2xl hover:scale-[1.01] transition-all duration-700 max-w-4xl mx-auto" style={{ 
            background: "linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--muted) / 0.6))",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          }}>
            {/* Header */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <h2
                className="text-3xl font-light mb-4"
                style={{ color: "hsl(var(--foreground))", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                Get in Touch
              </h2>
              <p
                className="text-base max-w-xl mx-auto"
                style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, fontWeight: 300 }}
              >
                Interested in a demo, support, or early conversations? We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Contact Info Card */}
              <ScrollSection animation="slide-left" delay={400}>
                <div className="rounded-lg p-6 backdrop-blur-sm border border-white/5 hover:scale-105 hover:-translate-y-1 transition-all duration-500" style={{ 
                  background: "linear-gradient(135deg, hsl(var(--background) / 0.4), hsl(var(--muted) / 0.2))"
                }}>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Mail className="w-6 h-6 hover:scale-110 hover:rotate-12 transition-all duration-300" style={{ color: "hsl(var(--primary))" }} />
                      <h3 className="text-xl font-medium" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>
                        Email Us
                      </h3>
                    </div>
                    <p className="mb-4" style={{ color: "hsl(var(--muted-foreground))", fontWeight: 300 }}>
                      For general inquiries, support, or partnerships
                    </p>
                    <a
                      href="mailto:jshen0303@gmail.com"
                      className="text-lg transition-colors duration-300 underline-offset-3 hover:underline"
                      style={{ color: "hsl(var(--primary))", fontWeight: 400 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--primary-glow))")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--primary))")}
                    >
                      jshen0303@gmail.com
                    </a>

                    <div className="mt-8">
                      <h4 className="text-lg font-medium mb-4" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>
                        What can we help you with?
                      </h4>
                      <ul className="space-y-3" style={{ color: "hsl(var(--muted-foreground))", fontWeight: 300 }}>
                        <li className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "hsl(var(--primary))" }}></span>
                          Product demos and trials
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "hsl(var(--primary))" }}></span>
                          Technical support
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "hsl(var(--primary))" }}></span>
                          Enterprise partnerships
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "hsl(var(--primary))" }}></span>
                          Feature requests
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "hsl(var(--primary))" }}></span>
                          Integration questions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ScrollSection>

              {/* Right Column - Contact Form Card */}
              <ScrollSection animation="slide-right" delay={600}>
                <div className="rounded-lg p-5 backdrop-blur-sm border border-white/5 hover:scale-105 hover:-translate-y-1 transition-all duration-500" style={{ 
                  background: "linear-gradient(135deg, hsl(var(--background) / 0.4), hsl(var(--muted) / 0.2))"
                }}>
                  <h3 className="text-lg font-medium mb-4" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>
                    Send us a message
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Name*
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 hover:scale-110 transition-transform duration-300" style={{ color: "hsl(var(--muted-foreground))" }} />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-sm"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--background) / 0.6), hsl(var(--muted) / 0.3))",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "hsl(var(--foreground))",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.05)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        Email*
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 hover:scale-110 transition-transform duration-300" style={{ color: "hsl(var(--muted-foreground))" }} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-sm"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--background) / 0.6), hsl(var(--muted) / 0.3))",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "hsl(var(--foreground))",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.05)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                          placeholder="your.email@company.cc"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        Phone (optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 hover:scale-110 transition-transform duration-300" style={{ color: "hsl(var(--muted-foreground))" }} />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-sm"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--background) / 0.6), hsl(var(--muted) / 0.3))",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "hsl(var(--foreground))",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.05)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        Message*
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-4 w-4 h-4 hover:scale-110 transition-transform duration-300" style={{ color: "hsl(var(--muted-foreground))" }} />
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 resize-none backdrop-blur-sm"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--background) / 0.6), hsl(var(--muted) / 0.3))",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "hsl(var(--foreground))",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.05)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                          placeholder="Tell us about your use case, questions, or how we can help..."
                        ></textarea>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-medium py-2.5 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] transform flex items-center justify-center space-x-2 backdrop-blur-sm"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                        color: "hsl(var(--primary-foreground))",
                        fontWeight: 500,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 4px 14px rgba(96, 165, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                        e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7))"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(96, 165, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                        e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))"
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </ScrollSection>
            </div>
          </div>
        </ScrollSection>
      </div>
    </section>
  );
};