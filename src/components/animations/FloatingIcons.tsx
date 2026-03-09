import { motion } from "framer-motion";
import { Stethoscope, Dna, BrainCircuit, HeartPulse, Pill, Microscope } from "lucide-react";

const floatingItems = [
  { Icon: Stethoscope, x: "10%", y: "15%", size: 28, duration: 18, delay: 0 },
  { Icon: Dna, x: "85%", y: "20%", size: 32, duration: 22, delay: 2 },
  { Icon: BrainCircuit, x: "75%", y: "70%", size: 26, duration: 20, delay: 4 },
  { Icon: HeartPulse, x: "20%", y: "75%", size: 24, duration: 16, delay: 1 },
  { Icon: Pill, x: "50%", y: "10%", size: 22, duration: 24, delay: 3 },
  { Icon: Microscope, x: "90%", y: "50%", size: 30, duration: 19, delay: 5 },
];

export function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map(({ Icon, x, y, size, duration, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.07]"
          style={{ left: x, top: y }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, 0, -8, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}
