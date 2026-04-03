import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ArrowLeft, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPostData {
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

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, featured_image_url, category, tags, published_at, created_at')
        .eq('slug', slug!)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      setPost(data);

      if (data) {
        document.title = data.title;
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {post.category && <Badge variant="secondary">{post.category}</Badge>}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split('\n').map((paragraph, i) => {
              if (!paragraph.trim()) return <br key={i} />;
              if (paragraph.startsWith('# ')) return <h1 key={i}>{paragraph.slice(2)}</h1>;
              if (paragraph.startsWith('## ')) return <h2 key={i}>{paragraph.slice(3)}</h2>;
              if (paragraph.startsWith('### ')) return <h3 key={i}>{paragraph.slice(4)}</h3>;
              if (paragraph.startsWith('- ')) return <li key={i}>{paragraph.slice(2)}</li>;
              return <p key={i}>{paragraph}</p>;
            })}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-8 pt-6 border-t flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
