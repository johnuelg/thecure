import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, GripVertical, Sparkles } from 'lucide-react';
import { icons } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconPicker } from '@/components/admin/IconPicker';
import { AnimationStyleSelector, HoverEffectSelector, ScrollEffectSelector, SpeedSelector, type AnimationPreset, type SpeedOption } from '@/components/admin/AnimationStyleSelector';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ParallaxIcon {
  id: string;
  icon_name: string;
  glow_color: string;
  display_order: number;
  is_active: boolean;
}

const getIcon = (name: string): LucideIcon => {
  return (icons as Record<string, LucideIcon>)[name] || icons.Award;
};

function SortableIconRow({
  item,
  onToggle,
  onDelete,
  onColorChange,
}: {
  item: ParallaxIcon;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const Icon = getIcon(item.icon_name);

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="font-medium flex-1 text-sm">{item.icon_name}</span>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={item.glow_color}
          onChange={(e) => onColorChange(item.id, e.target.value)}
          className="w-8 h-8 p-0.5 border rounded cursor-pointer"
          title="Glow color"
        />
        <Switch
          checked={item.is_active}
          onCheckedChange={(checked) => onToggle(item.id, checked)}
        />
        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const ParallaxIconsManager = () => {
  const [items, setItems] = useState<ParallaxIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIconName, setNewIconName] = useState('Brain');
  const [newGlowColor, setNewGlowColor] = useState('#41c0c2');
  const [animationStyle, setAnimationStyle] = useState('gentle-float');
  const [hoverEffect, setHoverEffect] = useState('soft-glow');
  const [scrollEffect, setScrollEffect] = useState('parallax-shift');
  const [animSpeed, setAnimSpeed] = useState<SpeedOption>('slow');
  const [parallaxEnabled, setParallaxEnabled] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_parallax_icons')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching parallax icons:', error);
      toast({ title: 'Error', description: 'Failed to load icons', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const fetchAnimStyle = async () => {
      const { data } = await supabase.from('profile').select('id, parallax_animation_style, parallax_hover_effect, parallax_scroll_effect, parallax_animation_speed, parallax_enabled').maybeSingle();
      if (data) {
        setProfileId(data.id);
        setAnimationStyle((data as any).parallax_animation_style || 'gentle-float');
        setHoverEffect((data as any).parallax_hover_effect || 'soft-glow');
        setScrollEffect((data as any).parallax_scroll_effect || 'parallax-shift');
        setAnimSpeed(((data as any).parallax_animation_speed || 'slow') as SpeedOption);
        setParallaxEnabled((data as any).parallax_enabled !== false);
      }
    };
    fetchAnimStyle();
  }, []);

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('hero_parallax_icons')
        .insert({ icon_name: newIconName, glow_color: newGlowColor, display_order: items.length });
      if (error) throw error;
      toast({ title: 'Icon added' });
      setIsDialogOpen(false);
      setNewIconName('Brain');
      setNewGlowColor('#41c0c2');
      fetchItems();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_active } : i));
    const { error } = await supabase.from('hero_parallax_icons').update({ is_active }).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); fetchItems(); }
  };

  const handleColorChange = async (id: string, glow_color: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, glow_color } : i));
    const { error } = await supabase.from('hero_parallax_icons').update({ glow_color }).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this icon?')) return;
    try {
      const { error } = await supabase.from('hero_parallax_icons').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Icon deleted' });
      fetchItems();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Remove ALL parallax icons? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('hero_parallax_icons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setItems([]);
      toast({ title: 'All icons removed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    setParallaxEnabled(enabled);
    if (profileId) {
      await supabase.from('profile').update({ parallax_enabled: enabled }).eq('id', profileId);
      queryClient.invalidateQueries({ queryKey: ['public-profile-parallax'] });
      toast({ title: enabled ? 'Parallax animations enabled' : 'All animations disabled' });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await Promise.all(
      reordered.map((item, i) =>
        supabase.from('hero_parallax_icons').update({ display_order: i }).eq('id', item.id)
      )
    );
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
          <h1 className="text-2xl font-bold">Parallax Icons</h1>
          <p className="text-muted-foreground">Customize the floating animated icons on the hero section</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Icon
          </Button>
        </div>
      </div>

      {/* Master toggle and bulk actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={parallaxEnabled} onCheckedChange={handleToggleEnabled} />
              <div>
                <Label className="text-sm font-medium">Enable Parallax Animations</Label>
                <p className="text-xs text-muted-foreground">
                  {parallaxEnabled ? 'Floating icons are visible on the hero section' : 'All parallax animations are disabled'}
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove All Icons
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AnimationStyleSelector
        selected={animationStyle}
        onSelect={async (preset: AnimationPreset) => {
          setAnimationStyle(preset.id);
          if (profileId) {
            await supabase.from('profile').update({ parallax_animation_style: preset.id }).eq('id', profileId);
            queryClient.invalidateQueries({ queryKey: ['public-profile-parallax'] });
            toast({ title: `Float animation: "${preset.name}"` });
          }
        }}
      />

      <SpeedSelector
        selected={animSpeed}
        onSelect={async (speed: SpeedOption) => {
          setAnimSpeed(speed);
          if (profileId) {
            await supabase.from('profile').update({ parallax_animation_speed: speed }).eq('id', profileId);
            queryClient.invalidateQueries({ queryKey: ['public-profile-parallax'] });
            toast({ title: `Speed set to "${speed}"` });
          }
        }}
      />

      <HoverEffectSelector
        selected={hoverEffect}
        onSelect={async (preset: AnimationPreset) => {
          setHoverEffect(preset.id);
          if (profileId) {
            await supabase.from('profile').update({ parallax_hover_effect: preset.id }).eq('id', profileId);
            queryClient.invalidateQueries({ queryKey: ['public-profile-parallax'] });
            toast({ title: `Hover effect: "${preset.name}"` });
          }
        }}
      />

      <ScrollEffectSelector
        selected={scrollEffect}
        onSelect={async (preset: AnimationPreset) => {
          setScrollEffect(preset.id);
          if (profileId) {
            await supabase.from('profile').update({ parallax_scroll_effect: preset.id }).eq('id', profileId);
            queryClient.invalidateQueries({ queryKey: ['public-profile-parallax'] });
            toast({ title: `Scroll effect: "${preset.name}"` });
          }
        }}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Active Icons ({items.filter(i => i.is_active).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No icons configured. Add some to get started.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map(item => (
                    <SortableIconRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onColorChange={handleColorChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Parallax Icon</DialogTitle>
            <DialogDescription>Choose an icon and glow color for the hero background</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker value={newIconName} onChange={setNewIconName} />
            </div>
            <div className="space-y-2">
              <Label>Glow Color (Dark Mode)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={newGlowColor}
                  onChange={(e) => setNewGlowColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={newGlowColor}
                  onChange={(e) => setNewGlowColor(e.target.value)}
                  placeholder="#41c0c2"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Icon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParallaxIconsManager;
