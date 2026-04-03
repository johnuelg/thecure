import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Activity } from "lucide-react";
import { TypewriterText } from "@/components/hero/TypewriterText";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const getIcon = (iconName: string): LucideIcon => {
  return (icons as Record<string, LucideIcon>)[iconName] || icons.Award;
};

const defaultMedicalIcons = [
  "Brain", "Heart", "PersonStanding", "Stethoscope", "Syringe", "Cross", "HeartPulse",
  "Pill", "Thermometer", "Hospital", "Ambulance", "Dna", "Microscope", "Ribbon", "Monitor", "Database", "UserRound",
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

function useParallax(enabled: boolean) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x: cx, y: cy });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled]);

  return offset;
}

// Default glow color palette
const defaultGlowColors: GlowColor[] = [
  { color: '#41c0c2', rgb: '65,192,194' },
  { color: '#36a5e0', rgb: '54,165,224' },
  { color: '#5b8cf7', rgb: '91,140,247' },
  { color: '#44d7b6', rgb: '68,215,182' },
  { color: '#7c6cf7', rgb: '124,108,247' },
  { color: '#e06894', rgb: '224,104,148' },
];

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '65,192,194';
}

function generateIcons(iconNames: string[], glowColorsList?: { color: string; rgb: string }[], maxCount: number = 32): FloatingIcon[] {
  const count = Math.min(maxCount, iconNames.length);
  const half = Math.ceil(count / 2);
  const colors = glowColorsList || defaultGlowColors;
  return Array.from({ length: count }, (_, i) => {
    const depth = Math.random();
    const isLeft = i < half;
    const x = isLeft ? 2 + Math.random() * 36 : 62 + Math.random() * 36;
    const y = 10 + Math.random() * 80;
    const iconName = iconNames[i];
    return {
      id: i,
      Icon: getIcon(iconName),
      x,
      y,
      size: 14 + depth * 34,
      duration: 30 + Math.random() * 15,
      delay: Math.random() * -30,
      parallaxFactor: 0.1 + depth * 0.9,
      depth,
      glowColor: colors[i % colors.length],
    };
  });
}

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
  const prefersReducedMotion = useReducedMotion();

  const { data: dbIcons } = useQuery({
    queryKey: ["public-parallax-icons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_parallax_icons")
        .select("icon_name, glow_color")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: iconSettings } = useQuery({
    queryKey: ["public-profile-parallax"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("max_parallax_icons, parallax_animation_style, parallax_hover_effect, parallax_scroll_effect, parallax_animation_speed, parallax_enabled")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const parallaxEnabled = (iconSettings as any)?.parallax_enabled !== false;
  const maxCount = (iconSettings as any)?.max_parallax_icons ?? 32;
  const rawAnimStyle = (iconSettings as any)?.parallax_animation_style || 'gentle-float';
  const rawHoverEffect = (iconSettings as any)?.parallax_hover_effect || 'soft-glow';
  const rawScrollEffect = (iconSettings as any)?.parallax_scroll_effect || 'parallax-shift';
  const animSpeed = (iconSettings as any)?.parallax_animation_speed || 'slow';

  // When user prefers reduced motion, force all effects to "none"
  const animStyle = prefersReducedMotion ? 'none' : rawAnimStyle;
  const hoverEffect = prefersReducedMotion ? 'none' : rawHoverEffect;
  const scrollEffect = prefersReducedMotion ? 'none' : rawScrollEffect;

  const interactionEnabled = parallaxEnabled && scrollEffect !== 'none';
  const { x, y } = useParallax(interactionEnabled);

  const speedMultiplier = animSpeed === 'fast' ? 0.3 : animSpeed === 'medium' ? 0.55 : 1;

  const iconNames = dbIcons && dbIcons.length > 0
    ? dbIcons.map(i => i.icon_name)
    : defaultMedicalIcons;
  
  const glowColorsList = dbIcons && dbIcons.length > 0
    ? dbIcons.map(i => ({ color: i.glow_color, rgb: hexToRgb(i.glow_color) }))
    : defaultGlowColors;

  const currentIcons = useMemo(
    () => generateIcons(iconNames, glowColorsList, maxCount),
    [maxCount, iconNames.join('|'), glowColorsList.map((color) => `${color.color}:${color.rgb}`).join('|')]
  );

  if (!parallaxEnabled) return null;

  // Build animation props based on selected style
  const getAnimationProps = (icon: FloatingIcon) => {
    if (animStyle === 'none') {
      return undefined;
    }

    const { depth, duration: baseDuration, delay } = icon;
    const duration = baseDuration * speedMultiplier;
    const moveY = 5 + depth * 10;
    const moveX = 3 + depth * 6;

    // Base float keyframes
    let animateObj: Record<string, number[]> = {};
    let transitionDuration = duration;

    switch (animStyle) {
      case 'breathing-glow':
        animateObj = {
          y: [0, -moveY * 0.5, 0],
          x: [0, moveX * 0.3, 0],
          scale: [1, 1.08 + depth * 0.06, 1],
          opacity: [0.7, 1, 0.7],
        };
        transitionDuration = duration * 0.8;
        break;
      case 'orbital-drift':
        animateObj = {
          y: [0, -moveY, moveY * 0.3, -moveY * 0.5, 0],
          x: [0, moveX, moveX * 1.2, -moveX * 0.5, 0],
        };
        transitionDuration = duration * 1.2;
        break;
      case 'rising-bubbles':
        animateObj = {
          y: [0, -moveY * 2, -moveY * 3, 0],
          x: [0, moveX * 0.8, -moveX * 0.6, 0],
          opacity: [0.5, 1, 0.8, 0.5],
        };
        transitionDuration = duration * 1.5;
        break;
      case 'wave-motion': {
        const phase = icon.id * 0.5;
        animateObj = {
          y: [0, -moveY * Math.sin(phase), moveY * Math.cos(phase), 0],
          x: [0, moveX * Math.cos(phase), -moveX * Math.sin(phase), 0],
        };
        break;
      }
      case 'firefly-twinkle':
        animateObj = {
          y: [0, -moveY * 0.7, 0, moveY * 0.4, 0],
          x: [0, moveX * 0.5, -moveX * 0.3, moveX * 0.2, 0],
          opacity: [0.3, 1, 0.4, 0.9, 0.3],
        };
        transitionDuration = duration * 1.1;
        break;
      case 'gentle-float':
      default:
        animateObj = {
          y: [0, -moveY, 0, moveY * 0.6, 0],
          x: [0, moveX, -moveX * 0.8, moveX * 0.4, 0],
        };
        break;
    }

    return {
      animate: animateObj,
      transition: { duration: transitionDuration, delay, repeat: Infinity, ease: "easeInOut" as const },
    };
  };

  // Hover style based on hover effect setting
  const getHoverStyle = (glowColor: GlowColor, depth: number) => {
    const glowSize = 4 + depth * 8;
    switch (hoverEffect) {
      case 'none':
        return `drop-shadow(0 0 ${glowSize}px rgba(${glowColor.rgb}, ${(0.2 + depth * 0.3).toFixed(2)}))`;
      case 'scale-up':
        return `drop-shadow(0 0 ${glowSize * 1.5}px rgba(${glowColor.rgb}, 0.5)) brightness(1.1)`;
      case 'color-shift':
        return `drop-shadow(0 0 ${glowSize * 1.3}px rgba(${glowColor.rgb}, 0.55)) brightness(1.25) saturate(1.3)`;
      case 'pulse-ring':
        return `drop-shadow(0 0 ${glowSize * 2.5}px rgba(${glowColor.rgb}, 0.4)) drop-shadow(0 0 ${glowSize * 4}px rgba(${glowColor.rgb}, 0.15))`;
      case 'frost-glow':
        return `drop-shadow(0 0 ${glowSize * 2}px rgba(200,230,255, 0.5)) drop-shadow(0 0 ${glowSize}px rgba(${glowColor.rgb}, 0.3)) brightness(1.15)`;
      case 'soft-glow':
      default:
        return `drop-shadow(0 0 ${glowSize * 1.2}px rgba(${glowColor.rgb}, 0.45))`;
    }
  };

  const getWhileHover = () => {
    switch (hoverEffect) {
      case 'none':
        return undefined;
      case 'scale-up':
        return { scale: 1.25, transition: { duration: 0.3 } };
      case 'pulse-ring':
        return { scale: 1.1, transition: { duration: 0.2 } };
      case 'color-shift':
        return { scale: 1.12, transition: { duration: 0.3 } };
      case 'frost-glow':
        return { scale: 1.08, transition: { duration: 0.4 } };
      case 'soft-glow':
      default:
        return { scale: 1.15, transition: { duration: 0.3 } };
    }
  };

  // Scroll/mouse interaction effect
  const getScrollOffset = (parallaxFactor: number) => {
    const multiplier = 40;
    switch (scrollEffect) {
      case 'none':
        return { x: 0, y: 0 };
      case 'scatter': {
        return {
          x: -x * parallaxFactor * multiplier * 0.8,
          y: -y * parallaxFactor * multiplier * 0.8,
        };
      }
      case 'magnetic': {
        return {
          x: x * parallaxFactor * multiplier * 1.5,
          y: y * parallaxFactor * multiplier * 1.5,
        };
      }
      case 'wave-ripple': {
        const dist = Math.sqrt(x * x + y * y);
        const wave = Math.sin(dist * 3 + parallaxFactor * 6) * 0.5 + 0.5;
        return {
          x: x * parallaxFactor * multiplier * wave,
          y: y * parallaxFactor * multiplier * wave,
        };
      }
      case 'parallax-shift':
      default:
        return {
          x: x * parallaxFactor * multiplier,
          y: y * parallaxFactor * multiplier,
        };
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {currentIcons.map((icon) => {
        const { id, Icon, x: ix, y: iy, size, parallaxFactor, depth, glowColor } = icon;
        const baseOpacityLight = 0.12 + depth * 0.18;
        const lightGlowSize = 3 + depth * 5;
        const blurAmount = Math.max(0, (1 - depth) * 1.5);
        const glowSize = 4 + depth * 8;
        const glowOpacity = (0.2 + depth * 0.3).toFixed(2);

        const motionProps = getAnimationProps(icon);
        const hoverFilter = getHoverStyle(glowColor, depth);
        const scrollOffset = getScrollOffset(parallaxFactor);
        const whileHover = getWhileHover();

        return (
          <div
            key={id}
            className="absolute"
            style={{
              left: `${ix}%`,
              top: `${iy}%`,
              transform: `translate(${scrollOffset.x}px, ${scrollOffset.y}px)`,
              transition: interactionEnabled ? 'transform 0.15s ease-out' : undefined,
              zIndex: Math.round(depth * 10),
            }}
          >
            <motion.div
              className="pointer-events-auto cursor-default"
              style={{
                filter: blurAmount > 0.5 ? `blur(${blurAmount}px)` : undefined,
              }}
              animate={motionProps?.animate}
              transition={motionProps?.transition}
              whileHover={whileHover}
            >
            {/* Light mode */}
            <span className="dark:hidden"
              style={{
                filter: `drop-shadow(0 0 ${lightGlowSize}px rgba(var(--primary-rgb, 14,165,233), 0.15))`,
                transition: 'filter 0.3s ease',
              }}
            >
              <Icon
                size={size}
                strokeWidth={depth > 0.5 ? 1.8 : 1.4}
                style={{
                  color: 'hsl(var(--primary))',
                  opacity: baseOpacityLight,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </span>
            {/* Dark mode with colored glow */}
            <span className="hidden dark:block"
              style={{
                filter: `drop-shadow(0 0 ${glowSize}px rgba(${glowColor.rgb}, ${glowOpacity}))`,
                transition: 'filter 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (hoverEffect !== 'none') e.currentTarget.style.filter = hoverFilter;
              }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = `drop-shadow(0 0 ${glowSize}px rgba(${glowColor.rgb}, ${glowOpacity}))`; }}
            >
              <Icon
                size={size}
                strokeWidth={depth > 0.5 ? 1.5 : 1.2}
                style={{
                  color: glowColor.color,
                  opacity: 0.15 + depth * 0.2,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </span>
            </motion.div>
          </div>
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
        .select("full_name, professional_title, tagline, bio, typewriter_anchor, tagline_line_break")
        .maybeSingle();
      
      if (error) throw error;
      return data as (Profile & { typewriter_anchor: string | null; tagline_line_break: number | null }) | null;
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

  // Extract headline parts: split at configured word count
  const headlineParts = (() => {
    const tagline = profile?.tagline || "Transforming Healthcare Through Intelligent Solutions";
    const breakAt = profile?.tagline_line_break ?? 4;
    const words = tagline.split(/\s+/);
    if (breakAt <= 0 || words.length <= breakAt) return [tagline];
    return [words.slice(0, breakAt).join(" "), words.slice(breakAt).join(" ")];
  })();

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
        const isDark = document.documentElement.classList.contains('dark');
        return (
          <span
            key={i}
            className="font-semibold transition-all duration-300 cursor-default hover:scale-105 inline-block healthcare-gradient-text"
            style={{
              filter: isDark ? `drop-shadow(0 0 8px ${match.glow_color}80)` : 'none',
            }}
            onMouseEnter={(e) => {
              const dark = document.documentElement.classList.contains('dark');
              if (dark) {
                e.currentTarget.style.filter = `drop-shadow(0 0 12px ${match.glow_color}cc) brightness(1.2)`;
              } else {
                e.currentTarget.style.filter = `brightness(0.85)`;
              }
            }}
            onMouseLeave={(e) => {
              const dark = document.documentElement.classList.contains('dark');
              e.currentTarget.style.filter = dark ? `drop-shadow(0 0 8px ${match.glow_color}80)` : 'none';
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
            className="mb-6 text-foreground"
          >
            {(() => {
              const anchor = profile?.typewriter_anchor;
              const fullHeadline = headlineParts.join(" ");
              const breakAt = profile?.tagline_line_break ?? 4;
              
              // If we have an anchor and typewriter keywords, embed inline with line break
              if (anchor && typewriterKeywords && typewriterKeywords.length > 0) {
                const anchorIndex = fullHeadline.toLowerCase().indexOf(anchor.toLowerCase());
                if (anchorIndex !== -1) {
                  const before = fullHeadline.slice(0, anchorIndex);
                  const after = fullHeadline.slice(anchorIndex + anchor.length);
                  const allWords = [anchor, ...typewriterKeywords.filter(k => k.toLowerCase() !== anchor.toLowerCase())];
                  
                  // Line 1: before text + typewriter; Line 2: everything after anchor
                  const afterText = after.trim();
                  
                  if (afterText) {
                    return (
                      <>
                        <span>
                          {before.trim() && <>{renderHighlightedText(before, headlineHighlights)} </>}
                          <TypewriterText words={allWords} typingSpeed={80} deletingSpeed={50} pauseDuration={2000} />
                        </span>
                        <span className="block">
                          {renderHighlightedText(afterText, headlineHighlights)}
                        </span>
                      </>
                    );
                  }
                  
                  // No line break needed
                  return (
                    <>
                      {before.trim() && <>{renderHighlightedText(before, headlineHighlights)} </>}
                      <TypewriterText words={allWords} typingSpeed={80} deletingSpeed={50} pauseDuration={2000} />
                      {after.trim() && <> {renderHighlightedText(after, headlineHighlights)}</>}
                    </>
                  );
                }
              }
              
              // Fallback: render headline normally with typewriter below
              return (
                <>
                  {renderHighlightedText(headlineParts[0], headlineHighlights)}
                  {headlineParts[1] && (
                    <span className="block healthcare-gradient-text">{renderHighlightedText(headlineParts[1], headlineHighlights)}</span>
                  )}
                  {typewriterKeywords && typewriterKeywords.length > 0 && (
                    <span className="block mt-2">
                      <TypewriterText words={typewriterKeywords} typingSpeed={80} deletingSpeed={50} pauseDuration={2000} />
                    </span>
                  )}
                </>
              );
            })()}
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
