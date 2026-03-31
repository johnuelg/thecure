import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  author_image_url: string | null;
  is_featured: boolean;
  display_order: number | null;
}

export function TestimonialsSection() {
  const { data: testimonials } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const items = testimonials ?? [];

  const next = useCallback(() => {
    if (items.length === 0) return;
    setDirection(1);
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setDirection(-1);
    setCurrent((c) => (c - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (!items.length) return null;

  const item = items[current];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.97,
    }),
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            What Clients Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Trusted by healthcare leaders and organizations worldwide.
          </p>
        </motion.div>

        <div className="relative pt-[100px]">
          {/* Floating avatar above card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`avatar-${item.id}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute top-0 left-0 right-0 flex justify-center z-10"
            >
              <div className="rounded-full p-1.5 bg-gradient-to-br from-primary to-primary/60 shadow-xl">
                <Avatar className="h-[200px] w-[200px] ring-4 ring-background">
                  <AvatarImage src={item.author_image_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-semibold">
                    {item.author_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel card */}
          <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border shadow-xl min-h-[320px] sm:min-h-[360px] flex items-center justify-center px-6 sm:px-8 pt-28 pb-8 sm:pt-32 sm:pb-10 md:px-20">
            {/* Decorative quote icons */}
            <Quote className="absolute top-6 left-6 h-10 w-10 text-muted-foreground/15 rotate-180" />
            <Quote className="absolute bottom-6 right-6 h-10 w-10 text-muted-foreground/15" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={item.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="flex flex-col items-center text-center w-full"
              >
                <p className="text-base sm:text-lg md:text-xl text-foreground/85 italic leading-relaxed mb-8 sm:mb-10 max-w-2xl">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between w-full max-w-md">
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase tracking-wide text-foreground">
                      {item.author_name}
                    </p>
                    {(item.author_title || item.author_company) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[item.author_title, item.author_company]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 sm:-translate-x-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 sm:translate-x-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {items.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
