import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const cameFromAllProjects = location.state?.from === '/projects';
  const backLink = cameFromAllProjects ? '/projects' : '/#projects';
  const backLabel = cameFromAllProjects ? 'Back to All Projects' : 'Back to Projects';

  const { data: project, isLoading } = useQuery({
    queryKey: ["project-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-wide py-24">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-80 bg-muted rounded-2xl" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-wide py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist.</p>
          <Link to={backLink}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 w-4 h-4" />
              {backLabel}
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Image */}
        {project.image_url && (
          <div className="w-full h-[40vh] md:h-[50vh] relative overflow-hidden">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        )}

        <div className="container-wide max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back link */}
            <Link to={backLink} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" />
              {backLabel}
            </Link>

            {/* Category */}
            {project.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                {project.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {project.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              {project.description}
            </p>

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Key Highlights</h2>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge / Solution / Outcome */}
            <div className="grid gap-8 mb-10">
              {project.challenge && (
                <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                  <h2 className="text-xl font-semibold mb-3">The Challenge</h2>
                  <p className="text-muted-foreground leading-relaxed">{project.challenge}</p>
                </div>
              )}
              {project.solution && (
                <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                  <h2 className="text-xl font-semibold mb-3">The Solution</h2>
                  <p className="text-muted-foreground leading-relaxed">{project.solution}</p>
                </div>
              )}
              {project.outcome && (
                <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                  <h2 className="text-xl font-semibold mb-3">The Outcome</h2>
                  <p className="text-muted-foreground leading-relaxed">{project.outcome}</p>
                </div>
              )}
            </div>

            {/* Demo link */}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                <Button size="lg">
                  View Live Demo
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
