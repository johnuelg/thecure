-- =============================================
-- AI Healthcare Portfolio CMS Database Schema
-- =============================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table (for secure role management)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Create helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 5. Create profile table (single row for site owner info)
CREATE TABLE public.profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL DEFAULT 'Your Name',
    professional_title TEXT NOT NULL DEFAULT 'AI Healthcare Consultant',
    bio TEXT,
    tagline TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    profile_image_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge TEXT,
    solution TEXT,
    outcome TEXT,
    image_url TEXT,
    demo_url TEXT,
    category TEXT,
    technologies TEXT[],
    metrics JSONB,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Create testimonials table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_title TEXT,
    author_company TEXT,
    author_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Create contact_submissions table
CREATE TABLE public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Add updated_at triggers
CREATE TRIGGER update_profile_updated_at
    BEFORE UPDATE ON public.profile
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Enable RLS on all tables
-- =============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for user_roles
-- =============================================

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =============================================
-- RLS Policies for profile (public read, admin write)
-- =============================================

CREATE POLICY "Anyone can view profile"
    ON public.profile FOR SELECT
    USING (true);

CREATE POLICY "Admins can update profile"
    ON public.profile FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can insert profile"
    ON public.profile FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- =============================================
-- RLS Policies for services (public read, admin write)
-- =============================================

CREATE POLICY "Anyone can view active services"
    ON public.services FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage services"
    ON public.services FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =============================================
-- RLS Policies for projects (public read, admin write)
-- =============================================

CREATE POLICY "Anyone can view projects"
    ON public.projects FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =============================================
-- RLS Policies for blog_posts (public read published, admin all)
-- =============================================

CREATE POLICY "Anyone can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can view all blog posts"
    ON public.blog_posts FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can manage blog posts"
    ON public.blog_posts FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =============================================
-- RLS Policies for testimonials (public read, admin write)
-- =============================================

CREATE POLICY "Anyone can view testimonials"
    ON public.testimonials FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage testimonials"
    ON public.testimonials FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =============================================
-- RLS Policies for contact_submissions
-- =============================================

CREATE POLICY "Anyone can submit contact form"
    ON public.contact_submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
    ON public.contact_submissions FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can manage contact submissions"
    ON public.contact_submissions FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete contact submissions"
    ON public.contact_submissions FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- =============================================
-- Create storage buckets
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('resume', 'resume', true);

-- =============================================
-- Storage policies for portfolio-images bucket
-- =============================================

CREATE POLICY "Public can view portfolio images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-images');

CREATE POLICY "Admins can upload portfolio images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-images' AND public.is_admin());

CREATE POLICY "Admins can update portfolio images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-images' AND public.is_admin());

CREATE POLICY "Admins can delete portfolio images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-images' AND public.is_admin());

-- =============================================
-- Storage policies for resume bucket
-- =============================================

CREATE POLICY "Public can view resume"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resume');

CREATE POLICY "Admins can upload resume"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'resume' AND public.is_admin());

CREATE POLICY "Admins can update resume"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'resume' AND public.is_admin());

CREATE POLICY "Admins can delete resume"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'resume' AND public.is_admin());