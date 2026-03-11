import { motion } from "framer-motion";
import { ArrowDown, Activity, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const defaultStats = [
  { icon: Brain, value: "10+", label: "Years Experience" },
  { icon: Activity, value: "50+", label: "Healthcare Projects" },
  { icon: TrendingUp, value: "95%", label: "Client Satisfaction" },
];

interface Profile {
  full_name: string;
  professional_title: string;
  tagline: string | null;
  bio: string | null;
}

export function HeroSection() {
  const { data: profile } = useQuery({
    queryKey: ["public-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("full_name, professional_title, tagline, bio")
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Extract headline parts from tagline or use defaults
  const headlineParts = profile?.tagline?.split("|").map(s => s.trim()) || [
    "Transforming Healthcare",
    "Through Intelligent Solutions"
  ];

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-healthcare-light-blue/50 to-background" />
      <div className="absolute inset-0 dna-pattern opacity-30" />
      

      <div className="container-wide relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <Activity className="w-4 h-4" />
            {profile?.professional_title || "AI Healthcare Consultant & Developer"}
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            {headlineParts[0]}
            {headlineParts[1] && (
              <span className="block healthcare-gradient-text">{headlineParts[1]}</span>
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {profile?.bio || "I help healthcare organizations leverage artificial intelligence to improve patient outcomes, streamline operations, and unlock insights from complex medical data."}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("#projects")}
              className="healthcare-gradient border-0 px-8"
            >
              View My Work
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("#contact")}
            >
              Get in Touch
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {defaultStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="card-medical p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          onClick={() => scrollToSection("#visualizations")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-sm">Scroll to explore</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </motion.button>
      </div>
    </section>
  );
}
