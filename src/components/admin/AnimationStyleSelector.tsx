import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: 'gentle-float',
    name: 'Gentle Float',
    description: 'Slow, calm drifting — healing & serene',
    icon: '🌊',
  },
  {
    id: 'breathing-glow',
    name: 'Breathing Glow',
    description: 'Soft pulse with expanding glow aura',
    icon: '💫',
  },
  {
    id: 'orbital-drift',
    name: 'Orbital Drift',
    description: 'Smooth circular paths — flowing motion',
    icon: '🪐',
  },
  {
    id: 'rising-bubbles',
    name: 'Rising Bubbles',
    description: 'Gentle upward float with subtle sway',
    icon: '🫧',
  },
  {
    id: 'wave-motion',
    name: 'Wave Motion',
    description: 'Synchronized sine-wave rhythm',
    icon: '〰️',
  },
  {
    id: 'firefly-twinkle',
    name: 'Firefly Twinkle',
    description: 'Slow drift with fade-in/out sparkle',
    icon: '✨',
  },
];

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
          Parallax Animation Style
        </CardTitle>
        <CardDescription>Choose how the floating header icons animate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ANIMATION_PRESETS.map((preset) => (
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
      </CardContent>
    </Card>
  );
}
