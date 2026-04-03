import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Activity, Heart, Stethoscope, Pill, Syringe, Brain, HeartPulse, Microscope, Dna, Thermometer, Cross, Hospital, Ambulance, Ribbon, Monitor, Database, UserRound, PersonStanding } from "lucide-react";
import { TypewriterText } from "@/components/hero/TypewriterText";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const getIcon = (iconName: string): LucideIcon => {
  return (icons as Record<string, LucideIcon>)[iconName] || icons.Award;
};

const medicalIcons = [
  Brain, Heart, PersonStanding, Stethoscope, Syringe, Cross, HeartPulse,
  Pill, Thermometer, Hospital, Ambulance, Dna, Microscope, Ribbon, Monitor, Database, UserRound,
];

interface GlowColor {
  color: string;
  rgb: string;
}

interface FloatingIcon {
  id: number;
  Icon: LucideIcon;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  parallaxFactor: number;
  depth: number;
  glowColor: GlowColor;
}

function useParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x: cx, y: cy });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return offset;
}

// Glow color palette for dark mode - healthcare-themed
const glowColors: GlowColor[] = [
  { color: '#41c0c2', rgb: '65,192,194' },   // teal
  { color: '#36a5e0', rgb: '54,165,224' },   // medical blue
  { color: '#5b8cf7', rgb: '91,140,247' },   // soft blue
  { color: '#44d7b6', rgb: '68,215,182' },   // mint green
  { color: '#7c6cf7', rgb: '124,108,247' },  // soft purple
  { color: '#e06894', rgb: '224,104,148' },   // rose
];

function generateIcons(count: number): FloatingIcon[] {
  const half = Math.ceil(count / 2);
  return Array.from({ length: count }, (_, i) => {
    const depth = Math.random();
    const isLeft = i < half;
    // Left side: 2-38%, Right side: 62-98% — avoids center content area
    const x = isLeft
      ? 2 + Math.random() * 36
      : 62 + Math.random() * 36;
    // Vertically distributed across the section, biased toward center
    const y = 10 + Math.random() * 80;
    return {
      id: i,
      Icon: medicalIcons[i % medicalIcons.length],
      x,
      y,
      size: 14 + depth * 34,
      duration: 20 - depth * 10 + Math.random() * 8,
      delay: Math.random() * -20,
      parallaxFactor: 0.1 + depth * 0.9,
      depth,
      glowColor: glowColors[i % glowColors.length],
    };
  });
}

const floatingIcons = generateIcons(32);

const defaultStats = [
  { icon: "Brain", value: "3+", label: "Years Healthcare Experience" },
  { icon: "Activity", value: "5+", label: "Healthcare Dashboard" },
  { icon: "TrendingUp", value: "3+", label: "AI Tools Built" },
];

