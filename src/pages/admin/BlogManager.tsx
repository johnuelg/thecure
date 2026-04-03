import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setFeaturedImageUrl('');
    setCategory('');
    setTags('');
    setIsPublished(false);
    setEditingPost(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || '');
    setContent(post.content);
    setFeaturedImageUrl(post.featured_image_url || '');
    setCategory(post.category || '');
    setTags(post.tags?.join(', ') || '');
    setIsPublished(post.is_published);
    setIsDialogOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingPost) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    try {
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title,
            slug,
            excerpt: excerpt || null,
            content,
            featured_image_url: featuredImageUrl || null,
            category: category || null,
            tags: tagsArray.length > 0 ? tagsArray : null,
            is_published: isPublished,
            published_at: isPublished && !editingPost.published_at ? new Date().toISOString() : editingPost.published_at,
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({ title: 'Post updated successfully' });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title,
            slug,
            excerpt: excerpt || null,
            content,
            featured_image_url: featuredImageUrl || null,
            category: category || null,
            tags: tagsArray.length > 0 ? tagsArray : null,
            is_published: isPublished,
            published_at: isPublished ? new Date().toISOString() : null,
            author_id: user?.id,
          });

        if (error) throw error;
        toast({ title: 'Post created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Post deleted successfully' });
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : post.published_at,
        })
        .eq('id', post.id);

      if (error) throw error;
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Write and manage your articles</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No blog posts yet</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Write Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {post.featured_image_url && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                      <Badge variant={post.is_published ? 'default' : 'secondary'}>
                        {post.is_published ? (
                          <><Eye className="h-3 w-3 mr-1" /> Published</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Draft</>
                        )}
                      </Badge>
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                      {post.category && <Badge variant="outline">{post.category}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(post)}
                    >
                      {post.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : 'New Blog Post'}
            </DialogTitle>
            <DialogDescription>
              {editingPost
                ? 'Update your article below'
                : 'Write and publish a new article'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Your article title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="your-article-title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary for previews..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here... (Markdown supported)"
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featuredImageUrl">Featured Image URL</Label>
                  <Input
                    id="featuredImageUrl"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., AI in Healthcare"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="machine learning, healthcare, AI"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="isPublished">Publish immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPost ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManager;
