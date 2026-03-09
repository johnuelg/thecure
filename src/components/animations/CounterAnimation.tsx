import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CounterAnimationProps {
  value: string; // e.g. "10+", "50+", "95%"
  className?: string;
}

export function CounterAnimation({ value, className }: CounterAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numericMatch = value.match(/(\d+)/);
    if (!numericMatch) {
      setDisplayed(value);
      return;
    }

    const target = parseInt(numericMatch[1], 10);
    const suffix = value.replace(/\d+/, "");
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplayed(`${current}${suffix}`);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className={className}>
      {displayed}
    </span>
  );
}
