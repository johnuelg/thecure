import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProjectMediaThumbnail } from "@/components/ProjectMediaThumbnail";

interface Project {
  id: string;
  title: string;
  category: string | null;
  description: string;
  image_url: string | null;
  demo_url: string | null;
  technologies: string[] | null;
  is_featured: boolean | null;
}

export default function AllProjects() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, category, description, image_url, demo_url, technologies, is_featured")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: dbCategories } = useQuery({
    queryKey: ["project-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_categories")
        .select("name")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data?.map((c) => c.name) || [];
    },
  });

  const categories = ["All", ...(dbCategories || [])];

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects?.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container-wide">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="section-badge">Portfolio</span>
            <h1 className="section-title">All Projects</h1>
            <p className="section-description max-w-2xl mx-auto">
              Explore the complete collection of projects showcasing expertise across data science, machine learning, and healthcare analytics.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-medical overflow-hidden animate-pulse">
                  <div className="h-56 bg-muted" />
                  <div className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects?.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="card-medical overflow-hidden group h-full flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <ProjectMediaThumbnail
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
                    {project.is_featured && (
                      <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
                      {project.description}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-auto">
                      <Link to={`/projects/${project.id}`} state={{ from: '/projects' }}>
                        <Button variant="ghost" size="sm" className="group/btn p-0 h-auto">
                          View Case Study
                          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-muted-foreground hover:text-primary">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {filteredProjects?.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
