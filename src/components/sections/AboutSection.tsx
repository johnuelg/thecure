import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, CheckCircle2, Play, Download, ArrowRight } from "lucide-react";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const getIcon = (iconName: string): LucideIcon => {
  return (icons as Record<string, LucideIcon>)[iconName] || icons.Award;
};

export function AboutSection() {
  const { data: profile } = useQuery({
    queryKey: ['public-profile-about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('full_name, professional_title, bio, about_description, profile_image_url, video_url, resume_url')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const { data: expertiseTags } = useQuery({
    queryKey: ['public-expertise-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expertise_tags')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const aboutDescription = profile?.about_description || 
    "I am a passionate Healthcare AI Consultant dedicated to bridging the gap between cutting-edge artificial intelligence and the healthcare industry. With over a decade of experience, I help organizations leverage AI to improve patient outcomes, streamline operations, and drive innovation in medical care.";
  const resumeUrl = profile?.resume_url?.trim() || null;

  return (
    <section id="about" className="section-padding bg-secondary/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/[0.04] blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="container-wide relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-badge">
            <User className="w-4 h-4" />
            About Me
          </div>
          <h2 className="section-title">
            Who I Am
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Column */}
          <motion.div 
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main video/image frame */}
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 border border-border shadow-lg relative group">
                {(profile as any)?.video_url ? (
                  <>
                    <video
                      ref={videoRef}
                      src={(profile as any).video_url}
                      className="w-full h-full object-cover"
                      playsInline
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                          } else {
                            videoRef.current.play();
                          }
                          setIsPlaying(!isPlaying);
                        }
                      }}
                      onEnded={() => setIsPlaying(false)}
                    />
                    {/* Play button overlay */}
                    {!isPlaying && (
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/40 cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                          <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                        </div>
                      </button>
                    )}
                  </>
                ) : profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.full_name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/5">
                    <User className="w-24 h-24 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Floating badge - Available */}
              <motion.div 
                className="absolute -right-3 top-6 bg-card border border-border rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                </span>
                <span className="text-sm font-medium text-foreground">Available for Consulting</span>
              </motion.div>

              {/* Decorative corner accents */}
              <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 -z-10" />
              <div className="absolute -top-3 -left-3 w-14 h-14 rounded-lg bg-primary/10 -z-10" />
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div 
            className="space-y-8 order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Title & role */}
            {profile?.professional_title && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{profile.professional_title}</span>
              </div>
            )}

            <p className="text-lg leading-relaxed text-muted-foreground">
              {aboutDescription}
            </p>

            {/* Highlights Grid */}
            {highlights && highlights.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {highlights.map((item, index) => {
                  const IconComponent = getIcon(item.icon);
                  return (
                    <motion.div
                      key={item.id}
                      className="group p-5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    >
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1 text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Expertise Tags */}
            {expertiseTags && expertiseTags.length > 0 && (
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-foreground mb-3">Core Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag, index) => (
                    <motion.span
                      key={tag.id}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    >
                      {tag.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-3 pt-2"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                Let&apos;s Work Together
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={profile?.resume_url || "#contact"}
                download={!!profile?.resume_url}
                target={profile?.resume_url ? "_blank" : undefined}
                rel={profile?.resume_url ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border text-foreground font-semibold text-sm hover:border-primary/40 hover:bg-secondary transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CV
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
