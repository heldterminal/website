import { useState, useEffect } from "react";
import { Terminal, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ProfileMenu } from "@/components/ui/ProfileMenu";

export const FlowNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "pricing", label: "Pricing", href: "/pricing" },
    { id: "team", label: "Our Team", href: "/team" },
    { id: "contact", label: "Contact", href: "/#contact-section" },
    { id: "waitlist", label: "Waitlist", href: "/waitlist" },
  ];

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById('contact-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById('contact-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`glass-nav transition-all duration-300 ${
        isScrolled ? "backdrop-blur-heavy" : "backdrop-blur-light"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="relative flex items-center justify-between h-16">
          {/* Left: Logo + Left Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Terminal className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Held</span>
            </Link>

            {/* Desktop Nav (Pricing, Our Team) */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                item.id === 'contact' ? (
                  <button
                    key={item.id}
                    onClick={handleContactClick}
                    className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Right: Auth/Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <ProfileMenu profile={profile} />
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur-md border-t border-border">
              {navItems.map((item) => (
                item.id === 'contact' ? (
                  <button
                    key={item.id}
                    onClick={handleContactClick}
                    className="block w-full text-left px-3 py-2 text-base font-medium transition-colors hover:text-primary text-foreground/80"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium transition-colors hover:text-primary text-foreground/80"
                  >
                    {item.label}
                  </Link>
                )
              ))}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <ProfileMenu profile={profile} />
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-foreground/80"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
