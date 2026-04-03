import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, Type, Save, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TypewriterKeyword {
  id: string;
  keyword: string;
  display_order: number;
  is_active: boolean;
}

const TypewriterKeywordsManager = () => {
  const [newKeyword, setNewKeyword] = useState('');
  const [anchorText, setAnchorText] = useState('');
  const [lineBreak, setLineBreak] = useState(4);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['admin-profile-typewriter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('tagline, typewriter_anchor, tagline_line_break')
        .maybeSingle();
      if (error) throw error;
      return data as { tagline: string | null; typewriter_anchor: string | null; tagline_line_break: number | null } | null;
    },
  });

  useEffect(() => {
    if (profile?.typewriter_anchor) {
      setAnchorText(profile.typewriter_anchor);
    }
    if (profile?.tagline_line_break != null) {
      setLineBreak(profile.tagline_line_break);
    }
  }, [profile]);

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

  const saveAnchorMutation = useMutation({
    mutationFn: async (anchor: string) => {
      const { error } = await supabase
        .from('profile')
        .update({ typewriter_anchor: anchor || null } as any)
        .not('id', 'is', null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile-typewriter'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast({ title: 'Typewriter anchor saved' });
    },
    onError: () => toast({ title: 'Error saving anchor', variant: 'destructive' }),
  });

  const saveLineBreakMutation = useMutation({
    mutationFn: async (value: number) => {
      const { error } = await supabase
        .from('profile')
        .update({ tagline_line_break: value } as any)
        .not('id', 'is', null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile-typewriter'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast({ title: 'Headline line break saved' });
    },
    onError: () => toast({ title: 'Error saving line break', variant: 'destructive' }),
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

  const currentTagline = profile?.tagline || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Type className="w-8 h-8" />
          Typewriter Keywords
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage the rotating keywords and choose where the typewriter effect appears in the hero headline.
        </p>
      </div>

      {/* Anchor Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Typewriter Anchor Phrase</CardTitle>
          <CardDescription>
            Set which phrase in your headline gets replaced by the cycling typewriter animation.
            This phrase must exactly match a part of your current headline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentTagline && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                <span className="font-medium">Current headline:</span>{' '}
                <span className="text-foreground">{currentTagline.replace('|', ' ')}</span>
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Anchor phrase (the part to animate)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Smarter AI Tools"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
              />
              <Button
                onClick={() => saveAnchorMutation.mutate(anchorText.trim())}
                disabled={saveAnchorMutation.isPending}
                className="healthcare-gradient border-0"
              >
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The anchor phrase will appear first, then cycle through your keywords below.
              Leave empty to show keywords on a separate line below the headline.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Headline Line Break */}
      <Card>
        <CardHeader>
          <CardTitle>Headline Line Break</CardTitle>
          <CardDescription>
            Control how many words appear on the first line of the hero headline. Remaining words wrap to the next line.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentTagline && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                <span className="font-medium">Preview:</span>{' '}
                <span className="text-foreground font-semibold">
                  {currentTagline.split(/\s+/).slice(0, lineBreak).join(' ')}
                </span>
                {currentTagline.split(/\s+/).length > lineBreak && (
                  <>
                    <br />
                    <span className="text-muted-foreground">
                      {currentTagline.split(/\s+/).slice(lineBreak).join(' ')}
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Words on first line</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={1}
                max={20}
                value={lineBreak}
                onChange={(e) => setLineBreak(Number(e.target.value))}
                className="w-24"
              />
              <Button
                onClick={() => saveLineBreakMutation.mutate(lineBreak)}
                disabled={saveLineBreakMutation.isPending}
                className="healthcare-gradient border-0"
              >
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Set to 0 to keep the entire headline on one line.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Keyword</CardTitle>
          <CardDescription>Add a new rotating keyword that cycles in place of the anchor phrase</CardDescription>
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