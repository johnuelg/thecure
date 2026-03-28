import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const getIcon = (iconName: string): LucideIcon => {
  return (icons as Record<string, LucideIcon>)[iconName] || icons.Award;
};

export function AboutSection() {
  const { data: profile } = useQuery({
    queryKey: ['public-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('full_name, professional_title, bio, about_description, profile_image_url')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: highlights } = useQuery({
    queryKey: ['public-about-highlights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_highlights')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const aboutDescription = profile?.about_description || 
    "I am a passionate Healthcare AI Consultant dedicated to bridging the gap between cutting-edge artificial intelligence and the healthcare industry. With over a decade of experience, I help organizations leverage AI to improve patient outcomes, streamline operations, and drive innovation in medical care.";

  return (
    <section id="about" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="text-center mb-12">
          <div className="section-badge">
            <User className="w-4 h-4" />
            About Me
          </div>
          <h2 className="section-title">
            Who I Am
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {aboutDescription}
            </p>
            
            {profile?.bio && (
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                {highlights.map((item) => {
                  const IconComponent = getIcon(item.icon);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border border-border">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-24 h-24 text-primary/30" />
                </div>
              )}
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-xl healthcare-gradient opacity-20 -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-lg bg-primary/10 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}