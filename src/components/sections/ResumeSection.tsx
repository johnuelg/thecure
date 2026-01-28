import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Download, Briefcase, GraduationCap, Award, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  resume_url: string | null;
  bio: string | null;
}

const experience = [
  {
    title: "Senior AI Consultant",
    company: "Healthcare Innovation Partners",
    period: "2021 - Present",
    description:
      "Lead AI strategy and implementation for major health systems. Delivered $10M+ in documented value through ML solutions.",
  },
  {
    title: "Machine Learning Engineer",
    company: "MedTech Solutions Inc.",
    period: "2018 - 2021",
    description:
      "Built predictive models for patient outcomes and clinical decision support systems. Led team of 5 data scientists.",
  },
  {
    title: "Data Scientist",
    company: "Regional Health Network",
    period: "2015 - 2018",
    description:
      "Developed analytics infrastructure and population health dashboards serving 200+ healthcare facilities.",
  },
];

const education = [
  {
    degree: "Ph.D. in Biomedical Informatics",
    school: "Stanford University",
    year: "2015",
  },
  {
    degree: "M.S. in Computer Science",
    school: "MIT",
    year: "2011",
  },
  {
    degree: "B.S. in Computational Biology",
    school: "UC Berkeley",
    year: "2009",
  },
];

const certifications = [
  "AWS Certified Machine Learning - Specialty",
  "Google Cloud Professional Data Engineer",
  "HIPAA Security Certification",
  "HL7 FHIR Fundamentals",
];

const skills = [
  { name: "Python/ML", level: 95 },
  { name: "Healthcare Data", level: 90 },
  { name: "Cloud Architecture", level: 85 },
  { name: "NLP/LLMs", level: 88 },
  { name: "Data Visualization", level: 92 },
  { name: "HIPAA/Compliance", level: 85 },
];

export function ResumeSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

  const { data: profile } = useQuery({
    queryKey: ["public-profile-resume"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("resume_url, bio")
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
  });

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
            Over a decade of experience bridging AI technology and healthcare delivery.
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
              {experience.map((job, index) => (
                <motion.div
                  key={job.title}
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
                {education.map((edu) => (
                  <div key={edu.degree} className="card-medical p-4">
                    <h4 className="font-medium text-sm">{edu.degree}</h4>
                    <p className="text-muted-foreground text-sm">{edu.school}</p>
                    <p className="text-xs text-primary">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Certifications</h3>
              </div>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div
                    key={cert}
                    className="px-4 py-2 rounded-lg bg-secondary text-sm"
                  >
                    {cert}
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
                {skills.map((skill) => (
                  <div key={skill.name}>
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
