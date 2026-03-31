import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#visualizations", label: "Analytics" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#resume", label: "Resume" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: branding } = useQuery({
    queryKey: ['profile-branding'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profile')
        .select('logo_url, full_name, brand_name, brand_name_image_url')
        .maybeSingle();
      return data as { logo_url: string | null; full_name: string; brand_name: string | null; brand_name_image_url: string | null } | null;
    },
    staleTime: 1000 * 60 * 10,
  });

  const brandName = branding?.brand_name || 'HealthcareAI';
  const brandNameImageUrl = (branding as any)?.brand_name_image_url || null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="container-wide">
        <div className="flex items-center justify-between h-20 md:h-[84px]">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
          >
            {branding?.logo_url ? (
              <img src={branding.logo_url} alt={branding.full_name || 'Logo'} className="h-12 w-12 sm:h-14 sm:w-14 lg:h-[75px] lg:w-[75px] object-contain" />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[75px] lg:h-[75px] rounded-lg healthcare-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl sm:text-2xl lg:text-3xl">AI</span>
              </div>
            )}
            {brandNameImageUrl ? (
              <img src={brandNameImageUrl} alt={brandName} className="h-8 sm:h-10 lg:h-14 object-contain" />
            ) : brandName ? (
              <span className="font-display font-semibold text-base sm:text-lg lg:text-2xl dark:text-[#41c0c2] dark:drop-shadow-[0_0_8px_rgba(65,192,194,0.6)] dark:[text-shadow:0_0_12px_rgba(65,192,194,0.5),0_0_24px_rgba(65,192,194,0.3),0_0_40px_rgba(65,192,194,0.15)]">
                {brandName}
              </span>
            ) : null}
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={() => scrollToSection("#contact")}
              className="healthcare-gradient border-0"
            >
              Get in Touch
            </Button>
          </div>

          {/* Mobile: theme toggle + menu button */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden bg-background border-b border-border"
        >
          <nav className="container-wide py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection("#contact")}
              className="mt-2 healthcare-gradient border-0"
            >
              Get in Touch
            </Button>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
