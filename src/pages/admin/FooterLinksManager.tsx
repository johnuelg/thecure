import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const groupOptions = ['Navigation', 'Resources'];

interface FooterLink {
  id: string;
  group_name: string;
  label: string;
  href: string;
  display_order: number;
  is_active: boolean;
}

const FooterLinksManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    group_name: 'Navigation',
    label: '',
    href: '',
    is_active: true,
  });

  const { data: links, isLoading } = useQuery({
    queryKey: ['admin-footer-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('group_name', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as FooterLink[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<FooterLink, 'id' | 'display_order'>) => {
      const maxOrder = links?.length ? Math.max(...links.map(l => l.display_order)) : 0;
      const { error } = await supabase
        .from('footer_links')
        .insert({ ...data, display_order: maxOrder + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-footer-links'] });
      queryClient.invalidateQueries({ queryKey: ['public-footer-links'] });
      toast({ title: 'Link created' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FooterLink> & { id: string }) => {
      const { error } = await supabase
        .from('footer_links')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-footer-links'] });
      queryClient.invalidateQueries({ queryKey: ['public-footer-links'] });
      toast({ title: 'Link updated' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-footer-links'] });
      queryClient.invalidateQueries({ queryKey: ['public-footer-links'] });
      toast({ title: 'Link deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ group_name: 'Navigation', label: '', href: '', is_active: true });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (link: FooterLink) => {
    setFormData({
      group_name: link.group_name,
      label: link.label,
      href: link.href,
      is_active: link.is_active,
    });
    setEditingId(link.id);
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

  // Group links by group_name
  const groupedLinks = links?.reduce((acc, link) => {
    if (!acc[link.group_name]) {
      acc[link.group_name] = [];
    }
    acc[link.group_name].push(link);
    return acc;
  }, {} as Record<string, FooterLink[]>) || {};

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
            <Link2 className="h-6 w-6" />
            Footer Links
          </h1>
          <p className="text-muted-foreground">
            Manage the navigation links shown in the website footer.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Link' : 'Add Link'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group_name">Group</Label>
                <Select
                  value={formData.group_name}
                  onValueChange={(value) => setFormData({ ...formData, group_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="About"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="href">Link (href)</Label>
                <Input
                  id="href"
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  placeholder="#about or https://..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use #section-id for internal sections or full URLs for external links.
                </p>
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

      {Object.keys(groupedLinks).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No footer links yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedLinks).map(([groupName, groupLinks]) => (
          <div key={groupName} className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {groupName}
            </h3>
            <div className="grid gap-2">
              {groupLinks.map((link) => (
                <Card key={link.id} className={!link.is_active ? 'opacity-60' : ''}>
                  <CardContent className="flex items-center gap-4 py-3 px-4">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{link.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">→ {link.href}</span>
                    </div>
                    
                    <Switch
                      checked={link.is_active}
                      onCheckedChange={(checked) => handleToggleActive(link.id, checked)}
                    />
                    
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                      Edit
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FooterLinksManager;