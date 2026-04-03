import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Palette, Check, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FontSelector, HEALTHCARE_FONT_PAIRS, type FontPair } from '@/components/admin/FontSelector';

interface GradientPreset {
  name: string;
  from: string;
  to: string;
}

const GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Healthcare Blue → Teal', from: '210 70% 45%', to: '175 60% 40%' },
  { name: 'Ocean Blue → Cyan', from: '220 75% 50%', to: '190 80% 45%' },
  { name: 'Indigo → Purple', from: '240 60% 55%', to: '280 55% 50%' },
  { name: 'Teal → Emerald', from: '175 60% 40%', to: '155 55% 42%' },
  { name: 'Blue → Rose', from: '215 70% 50%', to: '340 65% 55%' },
  { name: 'Sapphire → Violet', from: '225 70% 48%', to: '270 60% 55%' },
  { name: 'Amber → Orange', from: '38 90% 50%', to: '18 85% 52%' },
  { name: 'Emerald → Lime', from: '160 60% 40%', to: '90 55% 45%' },
  { name: 'Rose → Pink', from: '340 70% 50%', to: '320 60% 55%' },
  { name: 'Slate → Steel', from: '215 30% 40%', to: '200 25% 50%' },
  { name: 'Coral → Peach', from: '10 75% 55%', to: '25 80% 60%' },
  { name: 'Royal → Gold', from: '250 65% 50%', to: '45 85% 50%' },
];

const DARK_GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Healthcare Blue → Teal', from: '210 65% 55%', to: '175 55% 45%' },
  { name: 'Bright Ocean → Cyan', from: '220 70% 60%', to: '190 75% 55%' },
  { name: 'Vivid Indigo → Purple', from: '240 55% 65%', to: '280 50% 60%' },
  { name: 'Bright Teal → Emerald', from: '175 55% 50%', to: '155 50% 52%' },
  { name: 'Electric Blue → Rose', from: '215 65% 60%', to: '340 60% 62%' },
  { name: 'Neon Sapphire → Violet', from: '225 65% 58%', to: '270 55% 62%' },
  { name: 'Warm Amber → Orange', from: '38 85% 55%', to: '18 80% 58%' },
  { name: 'Glow Emerald → Lime', from: '160 55% 50%', to: '90 50% 55%' },
  { name: 'Hot Rose → Pink', from: '340 65% 58%', to: '320 55% 62%' },
  { name: 'Cool Slate → Steel', from: '215 25% 50%', to: '200 20% 58%' },
  { name: 'Neon Coral → Peach', from: '10 70% 62%', to: '25 75% 65%' },
  { name: 'Royal → Gold', from: '250 60% 58%', to: '45 80% 55%' },
];

