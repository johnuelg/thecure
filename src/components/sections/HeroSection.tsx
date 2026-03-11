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

          {/* ECG heartbeat animation between headline and description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="pointer-events-none overflow-hidden my-6"
            aria-hidden="true"
          >
            <svg className="w-full h-20" viewBox="0 0 1000 100" preserveAspectRatio="xMidYMid meet" fill="none">
              <defs>
                <filter id="ecg-glow-outer" x="-10%" y="-50%" width="120%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="ecg-glow-core" x="-10%" y="-50%" width="120%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Dim persistent base line */}
              <path
                d="M0,50 L80,50 C84,50 88,48 92,46 C96,44 100,48 102,50 L115,50 L122,49 L126,51 L130,12 L136,88 L142,32 L148,50 L165,50 C169,50 174,44 180,38 C186,32 192,44 196,50 L310,50 L390,50 C394,50 398,48 402,46 C406,44 410,48 412,50 L425,50 L432,49 L436,51 L440,12 L446,88 L452,32 L458,50 L475,50 C479,50 484,44 490,38 C496,32 502,44 506,50 L620,50 L700,50 C704,50 708,48 712,46 C716,44 720,48 722,50 L735,50 L742,49 L746,51 L750,12 L756,88 L762,32 L768,50 L785,50 C789,50 794,44 800,38 C806,32 812,44 816,50 L1000,50"
                stroke="hsl(var(--healthcare-teal))"
                strokeWidth="1.5"
                strokeOpacity="0.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sweeping glow layer */}
              <path
                d="M0,50 L80,50 C84,50 88,48 92,46 C96,44 100,48 102,50 L115,50 L122,49 L126,51 L130,12 L136,88 L142,32 L148,50 L165,50 C169,50 174,44 180,38 C186,32 192,44 196,50 L310,50 L390,50 C394,50 398,48 402,46 C406,44 410,48 412,50 L425,50 L432,49 L436,51 L440,12 L446,88 L452,32 L458,50 L475,50 C479,50 484,44 490,38 C496,32 502,44 506,50 L620,50 L700,50 C704,50 708,48 712,46 C716,44 720,48 722,50 L735,50 L742,49 L746,51 L750,12 L756,88 L762,32 L768,50 L785,50 C789,50 794,44 800,38 C806,32 812,44 816,50 L1000,50"
                stroke="hsl(var(--healthcare-teal))"
                strokeWidth="3"
                strokeOpacity="0.35"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ecg-glow-outer)"
                className="animate-ecg-sweep"
                style={{ strokeDasharray: '250 1850', strokeDashoffset: 2100 }}
              />
              {/* Sweeping bright core */}
              <path
                d="M0,50 L80,50 C84,50 88,48 92,46 C96,44 100,48 102,50 L115,50 L122,49 L126,51 L130,12 L136,88 L142,32 L148,50 L165,50 C169,50 174,44 180,38 C186,32 192,44 196,50 L310,50 L390,50 C394,50 398,48 402,46 C406,44 410,48 412,50 L425,50 L432,49 L436,51 L440,12 L446,88 L452,32 L458,50 L475,50 C479,50 484,44 490,38 C496,32 502,44 506,50 L620,50 L700,50 C704,50 708,48 712,46 C716,44 720,48 722,50 L735,50 L742,49 L746,51 L750,12 L756,88 L762,32 L768,50 L785,50 C789,50 794,44 800,38 C806,32 812,44 816,50 L1000,50"
                stroke="hsl(var(--healthcare-teal))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ecg-glow-core)"
                className="animate-ecg-sweep"
                style={{ strokeDasharray: '250 1850', strokeDashoffset: 2100 }}
              />
            </svg>
          </motion.div>

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
