import { useState, useEffect } from "react";
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

  // Scroll-reactive ECG: fade out and slow down as user scrolls past hero
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const progress = Math.min(window.scrollY / heroHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ecgOpacity = 1 - scrollProgress;
  const ecgSpeed = 4 + scrollProgress * 12; // 4s → 16s (slows down)

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
      
      {/* ECG heartbeat SVG background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Top ECG waveform */}
        <svg className="absolute top-[20%] left-0 w-full h-24 opacity-15" viewBox="0 0 1400 100" preserveAspectRatio="none" fill="none">
          <path
            d="M0,50 L40,50 L45,45 L50,50 L60,50 L65,20 L70,80 L75,50 L85,50 L90,42 L100,50 L140,50 L180,50 L185,45 L190,50 L200,50 L205,20 L210,80 L215,50 L225,50 L230,42 L240,50 L280,50 L320,50 L325,45 L330,50 L340,50 L345,20 L350,80 L355,50 L365,50 L370,42 L380,50 L420,50 L460,50 L465,45 L470,50 L480,50 L485,20 L490,80 L495,50 L505,50 L510,42 L520,50 L560,50 L600,50 L605,45 L610,50 L620,50 L625,20 L630,80 L635,50 L645,50 L650,42 L660,50 L700,50 L740,50 L745,45 L750,50 L760,50 L765,20 L770,80 L775,50 L785,50 L790,42 L800,50 L840,50 L880,50 L885,45 L890,50 L900,50 L905,20 L910,80 L915,50 L925,50 L930,42 L940,50 L980,50 L1020,50 L1025,45 L1030,50 L1040,50 L1045,20 L1050,80 L1055,50 L1065,50 L1070,42 L1080,50 L1120,50 L1160,50 L1165,45 L1170,50 L1180,50 L1185,20 L1190,80 L1195,50 L1205,50 L1210,42 L1220,50 L1260,50 L1300,50 L1305,45 L1310,50 L1320,50 L1325,20 L1330,80 L1335,50 L1345,50 L1350,42 L1360,50 L1400,50"
            stroke="hsl(var(--healthcare-teal))"
            strokeWidth="2"
            className="animate-ecg-draw"
            style={{ strokeDasharray: 3000, strokeDashoffset: 3000 }}
          />
        </svg>
        {/* Bottom ECG waveform */}
        <svg className="absolute top-[75%] left-0 w-full h-20 opacity-10" viewBox="0 0 1400 100" preserveAspectRatio="none" fill="none">
          <path
            d="M0,50 L40,50 L45,45 L50,50 L60,50 L65,20 L70,80 L75,50 L85,50 L90,42 L100,50 L140,50 L180,50 L185,45 L190,50 L200,50 L205,20 L210,80 L215,50 L225,50 L230,42 L240,50 L280,50 L320,50 L325,45 L330,50 L340,50 L345,20 L350,80 L355,50 L365,50 L370,42 L380,50 L420,50 L460,50 L465,45 L470,50 L480,50 L485,20 L490,80 L495,50 L505,50 L510,42 L520,50 L560,50 L600,50 L605,45 L610,50 L620,50 L625,20 L630,80 L635,50 L645,50 L650,42 L660,50 L700,50 L740,50 L745,45 L750,50 L760,50 L765,20 L770,80 L775,50 L785,50 L790,42 L800,50 L840,50 L880,50 L885,45 L890,50 L900,50 L905,20 L910,80 L915,50 L925,50 L930,42 L940,50 L980,50 L1020,50 L1025,45 L1030,50 L1040,50 L1045,20 L1050,80 L1055,50 L1065,50 L1070,42 L1080,50 L1120,50 L1160,50 L1165,45 L1170,50 L1180,50 L1185,20 L1190,80 L1195,50 L1205,50 L1210,42 L1220,50 L1260,50 L1300,50 L1305,45 L1310,50 L1320,50 L1325,20 L1330,80 L1335,50 L1345,50 L1350,42 L1360,50 L1400,50"
            stroke="hsl(var(--healthcare-pulse))"
            strokeWidth="1.5"
            className="animate-ecg-draw"
            style={{ strokeDasharray: 3000, strokeDashoffset: 3000, animationDelay: "1.5s" }}
          />
        </svg>
      </div>

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
