import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Mail,
  Quote,
  TrendingUp
} from 'lucide-react';

interface Stats {
  services: number;
  projects: number;
  blogPosts: number;
  testimonials: number;
  unreadMessages: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    services: 0,
    projects: 0,
    blogPosts: 0,
    testimonials: 0,
    unreadMessages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [services, projects, blogPosts, testimonials, messages] = await Promise.all([
          supabase.from('services').select('id', { count: 'exact', head: true }),
          supabase.from('projects').select('id', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
          supabase.from('testimonials').select('id', { count: 'exact', head: true }),
          supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('is_read', false),
        ]);

        setStats({
          services: services.count || 0,
          projects: projects.count || 0,
          blogPosts: blogPosts.count || 0,
          testimonials: testimonials.count || 0,
          unreadMessages: messages.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Services', value: stats.services, icon: Briefcase, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Projects', value: stats.projects, icon: LayoutDashboard, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'Blog Posts', value: stats.blogPosts, icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { title: 'Testimonials', value: stats.testimonials, icon: Quote, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
    { title: 'Unread Messages', value: stats.unreadMessages, icon: Mail, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your portfolio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? '--' : stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks to manage your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Add New Service"
              description="Create a new consulting service"
              href="/admin/services"
              icon={Briefcase}
            />
            <QuickActionCard
              title="Add New Project"
              description="Showcase a new case study"
              href="/admin/projects"
              icon={LayoutDashboard}
            />
            <QuickActionCard
              title="Write Blog Post"
              description="Share your expertise"
              href="/admin/blog"
              icon={FileText}
            />
            <QuickActionCard
              title="View Messages"
              description={`${stats.unreadMessages} unread`}
              href="/admin/messages"
              icon={Mail}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickActionCard = ({ 
  title, 
  description, 
  href, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <a 
    href={href}
    className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
  >
    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
    <div>
      <p className="font-medium group-hover:text-primary transition-colors">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </a>
);

export default AdminDashboard;
