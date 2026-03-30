import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tags, Plus, Trash2, Loader2, GripVertical } from 'lucide-react';

const ExpertiseManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState('');

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin-expertise-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expertise_tags')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxOrder = tags?.length ? Math.max(...tags.map(t => t.display_order ?? 0)) + 1 : 0;
      const { error } = await supabase
        .from('expertise_tags')
        .insert({ name, display_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expertise-tags'] });
      queryClient.invalidateQueries({ queryKey: ['public-expertise-tags'] });
      setNewTag('');
      toast({ title: 'Expertise tag added' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('expertise_tags')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expertise-tags'] });
      queryClient.invalidateQueries({ queryKey: ['public-expertise-tags'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expertise_tags')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expertise-tags'] });
      queryClient.invalidateQueries({ queryKey: ['public-expertise-tags'] });
      toast({ title: 'Expertise tag deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleAdd = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed);
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
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tags className="h-6 w-6" />
          Expertise Tags
        </h1>
        <p className="text-muted-foreground">
          Manage the expertise tags displayed in your About section.
        </p>
      </div>

      {/* Add new tag */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add New Tag</CardTitle>
          <CardDescription>Add a new expertise or skill tag</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. Machine Learning, NLP, Computer Vision..."
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={addMutation.isPending || !newTag.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tags list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Current Tags</CardTitle>
          <CardDescription>{tags?.length || 0} expertise tags</CardDescription>
        </CardHeader>
        <CardContent>
          {tags && tags.length > 0 ? (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className={tag.is_active ? 'text-foreground' : 'text-muted-foreground line-through'}>
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={tag.is_active ?? true}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: tag.id, is_active: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(tag.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No expertise tags yet. Add your first one above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertiseManager;
