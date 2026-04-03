import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
}

interface BlogSettings {
  blog_description: string | null;
  blog_posts_per_page: number | null;
  blog_layout: string | null;
  blog_page_title: string | null;
  blog_meta_description: string | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch settings
      const { data: profileData } = await supabase
        .from('profile')
        .select('blog_description, blog_posts_per_page, blog_layout, blog_page_title, blog_meta_description')
        .maybeSingle();

      const blogSettings = profileData as unknown as BlogSettings;
      setSettings(blogSettings);

      const perPage = (blogSettings as any)?.blog_posts_per_page || 6;

      // Fetch count
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      setTotalCount(count || 0);

      // Fetch posts
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, featured_image_url, category, tags, published_at, created_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const perPage = settings?.blog_posts_per_page || 6;
  const totalPages = Math.ceil(totalCount / perPage);
  const layout = settings?.blog_layout || 'grid';
  const pageTitle = settings?.blog_page_title || 'Blog';
  const description = settings?.blog_description;

  // SEO
  useEffect(() => {
    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings?.blog_meta_description) {
      metaDesc.setAttribute('content', settings.blog_meta_description);
    }
  }, [pageTitle, settings?.blog_meta_description]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No blog posts published yet.</p>
            </div>
          ) : layout === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
                    {post.featured_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && <Badge variant="secondary">{post.category}</Badge>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="mt-3 flex items-center text-sm text-primary font-medium">
                        Read more <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row gap-0">
                        {post.featured_image_url && (
                          <div className="md:w-64 shrink-0 aspect-video md:aspect-auto overflow-hidden">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-5 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.category && <Badge variant="secondary">{post.category}</Badge>}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h2 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          {post.excerpt && (
                            <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                          )}
                          <div className="mt-3 flex items-center text-sm text-primary font-medium">
                            Read more <ArrowRight className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
