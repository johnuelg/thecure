import { useState, useMemo } from "react";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

const POPULAR_ICONS = [
  "Brain", "Activity", "TrendingUp", "LayoutDashboard", "Bot", "Heart",
  "Award", "BarChart3", "Users", "Shield", "Zap", "Target",
  "Stethoscope", "HeartPulse", "Pill", "Microscope", "Syringe", "Thermometer",
  "Clock", "CheckCircle", "Star", "Briefcase", "Code", "Database",
  "Globe", "Lightbulb", "Rocket", "Settings", "Sparkles", "Wrench",
];

const allIconNames = Object.keys(icons);

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return POPULAR_ICONS;
    return allIconNames.filter(name => name.toLowerCase().includes(query)).slice(0, 60);
  }, [search]);

  const SelectedIcon = (icons as Record<string, LucideIcon>)[value] || icons.Award;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4" />
            {value || "Select icon"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <ScrollArea className="h-56">
          <div className="grid grid-cols-5 gap-1">
            {filteredIcons.map((name) => {
              const Icon = (icons as Record<string, LucideIcon>)[name];
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                  title={name}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs transition-colors hover:bg-accent ${
                    value === name ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate w-full text-center text-[10px]">{name}</span>
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">No icons found</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
