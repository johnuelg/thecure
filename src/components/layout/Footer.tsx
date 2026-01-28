import { Heart, Linkedin, Github, Twitter, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const footerLinks = [
  {
    title: "Navigation",
    links: [
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Projects", href: "#projects" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#blog" },
      { label: "Resume", href: "#resume" },
      { label: "Analytics Demo", href: "#visualizations" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const { data: profile } = useQuery({
    queryKey: ['public-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('full_name, linkedin_url, github_url, twitter_url, email, footer_description')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const socialLinks = [
    { icon: Linkedin, href: profile?.linkedin_url || "#", label: "LinkedIn" },
    { icon: Github, href: profile?.github_url || "#", label: "GitHub" },
    { icon: Twitter, href: profile?.twitter_url || "#", label: "Twitter" },
    { icon: Mail, href: profile?.email ? `mailto:${profile.email}` : "mailto:hello@example.com", label: "Email" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const footerDescription = profile?.footer_description || 
    "Bridging the gap between artificial intelligence and healthcare to create impactful solutions that improve patient outcomes and operational efficiency.";

  const displayName = profile?.full_name || "HealthcareAI Consulting";

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg healthcare-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AI</span>
              </div>
              <span className="font-semibold text-lg">
                Healthcare<span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              {footerDescription}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold mb-4">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {displayName}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
}