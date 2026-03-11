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
      
      {/* ECG heartbeat SVG background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Top ECG waveform — realistic PQRST with glow */}
        <svg className="absolute top-[18%] left-0 w-full h-28 opacity-[0.15]" viewBox="0 0 900 100" preserveAspectRatio="xMidYMid meet" fill="none">
          <defs>
            <filter id="ecg-glow-top" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M0,55 L60,55 L68,55 C70,55 72,50 74,48 C76,46 78,52 80,55 L100,55 L108,55 L112,54 L114,56 L116,10 L120,90 L124,40 L128,55 L140,55 C142,55 144,50 148,44 C152,38 156,48 160,55 L220,55 L280,55 L288,55 C290,55 292,50 294,48 C296,46 298,52 300,55 L320,55 L328,55 L332,54 L334,56 L336,10 L340,90 L344,40 L348,55 L360,55 C362,55 364,50 368,44 C372,38 376,48 380,55 L440,55 L500,55 L508,55 C510,55 512,50 514,48 C516,46 518,52 520,55 L540,55 L548,55 L552,54 L554,56 L556,10 L560,90 L564,40 L568,55 L580,55 C582,55 584,50 588,44 C592,38 596,48 600,55 L660,55 L720,55 L728,55 C730,55 732,50 734,48 C736,46 738,52 740,55 L760,55 L768,55 L772,54 L774,56 L776,10 L780,90 L784,40 L788,55 L800,55 C802,55 804,50 808,44 C812,38 816,48 820,55 L900,55"
            stroke="hsl(var(--healthcare-teal))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-draw"
            style={{ strokeDasharray: 2400, strokeDashoffset: 2400 }}
          />
        </svg>
        {/* Bottom ECG waveform — offset timing */}
        <svg className="absolute top-[78%] left-0 w-full h-20 opacity-[0.09]" viewBox="0 0 900 100" preserveAspectRatio="xMidYMid meet" fill="none">
          <defs>
            <filter id="ecg-glow-bottom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M0,55 L80,55 L88,55 C90,55 92,50 94,48 C96,46 98,52 100,55 L120,55 L128,55 L132,54 L134,56 L136,12 L140,88 L144,42 L148,55 L160,55 C162,55 164,50 168,45 C172,40 176,49 180,55 L260,55 L340,55 L348,55 C350,55 352,50 354,48 C356,46 358,52 360,55 L380,55 L388,55 L392,54 L394,56 L396,12 L400,88 L404,42 L408,55 L420,55 C422,55 424,50 428,45 C432,40 436,49 440,55 L520,55 L600,55 L608,55 C610,55 612,50 614,48 C616,46 618,52 620,55 L640,55 L648,55 L652,54 L654,56 L656,12 L660,88 L664,42 L668,55 L680,55 C682,55 684,50 688,45 C692,40 696,49 700,55 L780,55 L900,55"
            stroke="hsl(var(--healthcare-pulse))"
            strokeWidth="1.5"
            filter="url(#ecg-glow-top)"
            strokeLinejoin="round"
            className="animate-ecg-draw"
            style={{ strokeDasharray: 2400, strokeDashoffset: 2400, animationDelay: "2s" }}
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
