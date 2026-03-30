import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, BarChart3, Image, Link2, Eye, EyeOff } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type VisualizationType = 'image' | 'gif' | 'chart' | 'embed';
type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface DataVisualization {
  id: string;
  title: string;
  description: string | null;
  visualization_type: VisualizationType;
  chart_type: ChartType | null;
  chart_data: Record<string, unknown>[] | null;
  media_url: string | null;
  chart_config: Record<string, unknown> | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  description: string;
  visualization_type: VisualizationType;
  chart_type: ChartType | null;
  chart_data: string;
  media_url: string;
  chart_config: string;
  is_active: boolean;
  display_order: number;
}

const defaultFormData: FormData = {
  title: '',
  description: '',
  visualization_type: 'image',
  chart_type: null,
  chart_data: '[]',
  media_url: '',
  chart_config: '{}',
  is_active: true,
  display_order: 0,
};

const COLORS = [
  'hsl(210, 70%, 45%)',
  'hsl(175, 60%, 40%)',
  'hsl(210, 60%, 60%)',
  'hsl(175, 50%, 55%)',
  'hsl(220, 50%, 50%)',
];

function ChartPreview({ chartType, chartData, chartConfig }: { 
  chartType: ChartType | null; 
  chartData: Record<string, unknown>[]; 
  chartConfig: Record<string, unknown>;
}) {
  if (!chartType || !chartData || chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
        No chart data to preview
      </div>
    );
  }

  const xAxisKey = (chartConfig?.xAxisKey as string) || Object.keys(chartData[0])[0];

  return (
    <ResponsiveContainer width="100%" height={200}>
      {chartType === 'line' ? (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <Tooltip />
          <Legend />
          {Object.keys(chartData[0]).filter(k => k !== xAxisKey).map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
          ))}
        </LineChart>
      ) : chartType === 'bar' ? (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <Tooltip />
          <Legend />
          {Object.keys(chartData[0]).filter(k => k !== xAxisKey).map((key, i) => (
            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      ) : chartType === 'area' ? (
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <Tooltip />
          <Legend />
          {Object.keys(chartData[0]).filter(k => k !== xAxisKey).map((key, i) => (
            <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={`${COLORS[i % COLORS.length]}40`} />
          ))}
        </AreaChart>
      ) : chartType === 'pie' ? (
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      ) : null}
    </ResponsiveContainer>
  );
}

