import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const availableIcons = [
  'Award', 'Target', 'Lightbulb', 'Heart', 'Star', 'Zap', 'Shield', 
  'TrendingUp', 'Users', 'Clock', 'CheckCircle', 'Rocket', 'Brain',
  'Activity', 'BarChart', 'Briefcase', 'Globe', 'Layers', 'Settings'
];

interface Highlight {
  id: string;
  icon: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

const AboutHighlightsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    icon: 'Award',
    title: '',
    description: '',
    is_active: true,
  });

  const { data: highlights, isLoading } = useQuery({
    queryKey: ['admin-about-highlights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_highlights')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Highlight[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Highlight, 'id' | 'display_order'>) => {
      const maxOrder = highlights?.length ? Math.max(...highlights.map(h => h.display_order)) : 0;
      const { error } = await supabase
        .from('about_highlights')
        .insert({ ...data, display_order: maxOrder + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-highlights'] });
      queryClient.invalidateQueries({ queryKey: ['public-about-highlights'] });
      toast({ title: 'Highlight created' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Highlight> & { id: string }) => {
      const { error } = await supabase
        .from('about_highlights')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-highlights'] });
      queryClient.invalidateQueries({ queryKey: ['public-about-highlights'] });
      toast({ title: 'Highlight updated' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('about_highlights')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-highlights'] });
      queryClient.invalidateQueries({ queryKey: ['public-about-highlights'] });
      toast({ title: 'Highlight deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ icon: 'Award', title: '', description: '', is_active: true });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (highlight: Highlight) => {
    setFormData({
      icon: highlight.icon,
      title: highlight.title,
      description: highlight.description,
      is_active: highlight.is_active,
    });
    setEditingId(highlight.id);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (id: string, is_active: boolean) => {
    updateMutation.mutate({ id, is_active });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            About Highlights
          </h1>
          <p className="text-muted-foreground">
            Manage the highlight cards shown in the About section.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Highlight
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Highlight' : 'Add Highlight'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="10+ Years Experience"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deep expertise in healthcare AI implementation"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {highlights?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No highlights yet. Add your first one!</p>
            </CardContent>
          </Card>
        ) : (
          highlights?.map((highlight) => (
            <Card key={highlight.id} className={!highlight.is_active ? 'opacity-60' : ''}>
              <CardContent className="flex items-center gap-4 py-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs text-primary font-medium">{highlight.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{highlight.description}</p>
                </div>
                
                <Switch
                  checked={highlight.is_active}
                  onCheckedChange={(checked) => handleToggleActive(highlight.id, checked)}
                />
                
                <Button variant="ghost" size="sm" onClick={() => handleEdit(highlight)}>
                  Edit
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(highlight.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AboutHighlightsManager;