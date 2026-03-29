import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconPicker } from "@/components/admin/IconPicker";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const getIcon = (iconName: string): LucideIcon => {
  return (icons as Record<string, LucideIcon>)[iconName] || icons.Award;
};

interface HeroStat {
  id: string;
  icon: string;
  value: string;
  label: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

interface SortableStatCardProps {
  stat: HeroStat;
  onFieldBlur: (id: string, field: string, value: string | number | boolean) => void;
  onDelete: (id: string) => void;
}

function SortableStatCard({ stat, onFieldBlur, onDelete }: SortableStatCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = getIcon(stat.icon);

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2 pt-2">
            <button
              {...attributes}
              {...listeners}
              className="touch-none cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="flex-1 grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <IconPicker
                value={stat.icon}
                onChange={(name) => onFieldBlur(stat.id, "icon", name)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`value-${stat.id}`}>Value</Label>
              <Input
                id={`value-${stat.id}`}
                defaultValue={stat.value}
                placeholder="e.g. 3+, 95%"
                onBlur={(e) => onFieldBlur(stat.id, "value", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`label-${stat.id}`}>Label</Label>
              <Input
                id={`label-${stat.id}`}
                defaultValue={stat.label}
                placeholder="e.g. Years Experience"
                onBlur={(e) => onFieldBlur(stat.id, "label", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`active-${stat.id}`} className="text-xs">Active</Label>
              <Switch
                id={`active-${stat.id}`}
                checked={stat.is_active}
                onCheckedChange={(checked) => onFieldBlur(stat.id, "is_active", checked)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(stat.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const HeroStatsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-hero-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_stats")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as HeroStat[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroStat> & { id: string }) => {
      const { error } = await supabase
        .from("hero_stats")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-hero-stats"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedStats: { id: string; display_order: number }[]) => {
      const promises = reorderedStats.map(({ id, display_order }) =>
        supabase.from("hero_stats").update({ display_order }).eq("id", id)
      );
      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-hero-stats"] });
      toast({ title: "Reordered", description: "Display order updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reorder.", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const nextOrder = stats?.length || 0;
      const { error } = await supabase.from("hero_stats").insert({
        icon: "Award",
        value: "0+",
        label: "New Stat",
        display_order: nextOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-stats"] });
      toast({ title: "Created", description: "New hero stat added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_stats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-hero-stats"] });
      toast({ title: "Deleted", description: "Hero stat removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    },
  });

  const handleFieldBlur = (id: string, field: string, value: string | number | boolean) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !stats) return;

    const oldIndex = stats.findIndex((s) => s.id === active.id);
    const newIndex = stats.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stats, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(["admin-hero-stats"], reordered);

    reorderMutation.mutate(
      reordered.map((s, i) => ({ id: s.id, display_order: i }))
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Hero Stats Cards</h1>
          <p className="text-muted-foreground">
            Manage the stat cards displayed in the hero section. Drag to reorder.
          </p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stat
        </Button>
      </div>

      <div className="grid gap-4">
        {stats && stats.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stats.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {stats.map((stat) => (
                <SortableStatCard
                  key={stat.id}
                  stat={stat}
                  onFieldBlur={handleFieldBlur}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hero stats yet. Click "Add Stat" to create one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HeroStatsManager;
