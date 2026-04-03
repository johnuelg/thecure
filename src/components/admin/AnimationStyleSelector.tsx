import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, MousePointer, ScrollText, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SpeedOption = 'slow' | 'medium' | 'fast';

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ANIMATION_PRESETS: AnimationPreset[] = [
  { id: 'none', name: 'None', description: 'Fully static — no floating animation', icon: '🚫' },
  { id: 'gentle-float', name: 'Gentle Float', description: 'Slow, calm drifting — healing & serene', icon: '🌊' },
  { id: 'breathing-glow', name: 'Breathing Glow', description: 'Soft pulse with expanding glow aura', icon: '💫' },
  { id: 'orbital-drift', name: 'Orbital Drift', description: 'Smooth circular paths — flowing motion', icon: '🪐' },
  { id: 'rising-bubbles', name: 'Rising Bubbles', description: 'Gentle upward float with subtle sway', icon: '🫧' },
  { id: 'wave-motion', name: 'Wave Motion', description: 'Synchronized sine-wave rhythm', icon: '〰️' },
  { id: 'firefly-twinkle', name: 'Firefly Twinkle', description: 'Slow drift with fade-in/out sparkle', icon: '✨' },
];

export const HOVER_EFFECT_PRESETS: AnimationPreset[] = [
  { id: 'none', name: 'None', description: 'No hover effects — completely static on hover', icon: '🚫' },
  { id: 'soft-glow', name: 'Soft Glow', description: 'Gentle glow expansion on hover', icon: '🌟' },
  { id: 'scale-up', name: 'Scale Up', description: 'Subtle size increase with glow', icon: '🔍' },
  { id: 'color-shift', name: 'Color Shift', description: 'Brighten and shift color warmth', icon: '🎨' },
  { id: 'pulse-ring', name: 'Pulse Ring', description: 'Radiating ring pulse outward', icon: '💠' },
  { id: 'frost-glow', name: 'Frost Glow', description: 'Cool white-blue frost aura', icon: '❄️' },
];

export const SCROLL_EFFECT_PRESETS: AnimationPreset[] = [
  { id: 'none', name: 'None', description: 'Icons stay fixed — no scroll reaction', icon: '🚫' },
  { id: 'parallax-shift', name: 'Parallax Shift', description: 'Depth-based mouse-following movement', icon: '🖱️' },
  { id: 'scatter', name: 'Scatter Away', description: 'Icons gently drift away from cursor', icon: '💨' },
  { id: 'magnetic', name: 'Magnetic Pull', description: 'Icons subtly attracted toward cursor', icon: '🧲' },
  { id: 'wave-ripple', name: 'Wave Ripple', description: 'Cursor creates ripple displacement', icon: '🌀' },
];

interface PresetGridProps {
  presets: AnimationPreset[];
  selected: string;
  onSelect: (preset: AnimationPreset) => void;
}

function PresetGrid({ presets, selected, onSelect }: PresetGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset)}
          className={cn(
            "relative text-left rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02]",
            selected === preset.id
              ? "border-primary ring-2 ring-primary/30 shadow-lg bg-primary/5"
              : "border-border hover:border-primary/50 bg-card"
          )}
        >
          {selected === preset.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
          <span className="text-2xl mb-2 block">{preset.icon}</span>
          <p className="text-sm font-semibold">{preset.name}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{preset.description}</p>
        </button>
      ))}
    </div>
  );
}

interface AnimationStyleSelectorProps {
  selected: string;
  onSelect: (preset: AnimationPreset) => void;
}

export function AnimationStyleSelector({ selected, onSelect }: AnimationStyleSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Float Animation Style
        </CardTitle>
        <CardDescription>Choose the base floating movement pattern</CardDescription>
      </CardHeader>
      <CardContent>
        <PresetGrid presets={ANIMATION_PRESETS} selected={selected} onSelect={onSelect} />
      </CardContent>
    </Card>
  );
}

interface HoverEffectSelectorProps {
  selected: string;
  onSelect: (preset: AnimationPreset) => void;
}

export function HoverEffectSelector({ selected, onSelect }: HoverEffectSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MousePointer className="h-5 w-5" />
          Hover Effect
        </CardTitle>
        <CardDescription>What happens when hovering over an icon</CardDescription>
      </CardHeader>
      <CardContent>
        <PresetGrid presets={HOVER_EFFECT_PRESETS} selected={selected} onSelect={onSelect} />
      </CardContent>
    </Card>
  );
}

interface ScrollEffectSelectorProps {
  selected: string;
  onSelect: (preset: AnimationPreset) => void;
}

export function ScrollEffectSelector({ selected, onSelect }: ScrollEffectSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Mouse / Scroll Interaction
        </CardTitle>
        <CardDescription>How icons react to mouse movement across the header</CardDescription>
      </CardHeader>
      <CardContent>
        <PresetGrid presets={SCROLL_EFFECT_PRESETS} selected={selected} onSelect={onSelect} />
      </CardContent>
    </Card>
  );
}

const SPEED_OPTIONS: { id: SpeedOption; label: string; icon: string; description: string }[] = [
  { id: 'slow', label: 'Slow', icon: '🐢', description: 'Calm & meditative — 30-45s cycles' },
  { id: 'medium', label: 'Medium', icon: '🚶', description: 'Balanced rhythm — 15-25s cycles' },
  { id: 'fast', label: 'Fast', icon: '⚡', description: 'Energetic motion — 8-15s cycles' },
];

interface SpeedSelectorProps {
  selected: SpeedOption;
  onSelect: (speed: SpeedOption) => void;
}

export function SpeedSelector({ selected, onSelect }: SpeedSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Animation Speed
        </CardTitle>
        <CardDescription>Control how fast the floating icons move</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={cn(
                "relative text-center rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02]",
                selected === opt.id
                  ? "border-primary ring-2 ring-primary/30 shadow-lg bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card"
              )}
            >
              {selected === opt.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <span className="text-2xl mb-2 block">{opt.icon}</span>
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{opt.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
