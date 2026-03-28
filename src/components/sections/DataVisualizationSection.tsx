import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

// Fallback sample data for when database is empty
const fallbackVisualizations = [
  {
    id: "fallback-1",
    title: "Patient Recovery Rates",
    description: "Comparing traditional vs AI-assisted treatment outcomes",
    visualization_type: "chart" as const,
    chart_type: "line" as const,
    chart_data: [
      { month: "Jan", traditional: 72, aiAssisted: 78 },
      { month: "Feb", traditional: 74, aiAssisted: 82 },
      { month: "Mar", traditional: 73, aiAssisted: 85 },
      { month: "Apr", traditional: 75, aiAssisted: 88 },
      { month: "May", traditional: 74, aiAssisted: 91 },
      { month: "Jun", traditional: 76, aiAssisted: 93 },
    ],
    chart_config: { xAxisKey: "month" },
  },
  {
    id: "fallback-2",
    title: "Population Health Analysis",
    description: "Health status distribution across age groups",
    visualization_type: "chart" as const,
    chart_type: "bar" as const,
    chart_data: [
      { age: "0-17", healthy: 85, atRisk: 10, chronic: 5 },
      { age: "18-34", healthy: 78, atRisk: 15, chronic: 7 },
      { age: "35-54", healthy: 65, atRisk: 22, chronic: 13 },
      { age: "55-74", healthy: 48, atRisk: 30, chronic: 22 },
      { age: "75+", healthy: 35, atRisk: 35, chronic: 30 },
    ],
    chart_config: { xAxisKey: "age" },
  },
  {
    id: "fallback-3",
    title: "AI Applications in Healthcare",
    description: "Distribution of AI implementation across healthcare domains",
    visualization_type: "chart" as const,
    chart_type: "pie" as const,
    chart_data: [
      { name: "Diagnostics", value: 35 },
      { name: "Treatment Plans", value: 25 },
      { name: "Drug Discovery", value: 20 },
      { name: "Admin Tasks", value: 20 },
    ],
    chart_config: {},
  },
  {
    id: "fallback-4",
    title: "Efficiency Improvements",
    description: "Before and after AI implementation (baseline = 100%)",
    visualization_type: "chart" as const,
    chart_type: "area" as const,
    chart_data: [
      { category: "Diagnosis Time", before: 100, after: 35 },
      { category: "Admin Hours", before: 100, after: 45 },
      { category: "Error Rate", before: 100, after: 25 },
      { category: "Cost per Patient", before: 100, after: 60 },
    ],
    chart_config: { xAxisKey: "category" },
  },
];

const COLORS = [
  "hsl(210, 70%, 45%)",
  "hsl(175, 60%, 40%)",
  "hsl(210, 60%, 60%)",
  "hsl(175, 50%, 55%)",
  "hsl(220, 50%, 50%)",
];

interface DataVisualization {
  id: string;
  title: string;
  description: string | null;
  visualization_type: "image" | "gif" | "chart" | "embed";
  chart_type: "line" | "bar" | "pie" | "area" | null;
  chart_data: Record<string, unknown>[] | null;
  media_url: string | null;
  chart_config: Record<string, unknown> | null;
}

function ChartRenderer({ viz, index }: { viz: DataVisualization; index: number }) {
  const chartData = viz.chart_data as Record<string, unknown>[];
  const chartConfig = (viz.chart_config || {}) as Record<string, unknown>;
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const xAxisKey = (chartConfig?.xAxisKey as string) || Object.keys(chartData[0])[0];
  const dataKeys = Object.keys(chartData[0]).filter(k => k !== xAxisKey && k !== 'name' && k !== 'color');

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  };

  switch (viz.chart_type) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                stroke={i === 0 ? "hsl(var(--primary))" : COLORS[i % COLORS.length]}
                strokeWidth={i === 0 ? 3 : 2}
                dot={{ fill: i === 0 ? "hsl(var(--primary))" : COLORS[i % COLORS.length] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                stroke={COLORS[i % COLORS.length]}
                fill={`${COLORS[i % COLORS.length]}40`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={(entry as { color?: string }).color || COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

function VisualizationCard({ viz, index, isInView }: { viz: DataVisualization; index: number; isInView: boolean }) {
  const xOffset = index % 2 === 0 ? -20 : 20;

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: xOffset }}
      transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
      className="card-medical p-6"
    >
      <h3 className="text-lg font-semibold mb-2">{viz.title}</h3>
      {viz.description && (
        <p className="text-sm text-muted-foreground mb-6">{viz.description}</p>
      )}
      
      {viz.visualization_type === "chart" ? (
        <ChartRenderer viz={viz} index={index} />
      ) : viz.visualization_type === "embed" && viz.media_url ? (
        <div className="aspect-video">
          <iframe
            src={viz.media_url}
            className="w-full h-full rounded-lg border-0"
            title={viz.title}
            allowFullScreen
          />
        </div>
      ) : viz.media_url ? (
        <div className="flex items-center justify-center">
          <img
            src={viz.media_url}
            alt={viz.title}
            className="max-w-full h-auto rounded-lg"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
          No content available
        </div>
      )}
    </motion.div>
  );
}

export function DataVisualizationSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();

  const { data: profile } = useQuery({
    queryKey: ["public-profile-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("analytics_description")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: visualizations, isLoading } = useQuery({
    queryKey: ["public-visualizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_visualizations")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as DataVisualization[];
    },
  });

  // Use database visualizations or fallback to demo data
  const displayVisualizations = visualizations && visualizations.length > 0 
    ? visualizations 
    : fallbackVisualizations;

  const sectionDescription = profile?.analytics_description || 
    "Interactive visualizations demonstrating the power of AI in transforming healthcare outcomes and operational efficiency.";

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
          <span className="section-badge">
            Data Analytics Showcase
          </span>
          <h2 className="section-title">Healthcare AI in Action</h2>
          <p className="section-description">
            {sectionDescription}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-medical p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-3/4 mb-6" />
                <div className="h-[280px] bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {displayVisualizations.map((viz, index) => (
              <VisualizationCard 
                key={viz.id} 
                viz={viz as DataVisualization} 
                index={index} 
                isInView={isInView} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
