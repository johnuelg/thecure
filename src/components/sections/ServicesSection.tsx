import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Brain,
  LineChart,
  Shield,
  Workflow,
  Database,
  Users,
} from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "AI Strategy Consulting",
    description:
      "Develop comprehensive AI roadmaps tailored to your healthcare organization's goals, capabilities, and regulatory requirements.",
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description:
      "Build machine learning models for patient risk stratification, readmission prediction, and population health management.",
  },
  {
    icon: Shield,
    title: "Clinical Decision Support",
    description:
      "Design AI-powered tools that assist clinicians with diagnosis, treatment planning, and evidence-based recommendations.",
  },
  {
    icon: Workflow,
    title: "Process Automation",
    description:
      "Streamline administrative workflows, reduce documentation burden, and automate routine tasks with intelligent automation.",
  },
  {
    icon: Database,
    title: "Data Engineering",
    description:
      "Build robust data pipelines and warehouses that unify disparate healthcare data sources for analytics and AI applications.",
  },
  {
    icon: Users,
    title: "Team Training & Workshops",
    description:
      "Empower your teams with AI literacy through hands-on workshops, technical training, and change management support.",
  },
];

export function ServicesSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

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
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Services
          </span>
          <h2 className="mb-4">How I Can Help</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From strategy to implementation, I provide end-to-end AI consulting 
            services designed specifically for healthcare organizations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="card-medical p-6 group hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
