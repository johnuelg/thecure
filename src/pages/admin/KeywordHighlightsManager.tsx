import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";

interface KeywordHighlight {
  id: string;
  keyword: string;
  glow_color: string;
  is_active: boolean;
  display_order: number;
  target: string;
}

const KeywordHighlightsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKeyword, setNewKeyword] = useState("");
  const [newColor, setNewColor] = useState("#41c0c2");

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ["admin-keyword-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_keyword_highlights")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as KeywordHighlight[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("hero_keyword_highlights").insert({
        keyword: newKeyword.trim(),
        glow_color: newColor,
        display_order: keywords.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-keyword-highlights"] });
      queryClient.invalidateQueries({ queryKey: ["public-keyword-highlights"] });
      setNewKeyword("");
      toast({ title: "Keyword added" });
    },
    onError: () => toast({ title: "Error adding keyword", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<KeywordHighlight> }) => {
      const { error } = await supabase.from("hero_keyword_highlights").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-keyword-highlights"] });
      queryClient.invalidateQueries({ queryKey: ["public-keyword-highlights"] });
    },
    onError: () => toast({ title: "Error updating", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_keyword_highlights").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-keyword-highlights"] });
      queryClient.invalidateQueries({ queryKey: ["public-keyword-highlights"] });
      toast({ title: "Keyword removed" });
    },
    onError: () => toast({ title: "Error deleting", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Keyword Highlights</h1>
        <p className="text-muted-foreground">
          Add keywords that should glow/highlight in the hero sub-headline (bio text).
        </p>
      </div>

      {/* Add new keyword */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1">
            <Label>Keyword</Label>
            <Input
              placeholder="e.g. artificial intelligence"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Glow Color</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-28"
              />
            </div>
          </div>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!newKeyword.trim() || addMutation.isPending}
            className="healthcare-gradient border-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </Card>

      {/* Existing keywords */}
      <div className="space-y-2">
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {keywords.map((kw) => (
          <Card key={kw.id} className="p-4 flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
            <div
              className="w-6 h-6 rounded-full shrink-0 border"
              style={{ backgroundColor: kw.glow_color, boxShadow: `0 0 10px ${kw.glow_color}` }}
            />
            <Input
              defaultValue={kw.keyword}
              onBlur={(e) => {
                if (e.target.value !== kw.keyword) {
                  updateMutation.mutate({ id: kw.id, updates: { keyword: e.target.value } });
                }
              }}
              className="flex-1"
            />
            <input
              type="color"
              defaultValue={kw.glow_color}
              onChange={(e) =>
                updateMutation.mutate({ id: kw.id, updates: { glow_color: e.target.value } })
              }
              className="w-8 h-8 rounded cursor-pointer border-0 shrink-0"
            />
            <Switch
              checked={kw.is_active}
              onCheckedChange={(checked) =>
                updateMutation.mutate({ id: kw.id, updates: { is_active: checked } })
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(kw.id)}
              className="text-destructive hover:text-destructive shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Card>
        ))}
        {!isLoading && keywords.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No keyword highlights yet. Add keywords above to highlight them in your bio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordHighlightsManager;