interface Profile {
  full_name: string;
  professional_title: string;
  tagline: string | null;
  bio: string | null;
}
function FloatingMedicalIcons() {
  const { x, y } = useParallax();
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {floatingIcons.map(({ id, Icon, x: ix, y: iy, size, duration, delay, parallaxFactor, depth, glowColor }) => {
        // Light mode: much more visible with subtle shadow
        const baseOpacityLight = 0.12 + depth * 0.18;
        const lightGlowSize = 3 + depth * 5;
        const blurAmount = Math.max(0, (1 - depth) * 1.5);
        const glowSize = 4 + depth * 8;
        const glowOpacity = (0.2 + depth * 0.3).toFixed(2);
        const moveY = 10 + depth * 25;
        const moveX = 5 + depth * 15;
        const rotateAmt = 4 + depth * 10;

        return (
          <motion.div
            key={id}
            className="absolute"
            style={{
              left: `${ix}%`,
              top: `${iy}%`,
              x: x * parallaxFactor * 40,
              y: y * parallaxFactor * 40,
              filter: blurAmount > 0.5 ? `blur(${blurAmount}px)` : undefined,
              zIndex: Math.round(depth * 10),
            }}
            animate={{
              y: [0, -moveY, 0, moveY * 0.6, 0],
              x: [0, moveX, -moveX * 0.8, moveX * 0.4, 0],
              rotate: [0, rotateAmt, -rotateAmt * 0.7, rotateAmt * 0.5, 0],
              scale: [1, 1 + depth * 0.08, 1, 1 - depth * 0.04, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Light mode - enhanced visibility with soft shadow */}
            <span className="dark:hidden"
              style={{
                filter: `drop-shadow(0 0 ${lightGlowSize}px rgba(var(--primary-rgb, 14,165,233), 0.15))`,
              }}
            >
              <Icon
                size={size}
                strokeWidth={depth > 0.5 ? 1.8 : 1.4}
                style={{
                  color: 'hsl(var(--primary))',
                  opacity: baseOpacityLight,
                }}
              />
            </span>
            {/* Dark mode with colored glow */}
            <span className="hidden dark:block"
              style={{
                filter: `drop-shadow(0 0 ${glowSize}px rgba(${glowColor.rgb}, ${glowOpacity}))`,
              }}
            >
              <Icon
                size={size}
                strokeWidth={depth > 0.5 ? 1.5 : 1.2}
                style={{
                  color: glowColor.color,
                  opacity: 0.15 + depth * 0.2,
                }}
              />
            </span>
          </motion.div>
        );
      })}
    </div>
  );
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

  const { data: keywordHighlights } = useQuery({
    queryKey: ["public-keyword-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_keyword_highlights")
        .select("keyword, glow_color, target")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as { keyword: string; glow_color: string; target: string }[];
    },
  });

  const { data: heroStats } = useQuery({
    queryKey: ["public-hero-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_stats")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: typewriterKeywords } = useQuery({
    queryKey: ["public-typewriter-keywords"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_typewriter_keywords")
        .select("keyword")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data?.map(d => d.keyword) || [];
    },
  });

  const statsToShow = (heroStats && heroStats.length > 0)
    ? heroStats.map(s => ({ icon: s.icon, value: s.value, label: s.label }))
    : defaultStats;

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

  // Filter highlights by target
  const headlineHighlights = keywordHighlights?.filter(k => k.target === 'headline' || k.target === 'both') || [];
  const bioHighlights = keywordHighlights?.filter(k => k.target === 'bio' || k.target === 'both') || [];

  const renderHighlightedText = (text: string, highlights: { keyword: string; glow_color: string }[]) => {
    if (!highlights.length) return text;
    const sorted = [...highlights].sort((a, b) => b.keyword.length - a.keyword.length);
    const escaped = sorted.map(k => k.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const match = sorted.find(k => k.keyword.toLowerCase() === part.toLowerCase());
      if (match) {
        return (
          <span
            key={i}
            className="font-semibold transition-all duration-300 cursor-default hover:scale-105 inline-block"
            style={{
              textShadow: `0 0 8px ${match.glow_color}80, 0 0 20px ${match.glow_color}40`,
              color: match.glow_color,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textShadow = `0 0 12px ${match.glow_color}cc, 0 0 30px ${match.glow_color}80, 0 0 50px ${match.glow_color}40`;
              e.currentTarget.style.filter = `brightness(1.2)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textShadow = `0 0 8px ${match.glow_color}80, 0 0 20px ${match.glow_color}40`;
              e.currentTarget.style.filter = `brightness(1)`;
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-healthcare-light-blue/50 to-background" />

      {/* Floating Medical Icons Parallax */}
      <FloatingMedicalIcons />

      <div className="container-wide relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium font-display mb-8"
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
            {renderHighlightedText(headlineParts[0], headlineHighlights)}
            {headlineParts[1] && (
              <span className="block healthcare-gradient-text">{renderHighlightedText(headlineParts[1], headlineHighlights)}</span>
            )}
          </motion.h1>

          {/* ECG heartbeat animation between headline and description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="pointer-events-none overflow-hidden my-4 sm:my-6 hidden sm:block"
            aria-hidden="true"
          >
            <svg className="w-full h-16 sm:h-20" viewBox="0 0 1000 100" preserveAspectRatio="xMidYMid meet" fill="none">
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

          {/* Description with keyword highlights */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {(() => {
              const bioText = profile?.bio || "I help healthcare organizations leverage artificial intelligence to improve patient outcomes, streamline operations, and unlock insights from complex medical data.";
              return renderHighlightedText(bioText, bioHighlights);
            })()}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
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
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto pb-20 sm:pb-28"
          >
            {statsToShow.map((stat, index) => {
              const IconComponent = getIcon(stat.icon);
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="card-medical p-6 text-center"
                >
                  <IconComponent className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-display font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
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
