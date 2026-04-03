import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Project {
  id: string;
  title: string;
  category: string | null;
  description: string;
  image_url: string | null;
  demo_url: string | null;
  technologies: string[] | null;
  metrics: Record<string, unknown> | null;
}

const fallbackProjects: Project[] = [
  {
    id: "1",
    title: "Predictive Patient Readmission System",
    category: "Machine Learning",
    description:
      "Developed a machine learning model that predicts 30-day hospital readmissions with 89% accuracy, helping reduce readmission rates by 23%.",
    technologies: ["89% prediction accuracy", "23% reduction in readmissions", "$2.4M annual savings"],
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    demo_url: null,
    metrics: null,
  },
  {
    id: "2",
    title: "Clinical NLP for Documentation",
    category: "Natural Language Processing",
    description:
      "Built an NLP pipeline that extracts structured data from unstructured clinical notes, reducing documentation time by 40%.",
    technologies: ["40% time savings", "98% extraction accuracy", "HIPAA compliant"],
    image_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
    demo_url: null,
    metrics: null,
  },
  {
    id: "3",
    title: "Population Health Dashboard",
    category: "Data Visualization",
    description:
      "Created an interactive analytics dashboard for tracking population health metrics across 500+ healthcare facilities.",
    technologies: ["500+ facilities", "Real-time insights", "Custom KPI tracking"],
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    demo_url: null,
    metrics: null,
  },
  {
    id: "4",
    title: "AI-Powered Diagnostic Assistant",
    category: "Computer Vision",
    description:
      "Developed a computer vision system for radiology that assists in detecting abnormalities in X-rays and CT scans.",
    technologies: ["15% faster diagnosis", "96% sensitivity", "FDA 510(k) cleared"],
    image_url: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&h=400&fit=crop",
    demo_url: null,
    metrics: null,
  },
];

export function ProjectsSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

  const { data: profile } = useQuery({
    queryKey: ["public-profile-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("projects_description, max_featured_projects")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, category, description, image_url, demo_url, technologies, metrics")
        .eq("is_featured", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Project[];
    },
  });

  const maxProjects = (profile as any)?.max_featured_projects ?? 4;
  const displayProjects = (projects && projects.length > 0 ? projects : fallbackProjects).slice(0, maxProjects);

  const sectionDescription = profile?.projects_description || 
    "A selection of healthcare AI projects demonstrating measurable impact on patient outcomes and operational efficiency.";

  // Helper to get display tags from either technologies or metrics
  const getProjectTags = (project: Project | typeof fallbackProjects[0]): string[] => {
    if (project.technologies && project.technologies.length > 0) {
      return project.technologies.slice(0, 3);
    }
    return [];
  };

  return (
    <section id="projects" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-badge">
            Portfolio
          </span>
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-description">
            {sectionDescription}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-medical overflow-hidden animate-pulse">
                <div className="h-56 bg-muted" />
                <div className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 bg-muted rounded-full w-20" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {displayProjects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                className="card-medical overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={project.image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {project.category && (
                    <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                      {project.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  {getProjectTags(project).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getProjectTags(project).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link to={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="group/btn p-0 h-auto">
                      View Case Study
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            View All Projects
            <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
