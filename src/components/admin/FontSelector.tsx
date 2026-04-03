import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FontPair {
  name: string;
  heading: string;
  body: string;
  description: string;
}

export const HEALTHCARE_FONT_PAIRS: FontPair[] = [
  {
    name: 'Jakarta + DM Sans',
    heading: 'Plus Jakarta Sans',
    body: 'DM Sans',
    description: 'Modern geometric — clean & approachable',
  },
  {
    name: 'Inter + Source Sans',
    heading: 'Inter',
    body: 'Source Sans 3',
    description: 'Neutral precision — clinical dashboards',
  },
  {
    name: 'Outfit + Nunito Sans',
    heading: 'Outfit',
    body: 'Nunito Sans',
    description: 'Rounded warmth — patient-facing portals',
  },
  {
    name: 'Lexend + Atkinson',
    heading: 'Lexend',
    body: 'Atkinson Hyperlegible',
    description: 'Maximum readability — accessibility-first',
  },
  {
    name: 'Manrope + IBM Plex Sans',
    heading: 'Manrope',
    body: 'IBM Plex Sans',
    description: 'Technical authority — enterprise health IT',
  },
  {
    name: 'Sora + Work Sans',
    heading: 'Sora',
    body: 'Work Sans',
    description: 'Crisp futuristic — digital health innovation',
  },
];

interface FontSelectorProps {
  selectedHeading: string;
  selectedBody: string;
  onSelect: (pair: FontPair) => void;
}

export function FontSelector({ selectedHeading, selectedBody, onSelect }: FontSelectorProps) {
  const isSelected = (pair: FontPair) =>
    pair.heading === selectedHeading && pair.body === selectedBody;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-5 w-5" />
          Font Style
        </CardTitle>
        <CardDescription>Choose a healthcare-friendly font pairing for headings and body text</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEALTHCARE_FONT_PAIRS.map((pair) => (
            <button
              key={pair.name}
              onClick={() => onSelect(pair)}
              className={cn(
                "relative text-left rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02]",
                isSelected(pair)
                  ? "border-primary ring-2 ring-primary/30 shadow-lg bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card"
              )}
            >
              {isSelected(pair) && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <p
                className="text-lg font-bold mb-1"
                style={{ fontFamily: `"${pair.heading}", system-ui, sans-serif` }}
              >
                {pair.heading}
              </p>
              <p
                className="text-sm text-muted-foreground mb-3"
                style={{ fontFamily: `"${pair.body}", system-ui, sans-serif` }}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/70">
                  {pair.name}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{pair.description}</p>
            </button>
          ))}
        </div>

        {/* Current selection summary */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Heading Font</Label>
              <p className="text-sm font-medium" style={{ fontFamily: `"${selectedHeading}", system-ui, sans-serif` }}>
                {selectedHeading}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Body Font</Label>
              <p className="text-sm font-medium" style={{ fontFamily: `"${selectedBody}", system-ui, sans-serif` }}>
                {selectedBody}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
