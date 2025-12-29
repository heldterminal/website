import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const FlowNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "pricing", label: "Pricing", href: "/pricing" },
    { id: "waitlist", label: "Waitlist", href: "/waitlist" },
  ];

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
            <Link to="/" className="flex items-center gap-1">
              <img src="/held_icon_white.png" alt="Held" className="h-7 w-7" />
              <span className="text-2xl font-semibold text-foreground">Held</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Empty for now */}
          <div className="hidden md:flex items-center space-x-4">
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
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium transition-colors hover:text-primary text-foreground/80"
                >
                  {item.label}
                </Link>
              ))}

            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
