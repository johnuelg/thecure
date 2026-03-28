import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  LineChart,
  Shield,
  Workflow,
  Database,
  Users,
  Activity,
  Code,
  Settings,
  Zap,
  LucideIcon,
} from "lucide-react";

// Icon mapping for dynamic icons from database
const iconMap: Record<string, LucideIcon> = {
  Brain,
  LineChart,
  Shield,
  Workflow,
  Database,
  Users,
  Activity,
  Code,
  Settings,
  Zap,
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  display_order: number;
}

const fallbackServices = [
  {
    id: "1",
    icon: "Brain",
    title: "AI Strategy Consulting",
    description:
      "Develop comprehensive AI roadmaps tailored to your healthcare organization's goals, capabilities, and regulatory requirements.",
  },
  {
    id: "2",
    icon: "LineChart",
    title: "Predictive Analytics",
    description:
      "Build machine learning models for patient risk stratification, readmission prediction, and population health management.",
  },
  {
    id: "3",
    icon: "Shield",
    title: "Clinical Decision Support",
    description:
      "Design AI-powered tools that assist clinicians with diagnosis, treatment planning, and evidence-based recommendations.",
  },
  {
    id: "4",
    icon: "Workflow",
    title: "Process Automation",
    description:
      "Streamline administrative workflows, reduce documentation burden, and automate routine tasks with intelligent automation.",
  },
  {
    id: "5",
    icon: "Database",
    title: "Data Engineering",
    description:
      "Build robust data pipelines and warehouses that unify disparate healthcare data sources for analytics and AI applications.",
  },
  {
    id: "6",
    icon: "Users",
    title: "Team Training & Workshops",
    description:
      "Empower your teams with AI literacy through hands-on workshops, technical training, and change management support.",
  },
];

export function ServicesSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

  const { data: profile } = useQuery({
    queryKey: ["public-profile-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("services_description")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, title, description, icon, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });

  const displayServices = services && services.length > 0 ? services : fallbackServices;

  const sectionDescription = profile?.services_description || 
    "From strategy to implementation, I provide end-to-end AI consulting services designed specifically for healthcare organizations.";

  const getIcon = (iconName: string | null): LucideIcon => {
    if (iconName && iconMap[iconName]) {
      return iconMap[iconName];
    }
    return Brain; // Default icon
  };

  return (
    <section id="services" className="section-padding">
      <div className="container-wide">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-badge">
            Services
          </span>
          <h2 className="section-title">How I Can Help</h2>
          <p className="section-description">
            {sectionDescription}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-medical p-6 animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-muted mb-4" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-1" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, index) => {
              const IconComponent = getIcon(service.icon);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  className="card-medical p-6 group hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