function GradientPickerPanel({
  presets,
  selectedFrom,
  selectedTo,
  onSelectPreset,
  onFromChange,
  onToChange,
  modeLabel,
  bgClass,
}: {
  presets: GradientPreset[];
  selectedFrom: string;
  selectedTo: string;
  onSelectPreset: (preset: GradientPreset) => void;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  modeLabel: string;
  bgClass: string;
}) {
  const isSelected = (preset: GradientPreset) =>
    preset.from === selectedFrom && preset.to === selectedTo;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{modeLabel} Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("rounded-xl p-6", bgClass)}>
            <div
              className="h-16 rounded-lg shadow-lg mb-3"
              style={{ background: `linear-gradient(135deg, hsl(${selectedFrom}) 0%, hsl(${selectedTo}) 100%)` }}
            />
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
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-border" style={{ background: `hsl(${selectedFrom})` }} />
              <span className="text-xs text-muted-foreground">From: {selectedFrom}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-border" style={{ background: `hsl(${selectedTo})` }} />
              <span className="text-xs text-muted-foreground">To: {selectedTo}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Presets</CardTitle>
          <CardDescription>Select a gradient optimized for {modeLabel.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onSelectPreset(preset)}
                className={cn(
                  "relative group rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                  isSelected(preset)
                    ? "border-primary ring-2 ring-primary/30 shadow-lg"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div
                  className={cn("h-16", bgClass)}
                  style={{
                    background: `linear-gradient(135deg, hsl(${preset.from}) 0%, hsl(${preset.to}) 100%)`,
                  }}
                />
                {isSelected(preset) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className="p-2 bg-card">
                  <p className="text-[11px] font-medium text-center truncate">{preset.name}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Custom Colors</CardTitle>
          <CardDescription>Enter HSL values (e.g., "210 70% 45%")</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gradient Start</Label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border-2 border-border shrink-0" style={{ background: `hsl(${selectedFrom})` }} />
                <input
                  type="text"
                  value={selectedFrom}
                  onChange={(e) => onFromChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="210 70% 45%"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gradient End</Label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border-2 border-border shrink-0" style={{ background: `hsl(${selectedTo})` }} />
                <input
                  type="text"
                  value={selectedTo}
                  onChange={(e) => onToChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="175 60% 40%"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ThemeManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Light mode
  const [lightFrom, setLightFrom] = useState('210 70% 45%');
  const [lightTo, setLightTo] = useState('175 60% 40%');
  // Dark mode
  const [darkFrom, setDarkFrom] = useState('210 65% 55%');
  const [darkTo, setDarkTo] = useState('175 55% 45%');
  // Fonts
  const [fontHeading, setFontHeading] = useState('Plus Jakarta Sans');
  const [fontBody, setFontBody] = useState('DM Sans');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('id, gradient_color_from, gradient_color_to, gradient_dark_from, gradient_dark_to')
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setProfileId(data.id);
          setLightFrom((data as any).gradient_color_from || '210 70% 45%');
          setLightTo((data as any).gradient_color_to || '175 60% 40%');
          setDarkFrom((data as any).gradient_dark_from || '210 65% 55%');
          setDarkTo((data as any).gradient_dark_to || '175 55% 45%');
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const applyLivePreview = (from: string, to: string) => {
    document.documentElement.style.setProperty('--healthcare-blue', from);
    document.documentElement.style.setProperty('--healthcare-teal', to);
  };

  const handleSave = async () => {
    if (!profileId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profile')
        .update({
          gradient_color_from: lightFrom,
          gradient_color_to: lightTo,
          gradient_dark_from: darkFrom,
          gradient_dark_to: darkTo,
        })
        .eq('id', profileId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['public-profile-gradient'] });
      toast({ title: 'Theme gradients saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
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
          <h1 className="text-2xl font-bold">Theme Gradient</h1>
          <p className="text-muted-foreground">Customize gradient colors for light and dark modes separately</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Theme
        </Button>
      </div>

      <Tabs defaultValue="light" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="light" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Light Mode
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Dark Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="light" className="mt-6">
          <GradientPickerPanel
            presets={GRADIENT_PRESETS}
            selectedFrom={lightFrom}
            selectedTo={lightTo}
            onSelectPreset={(p) => { setLightFrom(p.from); setLightTo(p.to); applyLivePreview(p.from, p.to); }}
            onFromChange={(v) => { setLightFrom(v); applyLivePreview(v, lightTo); }}
            onToChange={(v) => { setLightTo(v); applyLivePreview(lightFrom, v); }}
            modeLabel="Light Mode"
            bgClass="bg-[hsl(210,20%,98%)]"
          />
        </TabsContent>

        <TabsContent value="dark" className="mt-6">
          <GradientPickerPanel
            presets={DARK_GRADIENT_PRESETS}
            selectedFrom={darkFrom}
            selectedTo={darkTo}
            onSelectPreset={(p) => { setDarkFrom(p.from); setDarkTo(p.to); applyLivePreview(p.from, p.to); }}
            onFromChange={(v) => { setDarkFrom(v); applyLivePreview(v, darkTo); }}
            onToChange={(v) => { setDarkTo(v); applyLivePreview(darkFrom, v); }}
            modeLabel="Dark Mode"
            bgClass="bg-[hsl(215,30%,8%)]"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThemeManager;
