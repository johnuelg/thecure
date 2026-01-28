import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Sample healthcare data
const patientOutcomes = [
  { month: "Jan", traditional: 72, aiAssisted: 78 },
  { month: "Feb", traditional: 74, aiAssisted: 82 },
  { month: "Mar", traditional: 73, aiAssisted: 85 },
  { month: "Apr", traditional: 75, aiAssisted: 88 },
  { month: "May", traditional: 74, aiAssisted: 91 },
  { month: "Jun", traditional: 76, aiAssisted: 93 },
];

const populationHealth = [
  { age: "0-17", healthy: 85, atRisk: 10, chronic: 5 },
  { age: "18-34", healthy: 78, atRisk: 15, chronic: 7 },
  { age: "35-54", healthy: 65, atRisk: 22, chronic: 13 },
  { age: "55-74", healthy: 48, atRisk: 30, chronic: 22 },
  { age: "75+", healthy: 35, atRisk: 35, chronic: 30 },
];

const aiApplications = [
  { name: "Diagnostics", value: 35, color: "hsl(210, 70%, 45%)" },
  { name: "Treatment Plans", value: 25, color: "hsl(175, 60%, 40%)" },
  { name: "Drug Discovery", value: 20, color: "hsl(210, 60%, 60%)" },
  { name: "Admin Tasks", value: 20, color: "hsl(175, 50%, 55%)" },
];

const efficiencyGains = [
  { category: "Diagnosis Time", before: 100, after: 35 },
  { category: "Admin Hours", before: 100, after: 45 },
  { category: "Error Rate", before: 100, after: 25 },
  { category: "Cost per Patient", before: 100, after: 60 },
];

export function DataVisualizationSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

  return (
    <section id="visualizations" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Data Analytics Showcase
          </span>
          <h2 className="mb-4">Healthcare AI in Action</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Interactive visualizations demonstrating the power of AI in transforming 
            healthcare outcomes and operational efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Outcomes Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card-medical p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Patient Recovery Rates</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Comparing traditional vs AI-assisted treatment outcomes
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={patientOutcomes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="traditional"
                  name="Traditional"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="aiAssisted"
                  name="AI-Assisted"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Population Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-medical p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Population Health Analysis</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Health status distribution across age groups
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={populationHealth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="age" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="healthy" name="Healthy" fill="hsl(var(--healthcare-teal))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRisk" name="At Risk" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chronic" name="Chronic" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* AI Applications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-medical p-6"
          >
            <h3 className="text-lg font-semibold mb-2">AI Applications in Healthcare</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Distribution of AI implementation across healthcare domains
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={aiApplications}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {aiApplications.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Efficiency Gains */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card-medical p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Efficiency Improvements</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Before and after AI implementation (baseline = 100%)
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={efficiencyGains}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 120]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="before"
                  name="Before AI"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))"
                />
                <Area
                  type="monotone"
                  dataKey="after"
                  name="After AI"
                  stroke="hsl(var(--healthcare-teal))"
                  fill="hsl(var(--healthcare-teal) / 0.3)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
