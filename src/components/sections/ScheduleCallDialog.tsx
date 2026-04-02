import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, Clock, User, Mail, Send, CheckCircle, HeartPulse, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleCallDialog({ open, onOpenChange }: ScheduleCallDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [platform, setPlatform] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    preferredTime: "",
  });

  const { data: profile } = useQuery({
    queryKey: ["schedule-call-profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile")
        .select("zoom_meeting_url, teams_meeting_url")
        .maybeSingle();
      return data as { zoom_meeting_url: string | null; teams_meeting_url: string | null } | null;
    },
  });

  const hasZoom = !!profile?.zoom_meeting_url;
  const hasTeams = !!profile?.teams_meeting_url;
  const availablePlatforms = [
    ...(hasZoom ? [{ value: "zoom", label: "Zoom Meeting", icon: "📹" }] : []),
    ...(hasTeams ? [{ value: "teams", label: "Microsoft Teams", icon: "💻" }] : []),
  ];

  const getMeetingUrl = () => {
    if (platform === "zoom") return profile?.zoom_meeting_url;
    if (platform === "teams") return profile?.teams_meeting_url;
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !platform) return;

    setIsSubmitting(true);
    try {
      const meetingUrl = getMeetingUrl();
      const platformLabel = platform === "zoom" ? "Zoom" : "Microsoft Teams";
      const message = `📅 Call Scheduling Request\n\nPlatform: ${platformLabel}\nMeeting Link: ${meetingUrl || "Not configured"}\nPreferred Date: ${format(date, "PPPP")}\nPreferred Time: ${formData.preferredTime || "Not specified"}\nName: ${formData.name}\nEmail: ${formData.email}`;

      await supabase.from("contact_submissions").insert([
        {
          name: formData.name,
          email: formData.email,
          subject: `Call Scheduling Request (${platformLabel})`,
          message,
        },
      ]);

      // Non-blocking email notification
      supabase.functions.invoke("send-contact-notification", {
        body: {
          name: formData.name,
          email: formData.email,
          subject: `Call Scheduling Request (${platformLabel})`,
          message,
        },
      }).catch(console.error);

      setIsSuccess(true);
      toast({
        title: "Call scheduled!",
        description: "We'll confirm your appointment shortly.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSuccess(false);
      setDate(undefined);
      setPlatform("");
      setFormData({ name: "", email: "", preferredTime: "" });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-primary/20 bg-card">
        {/* Healthcare-styled header */}
        <div className="healthcare-gradient px-6 pt-6 pb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: `${20 + i * 12}px`,
                  height: `${20 + i * 12}px`,
                  top: `${10 + i * 15}%`,
                  left: `${5 + i * 18}%`,
                }}
              />
            ))}
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-primary-foreground text-lg font-display">
                  Schedule a Discovery Call
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 text-sm">
                  Pick your preferred platform, date and time
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2">You're All Set!</h3>
                <p className="text-muted-foreground text-sm mb-1">
                  {date && format(date, "PPPP")}
                  {formData.preferredTime && ` • ${formData.preferredTime}`}
                </p>
                <p className="text-muted-foreground text-sm mb-1">
                  Platform: {platform === "zoom" ? "Zoom" : "Microsoft Teams"}
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  A confirmation with the meeting link will be sent to your email shortly.
                </p>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Name & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-name" className="text-sm font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Full Name
                    </Label>
                    <Input
                      id="schedule-name"
                      name="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-border/60 focus-visible:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-email" className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="schedule-email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-border/60 focus-visible:ring-primary/30"
                    />
                  </div>
                </div>

                {/* Platform Selector */}
                {availablePlatforms.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-primary" />
                      Meeting Platform
                    </Label>
                    <Select value={platform} onValueChange={setPlatform} required>
                      <SelectTrigger className="border-border/60 focus:ring-primary/30">
                        <SelectValue placeholder="Choose a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlatforms.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <span className="flex items-center gap-2">
                              <span>{p.icon}</span>
                              <span>{p.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {availablePlatforms.length === 0 && (
                  <div className="rounded-lg border border-border/60 bg-muted/50 p-3 text-sm text-muted-foreground text-center">
                    No meeting platforms configured yet. Please contact the admin.
                  </div>
                )}

                {/* Date Picker */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    Preferred Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-border/60",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date() || d.getDay() === 0 || d.getDay() === 6}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Input */}
                <div className="space-y-2">
                  <Label htmlFor="schedule-time" className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Preferred Time
                  </Label>
                  <Input
                    id="schedule-time"
                    name="preferredTime"
                    placeholder="e.g. 2:00 PM EST, morning, afternoon..."
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="border-border/60 focus-visible:ring-primary/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your preferred time or time range in any format
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full healthcare-gradient border-0"
                  disabled={isSubmitting || !date || !platform}
                >
                  {isSubmitting ? (
                    "Scheduling..."
                  ) : (
                    <>
                      Schedule Call
                      <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
