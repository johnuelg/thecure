import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Linkedin, Github, Twitter, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const { data: profile } = useQuery({
    queryKey: ['public-profile-footer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('full_name, linkedin_url, github_url, twitter_url, email, footer_description, copyright_text, logo_url, brand_name, brand_name_image_url')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: footerLinks } = useQuery({
    queryKey: ['public-footer-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
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
    if (href.startsWith('#')) {
      if (isHomePage) {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate('/' + href);
      }
    } else if (href.startsWith('/')) {
      navigate(href);
    } else {
      window.open(href, '_blank');
    }
  };

  const footerDescription = profile?.footer_description || 
    "Bridging the gap between artificial intelligence and healthcare to create impactful solutions that improve patient outcomes and operational efficiency.";

  const copyrightText = profile?.copyright_text || "HealthcareAI Consulting. All rights reserved.";

  // Group footer links by group_name
  const groupedLinks = footerLinks?.reduce((acc, link) => {
    if (!acc[link.group_name]) {
      acc[link.group_name] = [];
    }
    acc[link.group_name].push(link);
    return acc;
  }, {} as Record<string, typeof footerLinks>) || {};

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt={profile.full_name || 'Logo'} className="h-12 sm:h-16 md:h-18 object-contain" />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-lg healthcare-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-xl sm:text-2xl">AI</span>
                </div>
              )}
              {(profile as any)?.brand_name_image_url ? (
                <img src={(profile as any).brand_name_image_url} alt={(profile as any)?.brand_name || 'HealthcareAI'} className="h-7 sm:h-8 md:h-10 object-contain" />
              ) : (profile as any)?.brand_name ? (
                <span className="font-display font-semibold text-base sm:text-lg md:text-xl">
                  {(profile as any).brand_name}
                </span>
              ) : null}
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

          {/* Dynamic Links */}
          {Object.entries(groupedLinks).map(([groupName, links]) => (
            <div key={groupName}>
              <h4 className="font-semibold mb-4">{groupName}</h4>
              <ul className="space-y-3">
                {links?.map((link) => (
                  <li key={link.id}>
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
            © {currentYear} {copyrightText}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with{" "}
            <Heart
              className="w-4 h-4 animate-pulse"
              style={{
                color: 'hsl(var(--healthcare-teal))',
                filter: 'drop-shadow(0 0 6px hsl(var(--healthcare-teal) / 0.6)) drop-shadow(0 0 12px hsl(var(--healthcare-blue) / 0.3))',
              }}
              fill="hsl(var(--healthcare-teal))"
            />{" "}
            for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
}