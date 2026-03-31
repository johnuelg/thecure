import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Star, Quote } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  author_image_url: string | null;
  is_featured: boolean;
  rating: number;
  display_order: number;
  created_at: string;
}

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [quote, setQuote] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [authorCompany, setAuthorCompany] = useState('');
  const [authorImageUrl, setAuthorImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [rating, setRating] = useState(5);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setQuote('');
    setAuthorName('');
    setAuthorTitle('');
    setAuthorCompany('');
    setAuthorImageUrl('');
    setIsFeatured(false);
    setRating(5);
    setEditingTestimonial(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setQuote(testimonial.quote);
    setAuthorName(testimonial.author_name);
    setAuthorTitle(testimonial.author_title || '');
    setAuthorCompany(testimonial.author_company || '');
    setAuthorImageUrl(testimonial.author_image_url || '');
    setIsFeatured(testimonial.is_featured);
    setRating(testimonial.rating);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            quote,
            author_name: authorName,
            author_title: authorTitle || null,
            author_company: authorCompany || null,
            author_image_url: authorImageUrl || null,
            is_featured: isFeatured,
            rating,
          })
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast({ title: 'Testimonial updated successfully' });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert({
            quote,
            author_name: authorName,
            author_title: authorTitle || null,
            author_company: authorCompany || null,
            author_image_url: authorImageUrl || null,
            is_featured: isFeatured,
            display_order: testimonials.length,
          });

        if (error) throw error;
        toast({ title: 'Testimonial created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTestimonials();
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
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Testimonial deleted successfully' });
      fetchTestimonials();
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
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">Manage client testimonials and reviews</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No testimonials yet</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="h-6 w-6 text-primary/20 shrink-0" />
                  {testimonial.is_featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 absolute top-4 right-4" />
                  )}
                </div>
                <p className="text-muted-foreground italic mb-4 line-clamp-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.author_image_url || undefined} />
                      <AvatarFallback>
                        {testimonial.author_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{testimonial.author_name}</p>
                      {(testimonial.author_title || testimonial.author_company) && (
                        <p className="text-xs text-muted-foreground">
                          {[testimonial.author_title, testimonial.author_company].filter(Boolean).join(' at ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(testimonial)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(testimonial.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? 'Update the testimonial details below'
                : 'Add a new client testimonial'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quote">Quote *</Label>
                <Textarea
                  id="quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="What did they say about your work?"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name *</Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorTitle">Title</Label>
                  <Input
                    id="authorTitle"
                    value={authorTitle}
                    onChange={(e) => setAuthorTitle(e.target.value)}
                    placeholder="CTO"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorCompany">Company</Label>
                  <Input
                    id="authorCompany"
                    value={authorCompany}
                    onChange={(e) => setAuthorCompany(e.target.value)}
                    placeholder="Tech Corp"
                  />
                </div>
              </div>
              <ImageUpload
                label="Author Photo"
                value={authorImageUrl}
                onChange={setAuthorImageUrl}
                bucket="portfolio-images"
                accept="image/*"
              />
              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
                <Label htmlFor="isFeatured">Featured testimonial</Label>
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
                {editingTestimonial ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManager;
