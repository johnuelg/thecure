import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Download, Briefcase, GraduationCap, Wrench, Code, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  resume_url: string | null;
  bio: string | null;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string | null;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

interface Tool {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date_obtained: string;
  credential_url: string | null;
}

// Fallback data
const fallbackExperience = [
  {
    id: "1",
    title: "Senior AI Consultant",
    company: "Healthcare Innovation Partners",
    period: "2021 - Present",
    description: "Lead AI strategy and implementation for major health systems.",
  },
  {
    id: "2",
    title: "Machine Learning Engineer",
    company: "MedTech Solutions Inc.",
    period: "2018 - 2021",
    description: "Built predictive models for patient outcomes and clinical decision support.",
  },
];

const fallbackEducation = [
  { id: "1", degree: "Ph.D. in Biomedical Informatics", school: "Stanford University", year: "2015" },
  { id: "2", degree: "M.S. in Computer Science", school: "MIT", year: "2011" },
];

const fallbackTools: Tool[] = [
  { id: "1", name: "Python", logo_url: null },
  { id: "2", name: "TensorFlow", logo_url: null },
];

const fallbackSkills = [
  { id: "1", name: "Python/ML", level: 95 },
  { id: "2", name: "Healthcare Data", level: 90 },
  { id: "3", name: "Cloud Architecture", level: 85 },
];

export function ResumeSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

  const { data: profile } = useQuery({
    queryKey: ["public-profile-resume"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("resume_url, bio, resume_description")
        .maybeSingle();
      if (error) throw error;
      return data as (Profile & { resume_description: string | null }) | null;
    },
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["public-experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("id, title, company, period, description")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Experience[];
    },
  });

  const { data: education = [] } = useQuery({
    queryKey: ["public-education"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("id, degree, school, year")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Education[];
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ["public-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("id, name, logo_url")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Tool[];
    },
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["public-skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("id, name, level")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Skill[];
    },
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["public-certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("id, title, issuer, date_obtained, credential_url")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Certification[];
    },
  });

  const displayExperiences = experiences.length > 0 ? experiences : fallbackExperience;
  const displayEducation = education.length > 0 ? education : fallbackEducation;
  const displayTools = tools.length > 0 ? tools : fallbackTools;
  const displaySkills = skills.length > 0 ? skills : fallbackSkills;

  const sectionDescription = profile?.resume_description || 
    "Over a decade of experience bridging AI technology and healthcare delivery.";

  const handleDownloadResume = () => {
    if (profile?.resume_url) {
      const link = document.createElement('a');
      link.href = profile.resume_url;
      link.download = 'resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section id="resume" className="section-padding">
      <div className="container-wide">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Resume
          </span>
          <h2 className="mb-4">Experience & Background</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
            {sectionDescription}
          </p>
          <Button 
            className="healthcare-gradient border-0"
            onClick={handleDownloadResume}
            disabled={!profile?.resume_url}
          >
            <Download className="mr-2 w-4 h-4" />
            Download Full Resume
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Work Experience</h3>
            </div>

            <div className="space-y-6">
              {displayExperiences.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="card-medical p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-semibold">{job.title}</h4>
                    <span className="text-sm text-muted-foreground">{job.period}</span>
                  </div>
                  <p className="text-primary text-sm font-medium mb-2">{job.company}</p>
                  <p className="text-muted-foreground text-sm">{job.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Education */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Education</h3>
              </div>
              <div className="space-y-4">
                {displayEducation.map((edu) => (
                  <div key={edu.id} className="card-medical p-4">
                    <h4 className="font-medium text-sm">{edu.degree}</h4>
                    <p className="text-muted-foreground text-sm">{edu.school}</p>
                    <p className="text-xs text-primary">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Tools</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {displayTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary"
                  >
                    {tool.logo_url && (
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-sm">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Skills</h3>
              </div>
              <div className="space-y-4">
                {displaySkills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full healthcare-gradient rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
