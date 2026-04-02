import { useState } from "react";
import { motion } from "framer-motion";
import { ScheduleCallDialog } from "./ScheduleCallDialog";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  email: string | null;
  phone: string | null;
  location: string | null;
  contact_description: string | null;
  booking_url: string | null;
}

export function ContactSection() {
  const { ref: sectionRef, isInView } = useScrollAnimation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Fetch profile contact info
  const { data: profile } = useQuery({
    queryKey: ["public-profile-contact"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("email, phone, location, contact_description, booking_url")
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const sectionDescription = profile?.contact_description || 
    "Ready to bring AI innovation to your healthcare organization? Let's discuss how I can help you achieve your goals.";

  // Send email notification (non-blocking)
  const sendEmailNotification = async (data: { name: string; email: string; subject: string; message: string }) => {
    try {
      await supabase.functions.invoke("send-contact-notification", {
        body: {
          name: data.name,
          email: data.email,
          subject: data.subject || null,
          message: data.message,
        },
      });
    } catch (error) {
      // Log but don't fail the form submission if email fails
      console.error("Failed to send email notification:", error);
    }
  };

  // Submit contact form
  const submitMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; subject: string; message: string }) => {
      const { error } = await supabase
        .from("contact_submissions")
        .insert([{
          name: data.name,
          email: data.email,
          subject: data.subject || null,
          message: data.message,
        }]);
      
      if (error) throw error;
      
      // Send email notification in the background (non-blocking)
      sendEmailNotification(data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: profile?.email || "hello@example.com",
      href: `mailto:${profile?.email || "hello@example.com"}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: profile?.phone || "+1 (555) 123-4567",
      href: `tel:${profile?.phone?.replace(/\D/g, "") || "+15551234567"}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: profile?.location || "San Francisco, CA",
      href: "#",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section id="contact" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-badge">
            Contact
          </span>
          <h2 className="section-title">Let's Work Together</h2>
          <p className="section-description">
            {sectionDescription}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="card-medical p-6">
              <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <a
                    key={info.label}
                    href={info.href}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {info.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="card-medical p-6 healthcare-gradient text-primary-foreground">
              <h3 className="text-lg font-semibold mb-2">Schedule a Call</h3>
              <p className="text-sm opacity-90 mb-4">
                Prefer to talk? Book a free 30-minute discovery call to discuss 
                your project.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  const url = (profile as any)?.booking_url;
                  if (url) window.open(url, '_blank');
                }}
                disabled={!(profile as any)?.booking_url}
              >
                Book a Call
              </Button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="card-medical p-6 md:p-8">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. I'll review your message and get 
                    back to you within 1-2 business days.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@hospital.org"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Project inquiry"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">How can I help?</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell me about your project, challenges, or questions..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full healthcare-gradient border-0"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
