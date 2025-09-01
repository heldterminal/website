import { useState } from 'react';
import { FlowNavigation } from '@/components/FlowNavigation';
import { ScrollSection } from '@/components/ScrollSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Phone, MessageSquare, User } from 'lucide-react';

const Contact = () => {
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
    <div className="min-h-screen bg-background">
      <FlowNavigation />
      
      {/* Background elements */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5"></div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

      <main className="relative z-10 pt-20">
        <ScrollSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Get in <span className="text-glow text-primary">Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions about Coro? Want to share feedback or discuss partnerships? 
                We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Contact Info */}
              <ScrollSection animation="slide-left" delay={200}>
                <div className="space-y-8">
                  <Card className="glass-panel border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-foreground">
                        <Mail className="h-6 w-6 text-primary" />
                        Email Us
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        For general inquiries, support, or partnerships
                      </p>
                      <a 
                        href="mailto:jshen0303@gmail.com" 
                        className="text-primary hover:underline font-medium"
                      >
                        jshen0303@gmail.com
                      </a>
                    </CardContent>
                  </Card>

                  <div className="glass-panel p-6 border-primary/20">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      What can we help you with?
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Product demos and trials</li>
                      <li>• Technical support</li>
                      <li>• Enterprise partnerships</li>
                      <li>• Feature requests</li>
                      <li>• Integration questions</li>
                    </ul>
                  </div>
                </div>
              </ScrollSection>

              {/* Contact Form */}
              <ScrollSection animation="slide-right" delay={400}>
                <Card className="glass-panel border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-foreground">Send us a message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Name *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your full name"
                            className="bg-background/50 border-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            Email *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your.email@company.com"
                            className="bg-background/50 border-muted"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          Phone (optional)
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                          className="bg-background/50 border-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          placeholder="Tell us about your use case, questions, or how we can help..."
                          className="min-h-32 bg-background/50 border-muted resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        disabled={isSubmitting}
                        className="w-full glow-ring"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </ScrollSection>
            </div>
          </div>
        </ScrollSection>
      </main>
    </div>
  );
};

export default Contact;