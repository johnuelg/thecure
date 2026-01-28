import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Award, Target, Lightbulb } from "lucide-react";

const highlights = [
  {
    icon: Award,
    title: "10+ Years Experience",
    description: "Deep expertise in healthcare AI implementation",
  },
  {
    icon: Target,
    title: "Results-Driven",
    description: "Focused on measurable patient outcomes",
  },
  {
    icon: Lightbulb,
    title: "Innovation Leader",
    description: "Pioneering AI solutions in healthcare",
  },
];

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

  const aboutDescription = profile?.about_description || 
    "I am a passionate Healthcare AI Consultant dedicated to bridging the gap between cutting-edge artificial intelligence and the healthcare industry. With over a decade of experience, I help organizations leverage AI to improve patient outcomes, streamline operations, and drive innovation in medical care.";

  return (
    <section id="about" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <User className="w-4 h-4" />
            About Me
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
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