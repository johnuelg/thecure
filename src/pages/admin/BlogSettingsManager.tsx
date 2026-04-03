import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, FileText, Layout, Search } from 'lucide-react';

interface BlogSettings {
  blog_description: string | null;
  blog_posts_per_page: number | null;
  blog_layout: string | null;
  blog_page_title: string | null;
  blog_meta_description: string | null;
}

const BlogSettingsManager = () => {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [blogDescription, setBlogDescription] = useState('');
  const [postsPerPage, setPostsPerPage] = useState(6);
  const [blogLayout, setBlogLayout] = useState('grid');
  const [blogPageTitle, setBlogPageTitle] = useState('Blog');
  const [blogMetaDescription, setBlogMetaDescription] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('blog_description, blog_posts_per_page, blog_layout, blog_page_title, blog_meta_description')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data as BlogSettings);
        setBlogDescription((data as any).blog_description || '');
        setPostsPerPage((data as any).blog_posts_per_page || 6);
        setBlogLayout((data as any).blog_layout || 'grid');
        setBlogPageTitle((data as any).blog_page_title || 'Blog');
        setBlogMetaDescription((data as any).blog_meta_description || '');
      }
    } catch (error) {
      console.error('Error fetching blog settings:', error);
      toast({ title: 'Error', description: 'Failed to load blog settings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profile')
        .update({
          blog_description: blogDescription || null,
          blog_posts_per_page: postsPerPage,
          blog_layout: blogLayout,
          blog_page_title: blogPageTitle || 'Blog',
          blog_meta_description: blogMetaDescription || null,
        } as any)
        .eq('id', (await supabase.from('profile').select('id').maybeSingle()).data?.id || '');

      if (error) throw error;
      toast({ title: 'Blog settings saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
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
          <h1 className="text-2xl font-bold">Blog Settings</h1>
          <p className="text-muted-foreground">Customize your blog page appearance and SEO</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Settings
            </CardTitle>
            <CardDescription>Configure the intro text shown above your blog posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blogDescription">Blog Section Description</Label>
              <Textarea
                id="blogDescription"
                value={blogDescription}
                onChange={(e) => setBlogDescription(e.target.value)}
                placeholder="Explore my thoughts on AI, healthcare technology, and innovation..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">This text appears at the top of your blog page</p>
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Layout & Display
            </CardTitle>
            <CardDescription>Control how blog posts are displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="blogLayout">Blog Layout</Label>
              <Select value={blogLayout} onValueChange={setBlogLayout}>
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid (cards in columns)</SelectItem>
                  <SelectItem value="list">List (full-width rows)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Posts Per Page: {postsPerPage}</Label>
              <Slider
                value={[postsPerPage]}
                onValueChange={(v) => setPostsPerPage(v[0])}
                min={3}
                max={24}
                step={3}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How many posts to show per page (3–24)</p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Settings
            </CardTitle>
            <CardDescription>Optimize your blog page for search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blogPageTitle">Page Title</Label>
              <Input
                id="blogPageTitle"
                value={blogPageTitle}
                onChange={(e) => setBlogPageTitle(e.target.value)}
                placeholder="Blog"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">{blogPageTitle.length}/60 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blogMetaDescription">Meta Description</Label>
              <Textarea
                id="blogMetaDescription"
                value={blogMetaDescription}
                onChange={(e) => setBlogMetaDescription(e.target.value)}
                placeholder="Read articles about AI in healthcare, technology insights, and more..."
                rows={2}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">{blogMetaDescription.length}/160 characters</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogSettingsManager;
