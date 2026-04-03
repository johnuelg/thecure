import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientPreset {
  name: string;
  from: string; // HSL values
  to: string;
  fromHex: string; // For preview
  toHex: string;
}

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Healthcare Blue → Teal',
    from: '210 70% 45%',
    to: '175 60% 40%',
    fromHex: '#2266b3',
    toHex: '#29a399',
  },
  {
    name: 'Ocean Blue → Cyan',
    from: '220 75% 50%',
    to: '190 80% 45%',
    fromHex: '#2060d0',
    toHex: '#1798b3',
  },
  {
    name: 'Indigo → Purple',
    from: '240 60% 55%',
    to: '280 55% 50%',
    fromHex: '#5050cc',
    toHex: '#8840b8',
  },
  {
    name: 'Teal → Emerald',
    from: '175 60% 40%',
    to: '155 55% 42%',
    fromHex: '#29a399',
    toHex: '#30a068',
  },
  {
    name: 'Blue → Rose',
    from: '215 70% 50%',
    to: '340 65% 55%',
    fromHex: '#2668cc',
    toHex: '#cc4477',
  },
  {
    name: 'Sapphire → Violet',
    from: '225 70% 48%',
    to: '270 60% 55%',
    fromHex: '#2450c0',
    toHex: '#7744cc',
  },
  {
    name: 'Amber → Orange',
    from: '38 90% 50%',
    to: '18 85% 52%',
    fromHex: '#f0a010',
    toHex: '#e06020',
  },
  {
    name: 'Emerald → Lime',
    from: '160 60% 40%',
    to: '90 55% 45%',
    fromHex: '#29a370',
    toHex: '#68a340',
  },
  {
    name: 'Rose → Pink',
    from: '340 70% 50%',
    to: '320 60% 55%',
    fromHex: '#d93068',
    toHex: '#c050a0',
  },
  {
    name: 'Slate → Steel',
    from: '215 30% 40%',
    to: '200 25% 50%',
    fromHex: '#475873',
    toHex: '#607890',
  },
  {
    name: 'Coral → Peach',
    from: '10 75% 55%',
    to: '25 80% 60%',
    fromHex: '#e05040',
    toHex: '#e88040',
  },
  {
    name: 'Royal → Gold',
    from: '250 65% 50%',
    to: '45 85% 50%',
    fromHex: '#5030cc',
    toHex: '#d4a010',
  },
];

const ThemeManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState('210 70% 45%');
  const [selectedTo, setSelectedTo] = useState('175 60% 40%');
  const [profileId, setProfileId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('id, gradient_color_from, gradient_color_to')
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setProfileId(data.id);
          setSelectedFrom((data as any).gradient_color_from || '210 70% 45%');
          setSelectedTo((data as any).gradient_color_to || '175 60% 40%');
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSelectPreset = (preset: GradientPreset) => {
    setSelectedFrom(preset.from);
    setSelectedTo(preset.to);
    // Live preview
    document.documentElement.style.setProperty('--healthcare-blue', preset.from);
    document.documentElement.style.setProperty('--healthcare-teal', preset.to);
  };

  const handleSave = async () => {
    if (!profileId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profile')
        .update({
          gradient_color_from: selectedFrom,
          gradient_color_to: selectedTo,
        })
        .eq('id', profileId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['public-profile-gradient'] });
      toast({ title: 'Theme gradient saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isSelected = (preset: GradientPreset) =>
    preset.from === selectedFrom && preset.to === selectedTo;

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
          <h1 className="text-2xl font-bold">Theme Gradient</h1>
          <p className="text-muted-foreground">Customize the gradient colors used across your site</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Theme
        </Button>
      </div>

      {/* Current Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Current Gradient Preview
          </CardTitle>
          <CardDescription>This gradient is applied to buttons, text highlights, and decorative elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="h-24 rounded-xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, hsl(${selectedFrom}) 0%, hsl(${selectedTo}) 100%)`,
            }}
          />
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-border"
                style={{ background: `hsl(${selectedFrom})` }}
              />
              <span className="text-sm text-muted-foreground">From: {selectedFrom}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-border"
                style={{ background: `hsl(${selectedTo})` }}
              />
              <span className="text-sm text-muted-foreground">To: {selectedTo}</span>
            </div>
          </div>
          {/* Text preview */}
          <div className="pt-2">
            <p
              className="text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, hsl(${selectedFrom}) 0%, hsl(${selectedTo}) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Gradient Text Preview
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preset Gradients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gradient Presets</CardTitle>
          <CardDescription>Select a preset gradient theme for your website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                className={cn(
                  "relative group rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                  isSelected(preset)
                    ? "border-primary ring-2 ring-primary/30 shadow-lg"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div
                  className="h-20"
                  style={{
                    background: `linear-gradient(135deg, hsl(${preset.from}) 0%, hsl(${preset.to}) 100%)`,
                  }}
                />
                {isSelected(preset) && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div className="p-2 bg-card">
                  <p className="text-xs font-medium text-center truncate">{preset.name}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Color Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Colors</CardTitle>
          <CardDescription>Enter custom HSL values (e.g., "210 70% 45%")</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gradient Start (HSL)</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shrink-0"
                  style={{ background: `hsl(${selectedFrom})` }}
                />
                <input
                  type="text"
                  value={selectedFrom}
                  onChange={(e) => {
                    setSelectedFrom(e.target.value);
                    document.documentElement.style.setProperty('--healthcare-blue', e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder="210 70% 45%"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gradient End (HSL)</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shrink-0"
                  style={{ background: `hsl(${selectedTo})` }}
                />
                <input
                  type="text"
                  value={selectedTo}
                  onChange={(e) => {
                    setSelectedTo(e.target.value);
                    document.documentElement.style.setProperty('--healthcare-teal', e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder="175 60% 40%"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeManager;
