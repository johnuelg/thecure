import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfileManager from "./pages/admin/ProfileManager";
import SectionDescriptionsManager from "./pages/admin/SectionDescriptionsManager";
import ServicesManager from "./pages/admin/ServicesManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import BlogManager from "./pages/admin/BlogManager";
import TestimonialsManager from "./pages/admin/TestimonialsManager";
import MessagesManager from "./pages/admin/MessagesManager";
import VisualizationsManager from "./pages/admin/VisualizationsManager";
import ResumeManager from "./pages/admin/ResumeManager";
import KnowledgeBaseManager from "./pages/admin/KnowledgeBaseManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            {/* Admin auth routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            
            {/* Protected admin routes with layout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<ProfileManager />} />
              <Route path="sections" element={<SectionDescriptionsManager />} />
              <Route path="services" element={<ServicesManager />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="visualizations" element={<VisualizationsManager />} />
              <Route path="resume" element={<ResumeManager />} />
              <Route path="knowledge-base" element={<KnowledgeBaseManager />} />
              <Route path="blog" element={<BlogManager />} />
              <Route path="testimonials" element={<TestimonialsManager />} />
              <Route path="messages" element={<MessagesManager />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
