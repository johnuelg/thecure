import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Mail,
  Quote,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
  BarChart3,
  ScrollText,
  BookOpen,
  AlignLeft,
  Sparkles,
  Link2,
  Gauge,
  Tags,
  Highlighter,
  Type,
  Orbit,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Profile', href: '/admin/profile', icon: User },
  { title: 'Section Descriptions', href: '/admin/sections', icon: AlignLeft },
  { title: 'Hero Stats', href: '/admin/hero-stats', icon: Gauge },
  { title: 'Keyword Highlights', href: '/admin/keyword-highlights', icon: Highlighter },
  { title: 'Typewriter Keywords', href: '/admin/typewriter-keywords', icon: Type },
  { title: 'About Highlights', href: '/admin/about-highlights', icon: Sparkles },
  { title: 'Parallax Icons', href: '/admin/parallax-icons', icon: Orbit },
  { title: 'Theme Gradient', href: '/admin/theme', icon: Palette },
  { title: 'Expertise Tags', href: '/admin/expertise', icon: Tags },
  { title: 'Footer Links', href: '/admin/footer-links', icon: Link2 },
  { title: 'Resume', href: '/admin/resume', icon: ScrollText },
  { title: 'Services', href: '/admin/services', icon: Briefcase },
  { title: 'Projects', href: '/admin/projects', icon: LayoutDashboard },
  { title: 'Visualizations', href: '/admin/visualizations', icon: BarChart3 },
  { title: 'Knowledge Base', href: '/admin/knowledge-base', icon: BookOpen },
  { title: 'Blog Posts', href: '/admin/blog', icon: FileText },
  { title: 'Testimonials', href: '/admin/testimonials', icon: Quote },
  { title: 'Messages', href: '/admin/messages', icon: Mail },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-2 border-t">
          <a
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            )}
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>View Site</span>}
          </a>
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 lg:flex-none" />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
