import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, Type } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface TypewriterKeyword {
  id: string;
  keyword: string;
  display_order: number;
  is_active: boolean;
}

const TypewriterKeywordsManager = () => {
  const [newKeyword, setNewKeyword] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['admin-typewriter-keywords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_typewriter_keywords')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as TypewriterKeyword[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const maxOrder = keywords.length > 0 ? Math.max(...keywords.map(k => k.display_order)) + 1 : 0;
      const { error } = await supabase
        .from('hero_typewriter_keywords')
        .insert({ keyword, display_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-typewriter-keywords'] });
      setNewKeyword('');
      toast({ title: 'Keyword added' });
    },
    onError: () => toast({ title: 'Error adding keyword', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_typewriter_keywords').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-typewriter-keywords'] });
      toast({ title: 'Keyword deleted' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('hero_typewriter_keywords')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-typewriter-keywords'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Type className="w-8 h-8" />
          Typewriter Keywords
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage the rotating keywords in the hero headline typewriter animation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Keyword</CardTitle>
          <CardDescription>Add a new rotating keyword for the hero headline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Healthcare AI"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newKeyword.trim() && addMutation.mutate(newKeyword.trim())}
            />
            <Button
              onClick={() => newKeyword.trim() && addMutation.mutate(newKeyword.trim())}
              disabled={!newKeyword.trim() || addMutation.isPending}
              className="healthcare-gradient border-0"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Keywords ({keywords.length})</CardTitle>
          <CardDescription>These keywords rotate in the hero headline with a typewriter effect</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : keywords.length === 0 ? (
            <p className="text-muted-foreground">No keywords yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {keywords.map((kw) => (
                <div
                  key={kw.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 font-medium">{kw.keyword}</span>
                  <Switch
                    checked={kw.is_active}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: kw.id, is_active: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(kw.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TypewriterKeywordsManager;