export default function VisualizationsManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisualization, setEditingVisualization] = useState<DataVisualization | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visualizationToDelete, setVisualizationToDelete] = useState<DataVisualization | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: visualizations, isLoading } = useQuery({
    queryKey: ['data-visualizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_visualizations')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as DataVisualization[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string | null;
      visualization_type: string;
      chart_type: string | null;
      chart_data: unknown[] | null;
      media_url: string | null;
      chart_config: Record<string, unknown> | null;
      is_active: boolean;
      display_order: number;
    }) => {
      const insertData = {
          title: data.title,
          description: data.description,
          visualization_type: data.visualization_type,
          chart_type: data.chart_type,
          chart_data: data.chart_data,
          media_url: data.media_url,
          chart_config: data.chart_config,
          is_active: data.is_active,
          display_order: data.display_order,
        };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from('data_visualizations')
        .insert([insertData] as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-visualizations'] });
      toast({ title: 'Success', description: 'Visualization created successfully' });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      title?: string;
      description?: string | null;
      visualization_type?: string;
      chart_type?: string | null;
      chart_data?: unknown[] | null;
      media_url?: string | null;
      chart_config?: Record<string, unknown> | null;
      is_active?: boolean;
      display_order?: number;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.visualization_type !== undefined) updateData.visualization_type = data.visualization_type;
      if (data.chart_type !== undefined) updateData.chart_type = data.chart_type;
      if (data.chart_data !== undefined) updateData.chart_data = data.chart_data;
      if (data.media_url !== undefined) updateData.media_url = data.media_url;
      if (data.chart_config !== undefined) updateData.chart_config = data.chart_config;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.display_order !== undefined) updateData.display_order = data.display_order;

      const { error } = await supabase
        .from('data_visualizations')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-visualizations'] });
      toast({ title: 'Success', description: 'Visualization updated successfully' });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('data_visualizations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-visualizations'] });
      toast({ title: 'Success', description: 'Visualization deleted successfully' });
      setDeleteDialogOpen(false);
      setVisualizationToDelete(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVisualization(null);
    setFormData(defaultFormData);
  };

  const handleEdit = (visualization: DataVisualization) => {
    setEditingVisualization(visualization);
    setFormData({
      title: visualization.title,
      description: visualization.description || '',
      visualization_type: visualization.visualization_type,
      chart_type: visualization.chart_type,
      chart_data: visualization.chart_data ? JSON.stringify(visualization.chart_data, null, 2) : '[]',
      media_url: visualization.media_url || '',
      chart_config: visualization.chart_config ? JSON.stringify(visualization.chart_config, null, 2) : '{}',
      is_active: visualization.is_active,
      display_order: visualization.display_order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedChartData = null;
    let parsedChartConfig = null;

    if (formData.visualization_type === 'chart') {
      try {
        parsedChartData = JSON.parse(formData.chart_data);
        parsedChartConfig = JSON.parse(formData.chart_config);
      } catch {
        toast({ title: 'Error', description: 'Invalid JSON in chart data or config', variant: 'destructive' });
        return;
      }
    }

    const payload = {
      title: formData.title,
      description: formData.description || null,
      visualization_type: formData.visualization_type,
      chart_type: formData.visualization_type === 'chart' ? formData.chart_type : null,
      chart_data: parsedChartData,
      media_url: formData.visualization_type !== 'chart' ? formData.media_url || null : null,
      chart_config: parsedChartConfig,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    if (editingVisualization) {
      updateMutation.mutate({ id: editingVisualization.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getVisualizationIcon = (type: VisualizationType) => {
    switch (type) {
      case 'chart':
        return <BarChart3 className="h-5 w-5" />;
      case 'embed':
        return <Link2 className="h-5 w-5" />;
      default:
        return <Image className="h-5 w-5" />;
    }
  };

  const renderPreview = () => {
    if (formData.visualization_type === 'chart') {
      try {
        const chartData = JSON.parse(formData.chart_data);
        const chartConfig = JSON.parse(formData.chart_config);
        return <ChartPreview chartType={formData.chart_type} chartData={chartData} chartConfig={chartConfig} />;
      } catch {
        return (
          <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
            Invalid JSON format
          </div>
        );
      }
    }
    
    if (formData.media_url) {
      return (
        <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
          <img 
            src={formData.media_url} 
            alt="Preview" 
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }

    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
        No preview available
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Visualizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your healthcare data analytics showcase
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(defaultFormData)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Visualization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVisualization ? 'Edit Visualization' : 'Add New Visualization'}
              </DialogTitle>
              <DialogDescription>
                Create a visualization using images, GIFs, dynamic charts, or embedded content.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="e.g., Patient Recovery Rates"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief explanation of the visualization"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visualization_type">Type *</Label>
                  <Select
                    value={formData.visualization_type}
                    onValueChange={(value: VisualizationType) => setFormData(prev => ({ 
                      ...prev, 
                      visualization_type: value,
                      chart_type: value === 'chart' ? 'line' : null,
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="gif">Animated GIF</SelectItem>
                      <SelectItem value="chart">Interactive Chart</SelectItem>
                      <SelectItem value="embed">Embed URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.visualization_type === 'chart' && (
                  <div className="space-y-2">
                    <Label htmlFor="chart_type">Chart Type *</Label>
                    <Select
                      value={formData.chart_type || 'line'}
                      onValueChange={(value: ChartType) => setFormData(prev => ({ ...prev, chart_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {formData.visualization_type === 'chart' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="chart_data">Chart Data (JSON Array) *</Label>
                    <Textarea
                      id="chart_data"
                      value={formData.chart_data}
                      onChange={(e) => setFormData(prev => ({ ...prev, chart_data: e.target.value }))}
                      placeholder='[{"month": "Jan", "value": 100}, {"month": "Feb", "value": 120}]'
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chart_config">Chart Config (JSON) - Optional</Label>
                    <Textarea
                      id="chart_config"
                      value={formData.chart_config}
                      onChange={(e) => setFormData(prev => ({ ...prev, chart_config: e.target.value }))}
                      placeholder='{"xAxisKey": "month"}'
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                </>
              ) : formData.visualization_type === 'embed' ? (
                <div className="space-y-2">
                  <Label htmlFor="media_url">Embed URL *</Label>
                  <Input
                    id="media_url"
                    value={formData.media_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                    placeholder="https://observablehq.com/embed/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the embed URL from Observable, CodePen, Tableau, etc.
                  </p>
                </div>
              ) : (
                <ImageUpload
                  label={formData.visualization_type === 'gif' ? 'Animated GIF' : 'Image'}
                  value={formData.media_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, media_url: url }))}
                  bucket="portfolio-images"
                  accept={formData.visualization_type === 'gif' ? 'image/gif' : 'image/*'}
                />
              )}

              <div className="space-y-2">
                <Label>Preview</Label>
                {renderPreview()}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Show on public site
                </Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingVisualization ? 'Save Changes' : 'Create Visualization'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : visualizations?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No visualizations yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Start building your data analytics showcase by adding visualizations.
              You can upload GIFs, create interactive charts, or embed external content.
            </p>
            <Button onClick={() => { setFormData(defaultFormData); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Visualization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualizations?.map((viz) => (
            <Card key={viz.id} className={!viz.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getVisualizationIcon(viz.visualization_type)}
                    <div>
                      <CardTitle className="text-base">{viz.title}</CardTitle>
                      <CardDescription className="text-xs capitalize">
                        {viz.visualization_type === 'chart' 
                          ? `${viz.chart_type} chart` 
                          : viz.visualization_type}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {viz.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-32 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
                  {viz.visualization_type === 'chart' && viz.chart_data ? (
                    <ChartPreview 
                      chartType={viz.chart_type} 
                      chartData={viz.chart_data as Record<string, unknown>[]} 
                      chartConfig={viz.chart_config as Record<string, unknown> || {}} 
                    />
                  ) : viz.media_url ? (
                    <img 
                      src={viz.media_url} 
                      alt={viz.title}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No preview</span>
                  )}
                </div>
                {viz.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {viz.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(viz)}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => { setVisualizationToDelete(viz); setDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visualization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{visualizationToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => visualizationToDelete && deleteMutation.mutate(visualizationToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
