import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Download, ArrowRight, Target, Award, Lightbulb } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";

function CountUp({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const skillTags = [
  { label: "Health Informatics", color: "teal" },
  { label: "AHIMA/RHIT", color: "teal" },
  { label: "Clinical AI", color: "teal" },
  { label: "Public Health", color: "indigo" },
  { label: "Medical Illustration", color: "indigo" },
  { label: "EHR Systems", color: "indigo" },
  { label: "ICD-10 Coding", color: "slate" },
  { label: "FHIR/HL7", color: "slate" },
  { label: "Data Visualization", color: "slate" },
];

const tagColors: Record<string, string> = {
  teal: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  slate: "bg-slate-700/50 text-slate-300 border-slate-600",
};

const stats = [
  { value: 10, suffix: "+", label: "Years Experience" },
  { value: 50, suffix: "+", label: "Projects Delivered" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
  { value: 15, suffix: "+", label: "AI Tools Built" },
];

const highlights = [
  { icon: Target, title: "Results-Driven", desc: "Focused on measurable patient outcomes" },
  { icon: Award, title: "10+ Years Experience", desc: "Deep expertise in healthcare AI implementation" },
  { icon: Lightbulb, title: "Innovation Leader", desc: "Pioneering AI solutions in clinical environments" },
];

export function AboutSection() {
  const { data: profile } = useQuery({
    queryKey: ['public-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('full_name, professional_title, bio, about_description, profile_image_url, resume_url')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const sectionRef = useRef(null);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden bg-secondary/30"
    >
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.05,
        }}
      />
      {/* Teal glow orb top-left */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,191,166,0.10) 0%, transparent 70%)",
        }}
      />
      {/* Indigo glow orb bottom-right */}
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 border border-teal-400/30 bg-teal-400/10 text-teal-400 text-xs font-semibold uppercase tracking-widest rounded-full px-4 py-1 mb-5">
            <User className="w-3.5 h-3.5" />
            About Me
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Who I Am
          </h2>
          <div className="mx-auto mt-4 h-[3px] w-[60px] rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT — Image */}
          <motion.div
            className="flex justify-center lg:justify-start"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative max-w-[280px] sm:max-w-[340px] lg:max-w-full w-full">
              {/* Outer ring */}
              <div
                className="rounded-2xl border-2 border-teal-400/40 p-1"
                style={{ boxShadow: "0 0 40px rgba(0,191,166,0.15)" }}
              >
                <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-[#0D2137] to-[#0A1628]">
                  {profile?.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt={profile.full_name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-24 h-24 text-teal-500/30" />
                    </div>
                  )}
                </div>
              </div>

              {/* Floating badge — top right */}
              <div className="absolute -top-3 -right-3 bg-teal-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg z-20">
                ✦ Available for Consulting
              </div>

              {/* Floating stat pill — bottom left */}
              <div className="absolute -bottom-4 -left-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 shadow-lg z-20">
                <div className="font-mono font-bold text-white text-lg leading-tight">🏥 10+ Years</div>
                <div className="text-xs text-slate-400">Healthcare AI</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* ① Bio Text */}
            <div className="space-y-4">
              <p className="text-lg text-slate-300 leading-8">
                I'm a Healthcare AI Consultant bridging cutting-edge artificial intelligence and clinical practice.
              </p>
              <p className="text-lg text-slate-300 leading-8">
                I help organizations improve patient outcomes, streamline operations, and unlock insights from complex medical data.
              </p>
              <p className="text-lg text-slate-300 leading-8">
                Certified in Health Informatics (RHIT/AHIMA) and committed to responsible, human-centered AI in care.
              </p>
            </div>

            {/* ② Highlight Bullets */}
            <div className="space-y-4">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-start gap-4 border-l-2 border-teal-500/40 pl-4">
                  <item.icon className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-base text-white font-semibold">{item.title}</span>
                    <span className="text-base text-slate-300"> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ③ Skills Tags */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Expertise</div>
              <div className="flex flex-wrap gap-2">
                {skillTags.map((tag, i) => (
                  <motion.span
                    key={tag.label}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${tagColors[tag.color]}`}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    {tag.label}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* ④ CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={profile?.resume_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Download CV
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 border border-teal-500/50 text-teal-400 font-semibold px-6 py-3 rounded-xl hover:bg-teal-500/10 transition-all duration-200"
              >
                Let's Connect
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Animated Stats Bar */}
        <motion.div
          className="mt-20 border-t border-white/10 pt-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`text-center py-4 ${
                  i < stats.length - 1 ? "lg:border-r lg:border-white/10" : ""
                } ${i % 2 === 0 && i < 2 ? "border-r border-white/10 lg:border-r" : ""}`}
              >
                <div className="font-mono text-3xl sm:text-4xl font-bold text-teal-400">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
