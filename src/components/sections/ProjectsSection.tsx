import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    id: 1,
    title: "Predictive Patient Readmission System",
    category: "Machine Learning",
    description:
      "Developed a machine learning model that predicts 30-day hospital readmissions with 89% accuracy, helping reduce readmission rates by 23%.",
    outcomes: ["89% prediction accuracy", "23% reduction in readmissions", "$2.4M annual savings"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Clinical NLP for Documentation",
    category: "Natural Language Processing",
    description:
      "Built an NLP pipeline that extracts structured data from unstructured clinical notes, reducing documentation time by 40%.",
    outcomes: ["40% time savings", "98% extraction accuracy", "HIPAA compliant"],
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Population Health Dashboard",
    category: "Data Visualization",
    description:
      "Created an interactive analytics dashboard for tracking population health metrics across 500+ healthcare facilities.",
    outcomes: ["500+ facilities", "Real-time insights", "Custom KPI tracking"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "AI-Powered Diagnostic Assistant",
    category: "Computer Vision",
    description:
      "Developed a computer vision system for radiology that assists in detecting abnormalities in X-rays and CT scans.",
    outcomes: ["15% faster diagnosis", "96% sensitivity", "FDA 510(k) cleared"],
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&h=400&fit=crop",
  },
];

export function ProjectsSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

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
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Portfolio
          </span>
          <h2 className="mb-4">Featured Projects</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A selection of healthcare AI projects demonstrating measurable impact 
            on patient outcomes and operational efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
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
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                  {project.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Outcomes */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.outcomes.map((outcome) => (
                    <span
                      key={outcome}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {outcome}
                    </span>
                  ))}
                </div>

                <Button variant="ghost" size="sm" className="group/btn p-0 h-auto">
                  View Case Study
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </motion.article>
          ))}
        </div>

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
